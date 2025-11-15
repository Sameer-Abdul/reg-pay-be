import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Find user with tenant information
    const user = await this.prisma.register.findUnique({
      where: { email },
      include: {
        tenant_master: true
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    if (!user.password_hash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user has a tenant associated
    if (!user.tenant_id) {
      throw new UnauthorizedException('No tenant associated with this account');
    }

    // Validate tenant's license
    const licenseValidation = await this.validateTenantLicense(user.tenant_id);
    
    if (!licenseValidation.isValid) {
      if (licenseValidation.reason === 'NO_LICENSE') {
        throw new UnauthorizedException('No valid license found for this tenant. Please contact your administrator.');
      } else if (licenseValidation.reason === 'EXPIRED') {
        throw new UnauthorizedException(`Your license has expired on ${new Date(licenseValidation.license?.valid_to).toLocaleDateString()}. Please renew your license.`);
      } else if (licenseValidation.reason === 'INACTIVE') {
        throw new UnauthorizedException('Your license is currently inactive. Please contact support.');
      } else {
        throw new UnauthorizedException('License validation failed. Please contact support.');
      }
    }

    // Return user data without sensitive information
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const fullName = [
      user.first_name,
      user.middle_name,
      user.last_name
    ].filter(Boolean).join(' ').trim();

    const payload = { 
      email: user.email, 
      sub: user.id,
      tenantId: user.tenant_id,
      role: user.role
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: fullName,
        role: user.role,
        tenantId: user.tenant_id,
        firstName: user.first_name,
        lastName: user.last_name,
        middleName: user.middle_name
      }
    };
  }

  private async validateTenantLicense(tenantId: string): Promise<{
    isValid: boolean;
    reason?: 'NO_LICENSE' | 'EXPIRED' | 'INACTIVE' | 'VALID';
    license?: any;
  }> {
    try {
      // Get the current date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get the most recent license for the tenant using Prisma
      const license = await this.prisma.license.findFirst({
        where: {
          tenant_id: tenantId
        },
        orderBy: {
          valid_to: 'desc'
        },
        take: 1
      });

      // No license found
      if (!license) {
        return { isValid: false, reason: 'NO_LICENSE' };
      }

      // Check if license is active
      if (license.eligible_for_license !== 'Yes') {
        return { 
          isValid: false, 
          reason: 'INACTIVE',
          license 
        };
      }

      // Check if license is expired
      const validTo = new Date(license.valid_to);
      if (validTo < today) {
        return { 
          isValid: false, 
          reason: 'EXPIRED',
          license 
        };
      }

      // License is valid
      return { 
        isValid: true, 
        reason: 'VALID',
        license 
      };
    } catch (error) {
      console.error('Error validating license:', error);
      return { 
        isValid: false, 
        reason: 'NO_LICENSE' 
      };
    }
  }
}
