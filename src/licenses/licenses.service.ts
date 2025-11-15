import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLicenseDto } from './dto/create-license.dto';

@Injectable()
export class LicensesService {
  constructor(private prisma: PrismaService) {}

  async create(createLicenseDto: CreateLicenseDto) {
    // Check if tenant exists
    const tenant = await this.prisma.tenant_master.findUnique({
      where: { tenant_id: createLicenseDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${createLicenseDto.tenantId} not found`);
    }

    return this.prisma.license.create({
      data: {
        license_id: `LIC${Date.now().toString().slice(-6)}`,
        license_type: createLicenseDto.licenseType,
        valid_from: new Date(createLicenseDto.validFrom),
        valid_to: new Date(createLicenseDto.validTo),
        tenant_id: createLicenseDto.tenantId,
        eligible_for_license: createLicenseDto.eligibleForLicense,
      },
      include: {
        tenant_master: {
          select: {
            name: true,
            email: true,
            tenant_id: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.license.findMany({
      include: {
        tenant_master: {
          select: {
            name: true,
            email: true,
            tenant_id: true,
          },
        },
      },
      orderBy: {
        valid_to: 'desc',
      },
    });
  }

  async findByTenantId(tenantId: string) {
    const licenses = await this.prisma.license.findMany({
      where: { tenant_id: tenantId },
      include: {
        tenant_master: {
          select: {
            name: true,
            email: true,
            tenant_id: true,
          },
        },
      },
      orderBy: {
        valid_to: 'desc',
      },
    });

    if (!licenses || licenses.length === 0) {
      throw new NotFoundException(`No licenses found for tenant ID ${tenantId}`);
    }

    return licenses;
  }

  async findActiveLicense(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const license = await this.prisma.license.findFirst({
      where: {
        tenant_id: tenantId,
        valid_from: { lte: today },
        valid_to: { gte: today },
        eligible_for_license: 'Yes',
      },
      orderBy: {
        valid_to: 'desc',
      },
    });

    if (!license) {
      throw new NotFoundException('No active license found for this tenant');
    }

    return license;
  }

  async updateStatus(licenseId: string, status: 'Yes' | 'No') {
    const license = await this.prisma.license.findUnique({
      where: { license_id: licenseId },
    });

    if (!license) {
      throw new NotFoundException(`License with ID ${licenseId} not found`);
    }

    return this.prisma.license.update({
      where: { license_id: licenseId },
      data: { eligible_for_license: status },
    });
  }

  async remove(licenseId: string) {
    const license = await this.prisma.license.findUnique({
      where: { license_id: licenseId },
    });

    if (!license) {
      throw new NotFoundException(`License with ID ${licenseId} not found`);
    }

    return this.prisma.license.delete({
      where: { license_id: licenseId },
    });
  }
}
