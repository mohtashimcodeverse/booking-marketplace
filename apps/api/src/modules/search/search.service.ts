import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, PropertyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchPropertiesQuery } from './dto/search-properties.query';
import { SearchMapQuery } from './dto/search-map.query';
import { SearchMapViewportQuery } from './dto/search-map-viewport.query';

type CacheEntry<T> = { expiresAt: number; value: T };

// Simple in-memory TTL cache (safe fallback).
// You can later replace this with Redis without changing API contracts.
const memCache = new Map<string, CacheEntry<unknown>>();
function cacheGet<T>(key: string): T | null {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return entry.value as T;
}
function cacheSet<T>(key: string, value: T, ttlMs: number) {
  memCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
function stableStringify(obj: object) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

function parseISODateOnly(s: string): Date {
  // expects YYYY-MM-DD
  // Always parse as UTC midnight for consistency
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
  }
  const d = new Date(`${s}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new BadRequestException('Invalid date.');
  return d;
}

function nightsBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  const nights = Math.floor(ms / (24 * 60 * 60 * 1000));
  return nights;
}

function parseAmenityKeys(raw?: string): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  );
}

type SearchQueryLike = {
  q?: string;
  city?: string;
  area?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  north?: number;
  south?: number;
  east?: number;
  west?: number;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  checkIn?: string;
  checkOut?: string;
  amenities?: string;
};

type SearchCard = {
  id: string;
  slug: string;
  title: string;
  location: {
    city: string | null;
    area: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
  };
  capacity: {
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
  };
  coverImage: {
    url: string;
    alt: string | null;
    category: string;
  } | null;
  media: Array<{
    url: string;
    alt: string | null;
    category: string;
    sortOrder: number;
  }>;
  pricing: {
    nightly: number;
    cleaningFee: number;
    currency: string;
    totalForStay?: number;
    nights?: number;
  };
  flags: {
    instantBook: boolean;
  };
};

type SearchPoint = {
  propertyId: string;
  lat: number;
  lng: number;
  priceFrom: number;
  currency: string;
};

type SearchPropertiesResult = {
  ok: true;
  query: SearchPropertiesQuery & {
    page: number;
    limit: number;
    pageSize: number;
  };
  items: SearchCard[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

type SearchMapResult = {
  ok: true;
  query: SearchMapQuery;
  points: SearchPoint[];
};

type SearchMapViewportResult = {
  ok: true;
  query: SearchMapViewportQuery;
  points: SearchPoint[];
};

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  private buildGeoFilter(params: {
    lat?: number;
    lng?: number;
    radiusKm?: number;
    north?: number;
    south?: number;
    east?: number;
    west?: number;
  }): Prisma.PropertyWhereInput | null {
    const { lat, lng, radiusKm, north, south, east, west } = params;

    // Viewport bounds query (preferred when map is active)
    const hasBounds =
      north !== undefined &&
      south !== undefined &&
      east !== undefined &&
      west !== undefined;

    if (hasBounds) {
      // Anti-meridian support:
      // - normal: west <= east => lng BETWEEN west AND east
      // - wrap:   west > east  => (lng >= west) OR (lng <= east)
      const latClause: Prisma.PropertyWhereInput = {
        lat: { not: null, gte: south, lte: north },
      };

      if (west <= east) {
        return {
          ...latClause,
          lng: { not: null, gte: west, lte: east },
        };
      }

      // Wrap across -180/180: keep lat range AND apply OR on lng.
      return {
        AND: [
          latClause,
          {
            OR: [
              { lng: { not: null, gte: west } },
              { lng: { not: null, lte: east } },
            ],
          },
        ],
      };
    }

    // Radius query (approx bounding box; no PostGIS needed for V1)
    const hasRadius =
      lat !== undefined && lng !== undefined && radiusKm !== undefined;
    if (hasRadius) {
      const latDelta = radiusKm / 111; // ~111km per degree latitude
      const cos = Math.cos((lat * Math.PI) / 180);
      const lngDelta = radiusKm / (111 * Math.max(cos, 0.1)); // avoid division near poles
      return {
        lat: { not: null, gte: lat - latDelta, lte: lat + latDelta },
        lng: { not: null, gte: lng - lngDelta, lte: lng + lngDelta },
      };
    }

    return null;
  }

  /**
   * Availability filter (best policy): if checkIn/checkOut are provided,
   * only return properties that are bookable for the full range.
   *
   * Rules:
   * - No BLOCKED calendar day in [checkIn, checkOut)
   * - No overlapping non-cancelled booking
   * - No overlapping ACTIVE hold that hasn't expired
   */
  private buildAvailabilityWhere(
    checkIn?: Date,
    checkOut?: Date,
  ): Prisma.PropertyWhereInput | null {
    if (!checkIn || !checkOut) return null;

    return {
      AND: [
        // No blocked calendar days inside stay range (checkIn inclusive, checkOut exclusive)
        {
          NOT: {
            calendarDays: {
              some: {
                status: 'BLOCKED',
                date: { gte: checkIn, lt: checkOut },
              },
            },
          },
        },

        // No overlapping bookings (exclude CANCELLED only)
        {
          NOT: {
            bookings: {
              some: {
                status: { not: 'CANCELLED' },
                AND: [
                  { checkIn: { lt: checkOut } },
                  { checkOut: { gt: checkIn } },
                ],
              },
            },
          },
        },

        // No overlapping ACTIVE holds that are not expired
        {
          NOT: {
            holds: {
              some: {
                status: 'ACTIVE',
                expiresAt: { gt: new Date() },
                AND: [
                  { checkIn: { lt: checkOut } },
                  { checkOut: { gt: checkIn } },
                ],
              },
            },
          },
        },
      ],
    };
  }

  private buildCoreWhere(
    q: SearchPropertiesQuery | SearchMapQuery | SearchMapViewportQuery,
  ) {
    const query: SearchQueryLike = q;

    const geo = this.buildGeoFilter({
      lat: query.lat,
      lng: query.lng,
      radiusKm: query.radiusKm,
      north: query.north,
      south: query.south,
      east: query.east,
      west: query.west,
    });

    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.PUBLISHED,
    };

    if (q.city) where.city = q.city;
    if (q.area) where.area = q.area;
    if (query.q?.trim()) {
      const term = query.q.trim();
      where.OR = [
        { title: { contains: term, mode: Prisma.QueryMode.insensitive } },
        { city: { contains: term, mode: Prisma.QueryMode.insensitive } },
        { area: { contains: term, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    // Guests filtering: require property.maxGuests >= requested
    const guests = query.guests;
    if (guests !== undefined) {
      where.maxGuests = { gte: guests };
    }

    // Optional filters (if provided)
    const minPrice = query.minPrice;
    const maxPrice = query.maxPrice;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }

    const bedrooms = query.bedrooms;
    if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms };

    const bathrooms = query.bathrooms;
    if (bathrooms !== undefined) where.bathrooms = { gte: bathrooms };

    const maxGuests = query.maxGuests;
    if (maxGuests !== undefined) where.maxGuests = { gte: maxGuests };

    const and: Prisma.PropertyWhereInput[] = [];
    if (geo) and.push(geo);

    const amenityKeys = parseAmenityKeys(query.amenities);
    for (const key of amenityKeys) {
      and.push({
        amenities: {
          some: {
            amenity: {
              key: { equals: key, mode: Prisma.QueryMode.insensitive },
            },
          },
        },
      });
    }

    // Dates availability
    const checkInStr = query.checkIn;
    const checkOutStr = query.checkOut;
    if (checkInStr && checkOutStr) {
      const checkIn = parseISODateOnly(checkInStr);
      const checkOut = parseISODateOnly(checkOutStr);
      if (!(checkOut > checkIn))
        throw new BadRequestException('checkOut must be after checkIn');

      const stayNights = nightsBetween(checkIn, checkOut);
      if (stayNights <= 0) throw new BadRequestException('Invalid date range');

      // enforce min nights at search level (max nights optional)
      and.push({ minNights: { lte: stayNights } });
      and.push({
        OR: [{ maxNights: null }, { maxNights: { gte: stayNights } }],
      });

      const avail = this.buildAvailabilityWhere(checkIn, checkOut);
      if (avail) and.push(avail);
    }

    if (and.length > 0) where.AND = and;

    return where;
  }

  private buildOrderBy(
    sort?: string,
  ): Prisma.PropertyOrderByWithRelationInput[] {
    switch (sort) {
      case 'price_asc':
        return [{ basePrice: 'asc' }, { id: 'asc' }];
      case 'price_desc':
        return [{ basePrice: 'desc' }, { id: 'asc' }];
      case 'newest':
        return [{ createdAt: 'desc' }, { id: 'asc' }];
      case 'recommended':
      default:
        // V1 recommended = newest first (we’ll later evolve with scoring)
        return [{ createdAt: 'desc' }, { id: 'asc' }];
    }
  }

  private validateViewportBounds(q: SearchMapViewportQuery) {
    const { north, south, east, west } = q;

    if (!(north > south)) {
      throw new BadRequestException('Invalid viewport: north must be > south.');
    }

    // ✅ Allow anti-meridian wrapping:
    // - normal: west <= east
    // - wrap:   west > east  (crosses -180/180)
    // We only ensure values are within [-180, 180] via DTO validators.
    // Here we only compute “span” correctly for safety limits.
    const latSpan = north - south;

    // Compute lng span considering wrap.
    // Example: west=170, east=-170 => span = (180-170) + (-170 - (-180)) = 10 + 10 = 20
    const lngSpan = west <= east ? east - west : 180 - west + (east - -180);

    // Safety: prevent massive “whole-world” queries from map UI bugs.
    const MAX_LAT_SPAN = 5; // ~555km
    const MAX_LNG_SPAN = 5; // still generous for map viewport; tune later

    if (latSpan > MAX_LAT_SPAN || lngSpan > MAX_LNG_SPAN) {
      throw new BadRequestException(
        `Viewport too large. Please zoom in more. (max span: ${MAX_LAT_SPAN}° lat, ${MAX_LNG_SPAN}° lng)`,
      );
    }
  }

  async searchProperties(
    q: SearchPropertiesQuery,
  ): Promise<SearchPropertiesResult> {
    const page = q.page ?? 1;
    const limit = q.limit ?? q.pageSize ?? 20;
    const skip = (page - 1) * limit;

    // Cache policy:
    // - if dates are provided: short TTL (freshness matters)
    // - otherwise: slightly longer TTL
    const hasDates = Boolean(q.checkIn && q.checkOut);
    const ttlMs = hasDates ? 30_000 : 90_000;

    const cacheKey = `search:properties:${stableStringify({
      ...q,
      page,
      limit,
      pageSize: limit,
    })}`;
    const cached = cacheGet<SearchPropertiesResult>(cacheKey);
    if (cached) return cached;

    const where = this.buildCoreWhere(q);
    const orderBy = this.buildOrderBy(q.sort);

    const [total, rows] = await Promise.all([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          city: true,
          area: true,
          address: true,
          lat: true,
          lng: true,
          bedrooms: true,
          bathrooms: true,
          maxGuests: true,
          basePrice: true,
          cleaningFee: true,
          currency: true,
          isInstantBook: true,
          createdAt: true,
          media: {
            orderBy: { sortOrder: 'asc' },
            take: 8,
            select: { url: true, alt: true, category: true, sortOrder: true },
          },
        },
      }),
    ]);

    let stay: null | { nights: number; checkIn: string; checkOut: string } =
      null;
    if (q.checkIn && q.checkOut) {
      const checkIn = parseISODateOnly(q.checkIn);
      const checkOut = parseISODateOnly(q.checkOut);
      const nights = nightsBetween(checkIn, checkOut);
      stay = { nights, checkIn: q.checkIn, checkOut: q.checkOut };
    }

    const items = rows.map((p) => {
      const cover = p.media?.[0] ?? null;

      // Portal-driven pricing:
      // - always return nightly base
      // - if stay provided: also return total for stay (base*nights + cleaning)
      const price = {
        nightly: p.basePrice,
        cleaningFee: p.cleaningFee,
        currency: p.currency,
        ...(stay
          ? {
              totalForStay: p.basePrice * stay.nights + p.cleaningFee,
              nights: stay.nights,
            }
          : {}),
      };

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        location: {
          city: p.city,
          area: p.area,
          address: p.address,
          lat: p.lat,
          lng: p.lng,
        },
        capacity: {
          maxGuests: p.maxGuests,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
        },
        coverImage: cover
          ? { url: cover.url, alt: cover.alt, category: cover.category }
          : null,
        media: (p.media ?? []).map((m) => ({
          url: m.url,
          alt: m.alt,
          category: m.category,
          sortOrder: m.sortOrder,
        })),
        pricing: price,
        flags: {
          instantBook: p.isInstantBook,
        },
      };
    });

    const result: SearchPropertiesResult = {
      ok: true,
      query: {
        ...q,
        page,
        limit,
        pageSize: limit,
      },
      items,
      meta: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
      // facets: {} // can be added later in a portal-driven way
    };

    cacheSet(cacheKey, result, ttlMs);
    return result;
  }

  async searchMap(q: SearchMapQuery): Promise<SearchMapResult> {
    // Map endpoints often need bigger limits than cards.
    // Still enforce safety to avoid insane payloads.
    const hasDates = Boolean(q.checkIn && q.checkOut);
    const ttlMs = hasDates ? 30_000 : 90_000;

    const cacheKey = `search:map:${stableStringify(q)}`;
    const cached = cacheGet<SearchMapResult>(cacheKey);
    if (cached) return cached;

    const where = this.buildCoreWhere(q);

    // IMPORTANT: Map needs only points; keep selection minimal.
    const rows = await this.prisma.property.findMany({
      where,
      take: 2000,
      orderBy: [{ basePrice: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        lat: true,
        lng: true,
        basePrice: true,
        currency: true,
      },
    });

    const points = rows
      .filter((r) => r.lat !== null && r.lng !== null)
      .map((r) => ({
        propertyId: r.id,
        lat: r.lat!,
        lng: r.lng!,
        priceFrom: r.basePrice,
        currency: r.currency,
      }));

    const result: SearchMapResult = {
      ok: true,
      query: q,
      points,
    };

    cacheSet(cacheKey, result, ttlMs);
    return result;
  }

  /**
   * ✅ Google Maps viewport markers (pan/zoom)
   * Returns markers only inside the visible bounds.
   */
  async searchMapViewport(
    q: SearchMapViewportQuery,
  ): Promise<SearchMapViewportResult> {
    this.validateViewportBounds(q);

    const hasDates = Boolean(q.checkIn && q.checkOut);

    // Cache shorter for map viewport because users pan quickly
    const ttlMs = hasDates ? 20_000 : 45_000;

    const cacheKey = `search:map-viewport:${stableStringify(q)}`;
    const cached = cacheGet<SearchMapViewportResult>(cacheKey);
    if (cached) return cached;

    const where = this.buildCoreWhere(q);

    const rows = await this.prisma.property.findMany({
      where,
      take: 2500,
      orderBy: [{ basePrice: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        lat: true,
        lng: true,
        basePrice: true,
        currency: true,
      },
    });

    const points = rows
      .filter((r) => r.lat !== null && r.lng !== null)
      .map((r) => ({
        propertyId: r.id,
        lat: r.lat!,
        lng: r.lng!,
        priceFrom: r.basePrice,
        currency: r.currency,
      }));

    const result: SearchMapViewportResult = {
      ok: true,
      query: q,
      points,
    };

    cacheSet(cacheKey, result, ttlMs);
    return result;
  }
}
