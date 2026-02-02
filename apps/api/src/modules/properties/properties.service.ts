import { Injectable } from '@nestjs/common';
import { Prisma, PropertyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListPropertiesDto } from './dto/list-properties.dto';

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
    const property = await this.prisma.property.findUnique({
      where: { slug },
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
          select: { url: true, alt: true, sortOrder: true },
        },
      },
    });

    return property;
  }
}
