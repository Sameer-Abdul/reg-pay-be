import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async getAllTenants() {
    try {
      return await this.prisma.tenant_master.findMany({
        select: {
          tenant_id: true,
          name: true,
          email: true,
          contact_no: true,
          address: true,
          image_url: true,
          created_at: true,
          updated_at: true
        },
        orderBy: {
          name: 'asc'
        }
      });
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw new Error(`Failed to fetch tenants: ${error.message}`);
    }
  }
}
