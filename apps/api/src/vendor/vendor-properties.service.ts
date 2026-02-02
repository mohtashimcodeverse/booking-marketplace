import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  ReorderMediaDto,
} from './vendor-properties.dto';

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

  private async generateUniqueSlug(base: string): Promise<string> {
    if (!base) {
      throw new BadRequestException('Unable to generate slug.');
    }

    const existing = await this.prisma.property.findUnique({
      where: { slug: base },
    });
    if (!existing) return base;

    for (let i = 2; i <= 50; i++) {
      const candidate = `${base}-${i}`.slice(0, 180).replace(/-+$/g, '');
      const exists = await this.prisma.property.findUnique({
        where: { slug: candidate },
      });
      if (!exists) return candidate;
    }

    throw new BadRequestException(
      'Could not generate a unique slug. Try a different title.',
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
      },
    });

    return { items };
  }

  /* ---------------------------------------------
   * Create
   * --------------------------------------------- */

  async create(vendorUserId: string, dto: CreatePropertyDto) {
    const title = dto.title?.trim();
    const city = dto.city?.trim();

    if (!title) throw new BadRequestException('title is required.');
    if (!city) throw new BadRequestException('city is required.');

    if (!Number.isInteger(dto.basePrice) || dto.basePrice <= 0) {
      throw new BadRequestException('basePrice must be a positive integer.');
    }

    const baseSlug = dto.slug?.trim()
      ? this.slugify(dto.slug.trim())
      : this.slugify(title);

    const slug = await this.generateUniqueSlug(baseSlug);

    return this.prisma.property.create({
      data: {
        vendorId: vendorUserId,
        title,
        slug,
        description: dto.description?.trim() || null,

        city,
        area: dto.area?.trim() || null,
        address: dto.address?.trim() || null,
        lat: dto.lat ?? null,
        lng: dto.lng ?? null,

        maxGuests: dto.maxGuests ?? 2,
        bedrooms: dto.bedrooms ?? 1,
        bathrooms: dto.bathrooms ?? 1,

        basePrice: dto.basePrice,
        cleaningFee: dto.cleaningFee ?? 0,
        currency: dto.currency?.trim() || 'PKR',

        // 🔒 Status is INTERNAL only
        status: 'DRAFT',

        minNights: dto.minNights ?? 1,
        maxNights: dto.maxNights ?? null,
        checkInFromMin: dto.checkInFromMin ?? null,
        checkInToMax: dto.checkInToMax ?? null,
        checkOutMin: dto.checkOutMin ?? null,
        isInstantBook: dto.isInstantBook ?? false,
      },
    });
  }

  /* ---------------------------------------------
   * Ownership
   * --------------------------------------------- */

  private async assertOwnership(vendorUserId: string, propertyId: string) {
    const prop = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { media: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!prop) throw new NotFoundException('Property not found.');
    if (prop.vendorId !== vendorUserId) {
      throw new ForbiddenException('Not your property.');
    }

    return prop;
  }

  /* ---------------------------------------------
   * Read
   * --------------------------------------------- */

  async getOne(vendorUserId: string, propertyId: string) {
    await this.assertOwnership(vendorUserId, propertyId);

    return this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        amenities: { include: { amenity: true } },
        location: true,
      },
    });
  }

  /* ---------------------------------------------
   * Update
   * --------------------------------------------- */

  async update(
    vendorUserId: string,
    propertyId: string,
    dto: UpdatePropertyDto,
  ) {
    await this.assertOwnership(vendorUserId, propertyId);

    let slug: string | undefined = undefined;

    if (dto.slug?.trim()) {
      const baseSlug = this.slugify(dto.slug.trim());
      const existing = await this.prisma.property.findUnique({
        where: { slug: baseSlug },
      });

      slug =
        existing && existing.id !== propertyId
          ? await this.generateUniqueSlug(baseSlug)
          : baseSlug;
    }

    return this.prisma.property.update({
      where: { id: propertyId },
      data: {
        title: dto.title?.trim() ?? undefined,
        slug,
        description: dto.description?.trim() ?? undefined,

        city: dto.city?.trim() ?? undefined,
        area: dto.area?.trim() ?? undefined,
        address: dto.address?.trim() ?? undefined,
        lat: dto.lat ?? undefined,
        lng: dto.lng ?? undefined,

        locationId: dto.locationId ?? undefined,

        maxGuests: dto.maxGuests ?? undefined,
        bedrooms: dto.bedrooms ?? undefined,
        bathrooms: dto.bathrooms ?? undefined,

        basePrice: dto.basePrice ?? undefined,
        cleaningFee: dto.cleaningFee ?? undefined,
        currency: dto.currency?.trim() ?? undefined,

        // 🔒 status NOT updatable here

        minNights: dto.minNights ?? undefined,
        maxNights: dto.maxNights ?? undefined,
        checkInFromMin: dto.checkInFromMin ?? undefined,
        checkInToMax: dto.checkInToMax ?? undefined,
        checkOutMin: dto.checkOutMin ?? undefined,
        isInstantBook: dto.isInstantBook ?? undefined,
      },
    });
  }

  /* ---------------------------------------------
   * Publish / Unpublish (Canonical transitions)
   * --------------------------------------------- */

  async publish(vendorUserId: string, propertyId: string) {
    return this.prisma.$transaction(async (tx) => {
      const prop = await tx.property.findUnique({
        where: { id: propertyId },
        include: { media: true },
      });

      if (!prop) throw new NotFoundException('Property not found.');
      if (prop.vendorId !== vendorUserId) {
        throw new ForbiddenException('Not your property.');
      }
      if (prop.status === 'PUBLISHED') {
        throw new BadRequestException('Property is already published.');
      }

      // Publish readiness (v1, grounded in your schema)
      if (
        !prop.title ||
        !prop.description ||
        !prop.city ||
        !prop.basePrice ||
        prop.media.length === 0
      ) {
        throw new BadRequestException('Property is not ready to be published.',);
      }

      return tx.property.update({
        where: { id: propertyId },
        data: {
          status: 'PUBLISHED',
        },
      });
    });
  }

  async unpublish(vendorUserId: string, propertyId: string) {
    return this.prisma.$transaction(async (tx) => {
      const prop = await tx.property.findUnique({
        where: { id: propertyId },
      });

      if (!prop) throw new NotFoundException('Property not found.');
      if (prop.vendorId !== vendorUserId) {
        throw new ForbiddenException('Not your property.');
      }
      if (prop.status !== 'PUBLISHED') {
        throw new BadRequestException('Property is not published.');
      }

      return tx.property.update({
        where: { id: propertyId },
        data: {
          status: 'DRAFT',
        },
      });
    });
  }

  /* ---------------------------------------------
   * Media upload
   * --------------------------------------------- */

  async addMedia(
    vendorUserId: string,
    propertyId: string,
    file: Express.Multer.File,
  ) {
    const property = await this.assertOwnership(vendorUserId, propertyId);

    const lastMedia = await this.prisma.media.findFirst({
      where: { propertyId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const nextSortOrder = lastMedia ? lastMedia.sortOrder + 1 : 0;

    const media = await this.prisma.media.create({
    data: {
    propertyId, url: `/uploads/properties/${file.filename}`,
    sortOrder: nextSortOrder,
      },
    });


    return { item: media };
  }


  /* ---------------------------------------------
   * Media reorder
   * --------------------------------------------- */

  async reorderMedia(
    vendorUserId: string,
    propertyId: string,
    dto: ReorderMediaDto,
  ) {
    await this.assertOwnership(vendorUserId, propertyId);

    const ids = dto.orderedMediaIds ?? [];
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException(
        'orderedMediaIds must be a non-empty array.',
      );
    }

    const media = await this.prisma.media.findMany({
      where: { propertyId },
      select: { id: true },
    });

    const mediaIds = new Set(media.map((m) => m.id));

    for (const id of ids) {
      if (!mediaIds.has(id)) {
        throw new BadRequestException(
          `Media id not found for this property: ${id}`,
        );
      }
    }

    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('orderedMediaIds contains duplicates.');
    }

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.media.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    const updated = await this.prisma.media.findMany({
      where: { propertyId },
      orderBy: { sortOrder: 'asc' },
    });

    return { items: updated };
  }
}
