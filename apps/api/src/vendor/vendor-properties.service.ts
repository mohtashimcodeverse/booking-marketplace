import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  Prisma,
  PropertyDocumentType,
  PropertyMediaCategory,
  PropertyStatus,
} from '@prisma/client';
import { PrismaService } from '../modules/prisma/prisma.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  ReorderMediaDto,
  UpdateMediaCategoryDto,
  UploadPropertyDocumentDto,
} from './vendor-properties.dto';
import { UpdatePropertyLocationDto } from './dto/update-property-location.dto';

@Injectable()
export class VendorPropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------------------------------------------
   * Utilities
   * --------------------------------------------- */

  private slugify(input: string): string {
    const slug = input
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug.length > 180 ? slug.slice(0, 180).replace(/-+$/g, '') : slug;
  }

  private isSlugUniqueViolation(err: unknown): boolean {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false;
    if (err.code !== 'P2002') return false;

    const target = (err.meta as { target?: unknown } | undefined)?.target;
    if (Array.isArray(target)) return target.includes('slug');
    return false;
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    const b = base.trim();
    if (!b) {
      throw new BadRequestException('Invalid title/slug for slug generation.');
    }

    const existing = await this.prisma.property.findUnique({
      where: { slug: b },
      select: { id: true },
    });
    if (!existing) return b;

    for (let i = 2; i <= 50; i++) {
      const candidate = `${b}-${i}`.slice(0, 180).replace(/-+$/g, '');
      const exists = await this.prisma.property.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!exists) return candidate;
    }

    throw new BadRequestException(
      'Could not generate a unique slug. Try a different title.',
    );
  }

  private async assertOwnership(vendorUserId: string, propertyId: string) {
    const prop = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { media: true },
    });

    if (!prop) throw new NotFoundException('Property not found.');
    if (prop.vendorId !== vendorUserId) {
      throw new ForbiddenException('Not your property.');
    }

    return prop;
  }

  private normalizeOptionalString(input?: string | null) {
    const v = input?.trim();
    return v ? v : null;
  }

  private ensureCoords(lat: number, lng: number) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('Invalid coordinates.');
    }
    if (lat < -90 || lat > 90)
      throw new BadRequestException('Invalid latitude.');
    if (lng < -180 || lng > 180)
      throw new BadRequestException('Invalid longitude.');
  }

  private shouldResetToDraftOnVendorEdit(status: PropertyStatus): boolean {
    // ✅ Production-safety rule:
    // Any meaningful change to an approved/reviewed/published listing must re-enter workflow.
    return (
      status === PropertyStatus.APPROVED ||
      status === PropertyStatus.UNDER_REVIEW ||
      status === PropertyStatus.PUBLISHED
    );
  }

  /* ---------------------------------------------
   * Queries
   * --------------------------------------------- */

  async listMine(vendorUserId: string) {
    const items = await this.prisma.property.findMany({
      where: { vendorId: vendorUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    return { items };
  }

  async getOne(vendorUserId: string, propertyId: string) {
    await this.assertOwnership(vendorUserId, propertyId);

    return this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        amenities: { include: { amenity: true } },
        location: true,
      },
    });
  }

  /* ---------------------------------------------
   * Amenities (Batch V3)
   * --------------------------------------------- */

  async listAmenitiesCatalog() {
    const amenities = await this.prisma.amenity.findMany({
      orderBy: [{ groupId: 'asc' }, { name: 'asc' }],
      include: { group: true },
    });

    const groupsMap = new Map<
      string,
      {
        group: { id: string; name: string } | null;
        amenities: Array<{
          id: string;
          key: string;
          name: string;
          icon: string | null;
          groupId: string | null;
        }>;
      }
    >();

    for (const a of amenities) {
      const key = a.group ? a.group.id : '__none__';

      const item = {
        id: a.id,
        key: a.key,
        name: a.name,
        icon: a.icon ?? null,
        groupId: a.groupId ?? null,
      };

      const existing = groupsMap.get(key);
      if (existing) existing.amenities.push(item);
      else {
        groupsMap.set(key, {
          group: a.group ? { id: a.group.id, name: a.group.name } : null,
          amenities: [item],
        });
      }
    }

    const amenitiesGrouped = Array.from(groupsMap.values()).sort((x, y) => {
      const ax = x.group?.name ?? 'Other';
      const by = y.group?.name ?? 'Other';
      return ax.localeCompare(by);
    });

    return { amenitiesGrouped };
  }

  async getAmenitiesForProperty(vendorUserId: string, propertyId: string) {
    await this.assertOwnership(vendorUserId, propertyId);

    const rows = await this.prisma.propertyAmenity.findMany({
      where: { propertyId },
      select: { amenityId: true },
    });

    return { amenityIds: rows.map((r) => r.amenityId) };
  }

  async setAmenities(
    vendorUserId: string,
    propertyId: string,
    amenityIds: string[],
  ) {
    const prop = await this.assertOwnership(vendorUserId, propertyId);

    const ids = Array.from(
      new Set((amenityIds ?? []).map((x) => String(x).trim()).filter(Boolean)),
    );

    const found = await this.prisma.amenity.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    if (found.length !== ids.length) {
      throw new BadRequestException('One or more amenities are invalid.');
    }

    await this.prisma.$transaction([
      this.prisma.propertyAmenity.deleteMany({ where: { propertyId } }),
      ...(ids.length > 0
        ? [
            this.prisma.propertyAmenity.createMany({
              data: ids.map((amenityId) => ({ propertyId, amenityId })),
            }),
          ]
        : []),
    ]);

    if (this.shouldResetToDraftOnVendorEdit(prop.status)) {
      await this.prisma.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.DRAFT },
      });
    }

    return this.getOne(vendorUserId, propertyId);
  }

  /* ---------------------------------------------
   * Create / Update
   * --------------------------------------------- */

  async create(vendorUserId: string, dto: CreatePropertyDto) {
    const rawBase = dto.slug?.trim() ? dto.slug : dto.title;
    const baseSlug = this.slugify(rawBase);

    // Edge-case: title like "----" becomes empty slug
    const safeBase = baseSlug && baseSlug.length > 0 ? baseSlug : 'property';

    // Generate candidate slug (nice UX), but still race-safe below
    let slug = await this.generateUniqueSlug(safeBase);

    // ✅ Concurrency-safe create:
    // Even after checking, slug can still collide under concurrent creates.
    // Retry on P2002 (slug) with a new unique slug.
    for (let attempt = 1; attempt <= 8; attempt++) {
      try {
        return await this.prisma.property.create({
          data: {
            vendorId: vendorUserId,
            title: dto.title.trim(),
            slug,
            description: dto.description?.trim() || null,
            city: dto.city.trim(),
            area: dto.area?.trim() || null,
            address: dto.address?.trim() || null,
            lat: dto.lat ?? null,
            lng: dto.lng ?? null,
            maxGuests: dto.maxGuests ?? 2,
            bedrooms: dto.bedrooms ?? 1,
            bathrooms: dto.bathrooms ?? 1,
            basePrice: dto.basePrice,
            cleaningFee: dto.cleaningFee ?? 0,
            currency: dto.currency ?? 'PKR',
            minNights: dto.minNights ?? 1,
            maxNights: dto.maxNights ?? null,
            checkInFromMin: dto.checkInFromMin ?? null,
            checkInToMax: dto.checkInToMax ?? null,
            checkOutMin: dto.checkOutMin ?? null,
            isInstantBook: dto.isInstantBook ?? false,
            status: PropertyStatus.DRAFT,
          },
        });
      } catch (err) {
        if (!this.isSlugUniqueViolation(err)) throw err;

        if (attempt <= 6) {
          slug = await this.generateUniqueSlug(safeBase);
        } else {
          const rand = Math.random().toString(36).slice(2, 6);
          slug = `${safeBase}-${Date.now()}-${rand}`
            .slice(0, 180)
            .replace(/-+$/g, '');
        }
      }
    }

    throw new BadRequestException(
      'Could not create property due to slug conflicts. Please retry.',
    );
  }

  async update(
    vendorUserId: string,
    propertyId: string,
    dto: UpdatePropertyDto,
  ) {
    const prop = await this.assertOwnership(vendorUserId, propertyId);

    let slug: string | undefined;
    if (dto.slug?.trim()) {
      const base = this.slugify(dto.slug);
      const existing = await this.prisma.property.findUnique({
        where: { slug: base },
      });
      slug =
        existing && existing.id !== propertyId
          ? await this.generateUniqueSlug(base)
          : base;
    }

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        title: dto.title?.trim(),
        slug,
        description: dto.description?.trim(),
        city: dto.city?.trim(),
        area: dto.area?.trim(),
        address: dto.address?.trim(),
        lat: dto.lat,
        lng: dto.lng,
        locationId: dto.locationId,
        maxGuests: dto.maxGuests,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        basePrice: dto.basePrice,
        cleaningFee: dto.cleaningFee,
        currency: dto.currency,
        minNights: dto.minNights,
        maxNights: dto.maxNights,
        checkInFromMin: dto.checkInFromMin,
        checkInToMax: dto.checkInToMax,
        checkOutMin: dto.checkOutMin,
        isInstantBook: dto.isInstantBook,
      },
    });

    if (this.shouldResetToDraftOnVendorEdit(prop.status)) {
      await this.prisma.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.DRAFT },
      });
      return this.prisma.property.findUnique({ where: { id: propertyId } });
    }

    return updated;
  }

  /**
   * ✅ Portal-driven location update (Google Maps pin → backend)
   * Production safety: if listing is PUBLISHED/APPROVED/UNDER_REVIEW, location change forces DRAFT.
   */
  async updateLocation(
    vendorUserId: string,
    propertyId: string,
    dto: UpdatePropertyLocationDto,
  ) {
    const prop = await this.assertOwnership(vendorUserId, propertyId);

    if (prop.status === PropertyStatus.SUSPENDED) {
      throw new BadRequestException(
        'Property is suspended. Contact support to update location.',
      );
    }
    if (prop.status === PropertyStatus.REJECTED) {
      throw new BadRequestException(
        'Property is rejected. Contact support or create a new listing.',
      );
    }

    const city = dto.city.trim();
    if (!city) throw new BadRequestException('city is required.');

    this.ensureCoords(dto.lat, dto.lng);

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        city,
        area: this.normalizeOptionalString(dto.area),
        address: this.normalizeOptionalString(dto.address),
        lat: dto.lat,
        lng: dto.lng,
      },
    });

    if (this.shouldResetToDraftOnVendorEdit(prop.status)) {
      await this.prisma.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.DRAFT },
      });
      return this.prisma.property.findUnique({ where: { id: propertyId } });
    }

    return updated;
  }

  /* ---------------------------------------------
   * Review workflow
   * --------------------------------------------- */

  async submitForReview(vendorUserId: string, propertyId: string) {
    const prop = await this.assertOwnership(vendorUserId, propertyId);

    if (
      prop.status !== PropertyStatus.DRAFT &&
      prop.status !== PropertyStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException(
        'Property must be in DRAFT or CHANGES_REQUESTED to submit for review.',
      );
    }

    const [media, docs] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where: { propertyId },
        select: { id: true, category: true },
      }),
      this.prisma.propertyDocument.findMany({
        where: { propertyId },
        select: { id: true, type: true },
      }),
    ]);

    const missingLines: string[] = [];

    if (prop.lat == null || prop.lng == null) {
      missingLines.push(
        `- Set the property location on the map (lat/lng required).`,
      );
    }

    if (media.length < 4) {
      missingLines.push(
        `- Upload at least 4 photos (currently ${media.length}).`,
      );
    }

    const requiredCategories: PropertyMediaCategory[] = [
      PropertyMediaCategory.LIVING_ROOM,
      PropertyMediaCategory.BEDROOM,
      PropertyMediaCategory.BATHROOM,
      PropertyMediaCategory.KITCHEN,
    ];

    const present = new Set<PropertyMediaCategory>();
    for (const m of media) {
      if (m.category && requiredCategories.includes(m.category)) {
        present.add(m.category);
      }
    }

    const missingCategories = requiredCategories.filter((c) => !present.has(c));

    if (missingCategories.length > 0) {
      missingLines.push(
        `- Tag photos with categories (missing: ${missingCategories.join(', ')}).`,
      );
    }

    const hasOwnershipProof = docs.some(
      (d) => d.type === PropertyDocumentType.OWNERSHIP_PROOF,
    );
    if (!hasOwnershipProof) {
      missingLines.push(`- Upload document: OWNERSHIP_PROOF.`);
    }

    if (missingLines.length > 0) {
      throw new BadRequestException(
        `Cannot submit for review. Please complete:\n${missingLines.join('\n')}`,
      );
    }

    return this.prisma.property.update({
      where: { id: propertyId },
      data: { status: PropertyStatus.UNDER_REVIEW },
    });
  }

  async publish(vendorUserId: string, propertyId: string) {
    const prop = await this.assertOwnership(vendorUserId, propertyId);

    if (prop.status !== PropertyStatus.APPROVED) {
      throw new BadRequestException(
        'Property must be approved before publishing.',
      );
    }

    if (prop.lat == null || prop.lng == null) {
      throw new BadRequestException(
        'Property must have a map location (lat/lng) before publishing.',
      );
    }

    return this.prisma.property.update({
      where: { id: propertyId },
      data: { status: PropertyStatus.PUBLISHED },
    });
  }

  async unpublish(vendorUserId: string, propertyId: string) {
    const prop = await this.assertOwnership(vendorUserId, propertyId);

    if (prop.status !== PropertyStatus.PUBLISHED) {
      throw new BadRequestException('Property is not published.');
    }

    return this.prisma.property.update({
      where: { id: propertyId },
      data: { status: PropertyStatus.DRAFT },
    });
  }

  /* ---------------------------------------------
   * Media
   * --------------------------------------------- */

  async addMedia(
    vendorUserId: string,
    propertyId: string,
    file: Express.Multer.File,
  ) {
    await this.assertOwnership(vendorUserId, propertyId);

    const last = await this.prisma.media.findFirst({
      where: { propertyId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const created = await this.prisma.media.create({
      data: {
        propertyId,
        url: `/uploads/properties/images/${file.filename}`,
        sortOrder: last ? last.sortOrder + 1 : 0,
        category: PropertyMediaCategory.OTHER,
      },
    });

    const prop = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (prop && this.shouldResetToDraftOnVendorEdit(prop.status)) {
      await this.prisma.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.DRAFT },
      });
    }

    return created;
  }

  async updateMediaCategory(
    vendorUserId: string,
    propertyId: string,
    mediaId: string,
    dto: UpdateMediaCategoryDto,
  ) {
    const prop = await this.assertOwnership(vendorUserId, propertyId);

    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media || media.propertyId !== propertyId) {
      throw new NotFoundException('Media not found.');
    }

    const updated = await this.prisma.media.update({
      where: { id: mediaId },
      data: { category: dto.category },
    });

    if (this.shouldResetToDraftOnVendorEdit(prop.status)) {
      await this.prisma.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.DRAFT },
      });
    }

    return updated;
  }

  async reorderMedia(
    vendorUserId: string,
    propertyId: string,
    dto: ReorderMediaDto,
  ) {
    const prop = await this.assertOwnership(vendorUserId, propertyId);

    await this.prisma.$transaction(
      dto.orderedMediaIds.map((id, index) =>
        this.prisma.media.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    if (this.shouldResetToDraftOnVendorEdit(prop.status)) {
      await this.prisma.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.DRAFT },
      });
    }

    return this.prisma.media.findMany({
      where: { propertyId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /* ---------------------------------------------
   * Documents
   * --------------------------------------------- */

  async addDocument(
    vendorUserId: string,
    propertyId: string,
    dto: UploadPropertyDocumentDto,
    file: Express.Multer.File,
  ) {
    const prop = await this.assertOwnership(vendorUserId, propertyId);

    const created = await this.prisma.propertyDocument.create({
      data: {
        propertyId,
        type: dto.type,
        uploadedByUserId: vendorUserId,
        storageKey: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        url: null,
      },
    });

    const url = `/api/vendor/properties/${propertyId}/documents/${created.id}/download`;
    const doc = await this.prisma.propertyDocument.update({
      where: { id: created.id },
      data: { url },
    });

    if (this.shouldResetToDraftOnVendorEdit(prop.status)) {
      await this.prisma.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.DRAFT },
      });
    }

    return doc;
  }

  async getDocumentDownload(params: {
    actorUserId: string;
    actorRole: 'VENDOR' | 'ADMIN';
    propertyId: string;
    documentId: string;
  }) {
    const { actorUserId, actorRole, propertyId, documentId } = params;

    if (actorRole === 'VENDOR') {
      await this.assertOwnership(actorUserId, propertyId);
    }

    const doc = await this.prisma.propertyDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.propertyId !== propertyId) {
      throw new NotFoundException('Document not found.');
    }

    const storageKey =
      doc.storageKey ?? (doc.url ? doc.url.split('/').pop() : null);

    if (!storageKey) {
      throw new NotFoundException('Document file is missing.');
    }

    const privatePath = join(
      process.cwd(),
      'private_uploads',
      'properties',
      'documents',
      storageKey,
    );

    const legacyPath = join(
      process.cwd(),
      'uploads',
      'properties',
      'documents',
      storageKey,
    );

    const absolutePath = existsSync(privatePath)
      ? privatePath
      : existsSync(legacyPath)
        ? legacyPath
        : null;

    if (!absolutePath) {
      throw new NotFoundException('Document file not found on disk.');
    }

    return {
      doc,
      absolutePath,
      downloadName: doc.originalName ?? storageKey,
      mimeType: doc.mimeType ?? 'application/octet-stream',
    };
  }
}
