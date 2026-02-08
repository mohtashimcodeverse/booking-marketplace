import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import {
  BookingStatus,
  Prisma,
  PropertyDeletionRequestStatus,
  PropertyReviewDecision,
  PropertyStatus,
} from '@prisma/client';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { AdminCreatePropertyDto } from './dto/admin-create-property.dto';
import { AdminUpdatePropertyDto } from './dto/admin-update-property.dto';
import {
  ReorderMediaDto,
  UpdateMediaCategoryDto,
} from '../../vendor/vendor-properties.dto';

type ReviewDto = { notes?: string; checklistJson?: string };

@Injectable()
export class AdminPropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------
  // Shared slug helpers (copy of vendor behavior)
  // -------------------------

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

  private async mustFindProperty(propertyId: string) {
    const prop = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { documents: true, media: true },
    });
    if (!prop) throw new NotFoundException('Property not found.');
    return prop;
  }

  private async mustFindAdminOwnedProperty(propertyId: string) {
    const prop = await this.mustFindProperty(propertyId);
    if (!prop.createdByAdminId) {
      throw new ForbiddenException(
        'Admin cannot edit vendor property content. Moderation actions are allowed.',
      );
    }
    return prop;
  }

  async getOneByAdmin(propertyId: string) {
    const item = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        amenities: {
          include: {
            amenity: {
              include: { group: true },
            },
          },
        },
        vendor: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!item) throw new NotFoundException('Property not found.');
    return item;
  }

  async listAmenitiesCatalog() {
    const amenities = await this.prisma.amenity.findMany({
      orderBy: [{ groupId: 'asc' }, { name: 'asc' }],
      include: { group: true },
    });

    const grouped = new Map<
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

    for (const amenity of amenities) {
      const key = amenity.group ? amenity.group.id : '__none__';
      const payload = {
        id: amenity.id,
        key: amenity.key,
        name: amenity.name,
        icon: amenity.icon ?? null,
        groupId: amenity.groupId ?? null,
      };

      const existing = grouped.get(key);
      if (existing) existing.amenities.push(payload);
      else {
        grouped.set(key, {
          group: amenity.group
            ? { id: amenity.group.id, name: amenity.group.name }
            : null,
          amenities: [payload],
        });
      }
    }

    const amenitiesGrouped = Array.from(grouped.values()).sort((a, b) => {
      const left = a.group?.name ?? 'Other';
      const right = b.group?.name ?? 'Other';
      return left.localeCompare(right);
    });

    return { amenitiesGrouped };
  }

  async setAmenitiesByAdmin(
    _adminId: string,
    propertyId: string,
    amenityIds: string[],
  ) {
    await this.mustFindAdminOwnedProperty(propertyId);

    const uniqueIds = Array.from(
      new Set((amenityIds ?? []).map((id) => String(id).trim()).filter(Boolean)),
    );

    const existing = await this.prisma.amenity.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (existing.length !== uniqueIds.length) {
      throw new BadRequestException('One or more amenities are invalid.');
    }

    await this.prisma.$transaction([
      this.prisma.propertyAmenity.deleteMany({ where: { propertyId } }),
      ...(uniqueIds.length > 0
        ? [
            this.prisma.propertyAmenity.createMany({
              data: uniqueIds.map((amenityId) => ({ propertyId, amenityId })),
            }),
          ]
        : []),
    ]);

    return this.getOneByAdmin(propertyId);
  }

  // -------------------------
  // Admin Listing Management (NEW)
  // -------------------------

  async createByAdmin(adminId: string, dto: AdminCreatePropertyDto) {
    // Vendor assignment: explicit vendorId or default to adminId (still a valid FK)
    const vendorId = dto.vendorId ?? adminId;

    // Validate vendorId exists (and if it’s not adminId, it should be a real user)
    const vendorUser = await this.prisma.user.findUnique({
      where: { id: vendorId },
      select: { id: true, role: true },
    });
    if (!vendorUser) {
      throw new BadRequestException('vendorId is invalid.');
    }

    const rawBase = dto.slug?.trim() ? dto.slug : dto.title;
    const baseSlug = this.slugify(rawBase);
    const safeBase = baseSlug && baseSlug.length > 0 ? baseSlug : 'property';
    let slug = await this.generateUniqueSlug(safeBase);

    const publishNow = dto.publishNow === true;

    for (let attempt = 1; attempt <= 8; attempt++) {
      try {
        return await this.prisma.property.create({
          data: {
            vendorId,
            createdByAdminId: adminId,
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

            // ✅ Admin is its own approval:
            status: publishNow
              ? PropertyStatus.PUBLISHED
              : PropertyStatus.APPROVED,
          },
          include: {
            media: { orderBy: { sortOrder: 'asc' } },
            documents: { orderBy: { createdAt: 'desc' } },
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

  async updateByAdmin(
    adminId: string,
    propertyId: string,
    dto: AdminUpdatePropertyDto,
  ) {
    await this.mustFindAdminOwnedProperty(propertyId);

    let slug: string | undefined;
    if (dto.slug?.trim()) {
      const base = this.slugify(dto.slug);
      const existing = await this.prisma.property.findUnique({
        where: { slug: base },
        select: { id: true },
      });
      slug =
        existing && existing.id !== propertyId
          ? await this.generateUniqueSlug(base)
          : base;
    }

    // Validate reassignment if provided
    if (dto.vendorId) {
      const u = await this.prisma.user.findUnique({
        where: { id: dto.vendorId },
        select: { id: true },
      });
      if (!u) throw new BadRequestException('vendorId is invalid.');
    }

    return this.prisma.property.update({
      where: { id: propertyId },
      data: {
        vendorId: dto.vendorId,
        // keep createdByAdminId as original creator; we don't overwrite here
        title: dto.title?.trim(),
        slug,
        description: dto.description?.trim(),
        city: dto.city?.trim(),
        area: dto.area?.trim(),
        address: dto.address?.trim(),
        lat: dto.lat,
        lng: dto.lng,
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
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async publishByAdmin(adminId: string, propertyId: string) {
    const prop = await this.mustFindProperty(propertyId);

    // Admin can publish from most states except SUSPENDED
    if (prop.status === PropertyStatus.SUSPENDED) {
      throw new BadRequestException('Property is suspended.');
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

  async unpublishByAdmin(adminId: string, propertyId: string) {
    const prop = await this.mustFindProperty(propertyId);

    if (prop.status !== PropertyStatus.PUBLISHED) {
      throw new BadRequestException('Property is not published.');
    }

    // For admin: go back to APPROVED (admin-approved state), not DRAFT
    return this.prisma.property.update({
      where: { id: propertyId },
      data: { status: PropertyStatus.APPROVED },
    });
  }

  async addMediaByAdmin(
    adminId: string,
    propertyId: string,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File upload failed.');
    await this.mustFindAdminOwnedProperty(propertyId);

    const last = await this.prisma.media.findFirst({
      where: { propertyId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return this.prisma.media.create({
      data: {
        propertyId,
        url: `/uploads/properties/images/${file.filename}`,
        sortOrder: last ? last.sortOrder + 1 : 0,
        category: 'OTHER',
      },
    });
  }

  async updateMediaCategoryByAdmin(
    adminId: string,
    propertyId: string,
    mediaId: string,
    dto: UpdateMediaCategoryDto,
  ) {
    await this.mustFindAdminOwnedProperty(propertyId);

    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media || media.propertyId !== propertyId) {
      throw new NotFoundException('Media not found.');
    }

    return this.prisma.media.update({
      where: { id: mediaId },
      data: { category: dto.category },
    });
  }

  async reorderMediaByAdmin(
    adminId: string,
    propertyId: string,
    dto: ReorderMediaDto,
  ) {
    await this.mustFindAdminOwnedProperty(propertyId);

    await this.prisma.$transaction(
      dto.orderedMediaIds.map((id, index) =>
        this.prisma.media.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    return this.prisma.media.findMany({
      where: { propertyId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async deleteMediaByAdmin(
    _adminId: string,
    propertyId: string,
    mediaId: string,
  ) {
    await this.mustFindAdminOwnedProperty(propertyId);

    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.propertyId !== propertyId) {
      throw new NotFoundException('Media not found.');
    }

    await this.prisma.media.delete({ where: { id: mediaId } });

    const remaining = await this.prisma.media.findMany({
      where: { propertyId },
      orderBy: { sortOrder: 'asc' },
      select: { id: true },
    });

    await this.prisma.$transaction(
      remaining.map((row, index) =>
        this.prisma.media.update({
          where: { id: row.id },
          data: { sortOrder: index },
        }),
      ),
    );

    const filename = media.url.split('/').pop();
    if (filename) {
      const absolute = join(
        process.cwd(),
        'uploads',
        'properties',
        'images',
        filename,
      );
      if (existsSync(absolute)) {
        try {
          unlinkSync(absolute);
        } catch {
          // best-effort cleanup
        }
      }
    }

    return this.prisma.media.findMany({
      where: { propertyId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async listDeletionRequests(params?: {
    status?: PropertyDeletionRequestStatus;
    page?: number;
    pageSize?: number;
  }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const pageSize = params?.pageSize && params.pageSize > 0 ? params.pageSize : 20;

    const where = params?.status ? { status: params.status } : {};

    const [total, items] = await this.prisma.$transaction([
      this.prisma.propertyDeletionRequest.count({ where }),
      this.prisma.propertyDeletionRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          property: {
            select: { id: true, title: true, city: true, status: true },
          },
          requestedByVendor: {
            select: { id: true, email: true, fullName: true },
          },
          reviewedByAdmin: {
            select: { id: true, email: true, fullName: true },
          },
        },
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      items,
    };
  }

  async approveDeletionRequest(adminId: string, requestId: string, notes?: string) {
    const request = await this.prisma.propertyDeletionRequest.findUnique({
      where: { id: requestId },
      include: {
        property: {
          select: { id: true },
        },
      },
    });

    if (!request) throw new NotFoundException('Deletion request not found.');
    if (request.status !== PropertyDeletionRequestStatus.PENDING) {
      throw new BadRequestException('Deletion request is not pending.');
    }

    if (request.propertyId) {
      const activeBookings = await this.prisma.booking.count({
        where: {
          propertyId: request.propertyId,
          status: {
            in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED],
          },
        },
      });

      if (activeBookings > 0) {
        throw new BadRequestException(
          'Cannot delete property with active bookings. Resolve stays first.',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (request.propertyId) {
        await tx.property.delete({ where: { id: request.propertyId } });
      }

      return tx.propertyDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: PropertyDeletionRequestStatus.APPROVED,
          reviewedByAdminId: adminId,
          reviewedAt: new Date(),
          adminNotes: notes?.trim() || null,
        },
      });
    });
  }

  async rejectDeletionRequest(adminId: string, requestId: string, notes?: string) {
    const request = await this.prisma.propertyDeletionRequest.findUnique({
      where: { id: requestId },
      select: { id: true, status: true },
    });

    if (!request) throw new NotFoundException('Deletion request not found.');
    if (request.status !== PropertyDeletionRequestStatus.PENDING) {
      throw new BadRequestException('Deletion request is not pending.');
    }

    return this.prisma.propertyDeletionRequest.update({
      where: { id: requestId },
      data: {
        status: PropertyDeletionRequestStatus.REJECTED,
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
        adminNotes: notes?.trim() || null,
      },
    });
  }

  async deleteAdminOwnedPropertyNow(adminId: string, propertyId: string) {
    await this.mustFindAdminOwnedProperty(propertyId);

    const activeBookings = await this.prisma.booking.count({
      where: {
        propertyId,
        status: {
          in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED],
        },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException(
        'Cannot delete property with active bookings. Resolve stays first.',
      );
    }

    await this.prisma.property.delete({ where: { id: propertyId } });
    return { ok: true, id: propertyId, deletedBy: adminId };
  }

  // -------------------------
  // Existing review workflow
  // -------------------------

  async reviewQueue(status?: string) {
    const normalized =
      typeof status === 'string' && status.trim().length > 0
        ? status.trim().toUpperCase()
        : 'UNDER_REVIEW';

    const allowed = new Set([
      'UNDER_REVIEW',
      'CHANGES_REQUESTED',
      'REJECTED',
      'APPROVED',
      'DRAFT',
      'PUBLISHED',
      'SUSPENDED',
    ]);

    if (!allowed.has(normalized)) {
      throw new BadRequestException('Invalid status filter for review-queue.');
    }

    const items = await this.prisma.property.findMany({
      where: { status: normalized as PropertyStatus },
      orderBy: { updatedAt: 'desc' },
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        vendor: { select: { id: true, email: true, fullName: true } },
        reviews: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
    });

    return { status: normalized, items };
  }

  async approve(adminId: string, propertyId: string, dto: ReviewDto) {
    return this.prisma.$transaction(async (tx) => {
      const prop = await this.mustFindProperty(propertyId);

      if (prop.status !== PropertyStatus.UNDER_REVIEW) {
        throw new BadRequestException(
          `Cannot approve property from status: ${prop.status}`,
        );
      }

      const updated = await tx.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.APPROVED },
      });

      await tx.propertyReview.create({
        data: {
          propertyId,
          adminId,
          decision: PropertyReviewDecision.APPROVE,
          notes: dto.notes ?? null,
          checklistJson: dto.checklistJson ?? null,
        },
      });

      return { ok: true, item: updated };
    });
  }

  async requestChanges(adminId: string, propertyId: string, dto: ReviewDto) {
    return this.prisma.$transaction(async (tx) => {
      const prop = await this.mustFindProperty(propertyId);

      if (prop.status !== PropertyStatus.UNDER_REVIEW) {
        throw new BadRequestException(
          `Cannot request changes from status: ${prop.status}`,
        );
      }

      const updated = await tx.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.CHANGES_REQUESTED },
      });

      await tx.propertyReview.create({
        data: {
          propertyId,
          adminId,
          decision: PropertyReviewDecision.REQUEST_CHANGES,
          notes: dto.notes ?? null,
          checklistJson: dto.checklistJson ?? null,
        },
      });

      return { ok: true, item: updated };
    });
  }

  async reject(adminId: string, propertyId: string, dto: ReviewDto) {
    return this.prisma.$transaction(async (tx) => {
      const prop = await this.mustFindProperty(propertyId);

      if (prop.status !== PropertyStatus.UNDER_REVIEW) {
        throw new BadRequestException(
          `Cannot reject property from status: ${prop.status}`,
        );
      }

      const updated = await tx.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.REJECTED },
      });

      await tx.propertyReview.create({
        data: {
          propertyId,
          adminId,
          decision: PropertyReviewDecision.REJECT,
          notes: dto.notes ?? null,
          checklistJson: dto.checklistJson ?? null,
        },
      });

      return { ok: true, item: updated };
    });
  }
}
