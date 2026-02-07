import { Injectable } from '@nestjs/common';
import { Prisma, PropertyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListPropertiesDto } from './dto/list-properties.dto';

type AmenityGroupDto = {
  id: string;
  key: string;
  name: string;
  sortOrder: number;
};

type AmenityDto = {
  id: string;
  key: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  group: AmenityGroupDto | null;
};

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(input: ListPropertiesDto) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.PUBLISHED,
      ...(input.city
        ? { city: { equals: input.city, mode: Prisma.QueryMode.insensitive } }
        : {}),
      ...(input.q
        ? {
            OR: [
              {
                title: {
                  contains: input.q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                area: { contains: input.q, mode: Prisma.QueryMode.insensitive },
              },
              {
                city: { contains: input.q, mode: Prisma.QueryMode.insensitive },
              },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      input.sort === 'price_asc'
        ? { basePrice: 'asc' }
        : input.sort === 'price_desc'
          ? { basePrice: 'desc' }
          : { createdAt: 'desc' };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          area: true,
          maxGuests: true,
          bedrooms: true,
          bathrooms: true,
          basePrice: true,
          cleaningFee: true,
          currency: true,
          media: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
            select: { url: true, alt: true },
          },
        },
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: items.map((p) => ({
        ...p,
        cover: p.media[0] ?? null,
      })),
    };
  }

  async bySlug(slug: string) {
    // ✅ Public safety: only show PUBLISHED listings
    const property = await this.prisma.property.findFirst({
      where: { slug, status: PropertyStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        city: true,
        area: true,
        address: true,
        lat: true,
        lng: true,
        maxGuests: true,
        bedrooms: true,
        bathrooms: true,
        basePrice: true,
        cleaningFee: true,
        currency: true,
        status: true,
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { url: true, alt: true, sortOrder: true, category: true },
        },

        // ✅ Amenities + groups (Frank Porter style)
        amenities: {
          select: {
            amenity: {
              select: {
                id: true,
                key: true,
                name: true,
                icon: true,
                sortOrder: true,
                isActive: true,
                group: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                    sortOrder: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!property) return null;

    const amenities: AmenityDto[] = (property.amenities ?? [])
      .map((pa) => pa.amenity)
      .filter((a) => a.isActive)
      .sort((a, b) => {
        const ga = a.group?.sortOrder ?? 9999;
        const gb = b.group?.sortOrder ?? 9999;
        if (ga !== gb) return ga - gb;

        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;

        return a.name.localeCompare(b.name);
      });

    const groupsMap = new Map<
      string,
      { group: AmenityGroupDto | null; amenities: AmenityDto[] }
    >();

    for (const a of amenities) {
      const key = a.group?.id ?? 'ungrouped';
      const existing = groupsMap.get(key);
      if (existing) existing.amenities.push(a);
      else groupsMap.set(key, { group: a.group ?? null, amenities: [a] });
    }

    const amenitiesGrouped = Array.from(groupsMap.values()).sort((x, y) => {
      const sx = x.group?.sortOrder ?? 9999;
      const sy = y.group?.sortOrder ?? 9999;
      if (sx !== sy) return sx - sy;

      const nx = x.group?.name ?? 'Other';
      const ny = y.group?.name ?? 'Other';
      return nx.localeCompare(ny);
    });

    return {
      ...property,
      amenities,
      amenitiesGrouped,
    };
  }
}
