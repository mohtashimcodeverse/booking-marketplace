import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService.register', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    vendorProfile: {
      create: jest.fn(),
    },
  };

  const jwt = {
    signAsync: jest.fn(),
  };

  const service = new AuthService(prisma as never, jwt as never);

  beforeEach(() => {
    prisma.user.findUnique.mockReset();
    prisma.user.create.mockReset();
    prisma.vendorProfile.create.mockReset();
  });

  it('creates vendor profile when role is VENDOR', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user_1',
      email: 'vendor@example.com',
      role: UserRole.VENDOR,
      isEmailVerified: false,
      fullName: 'Vendor Name',
    });
    prisma.vendorProfile.create.mockResolvedValue({
      id: 'vp_1',
      userId: 'user_1',
    });

    const result = await service.register(
      'vendor@example.com',
      'password123',
      'Vendor Name',
      UserRole.VENDOR,
    );

    expect(result.user.role).toBe(UserRole.VENDOR);
    expect(prisma.vendorProfile.create).toHaveBeenCalledWith({
      data: {
        userId: 'user_1',
        displayName: 'Vendor Name',
        status: 'PENDING',
      },
    });
  });

  it('rejects ADMIN role self-registration', async () => {
    await expect(
      service.register(
        'admin@example.com',
        'password123',
        'Admin Name',
        UserRole.ADMIN,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
