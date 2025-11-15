import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('licenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() createLicenseDto: CreateLicenseDto) {
    return this.licensesService.create(createLicenseDto);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.licensesService.findAll();
  }

  @Get('tenant/:tenantId')
  @Roles(Role.Admin, Role.Moderator)
  findByTenantId(@Param('tenantId') tenantId: string) {
    return this.licensesService.findByTenantId(tenantId);
  }

  @Get('active/:tenantId')
  @Roles(Role.Admin, Role.Moderator, Role.User)
  findActiveLicense(@Param('tenantId') tenantId: string) {
    return this.licensesService.findActiveLicense(tenantId);
  }

  @Patch(':id/status')
  @Roles(Role.Admin)
  updateStatus(
    @Param('id') licenseId: string,
    @Query('status') status: 'Yes' | 'No',
  ) {
    return this.licensesService.updateStatus(licenseId, status);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') licenseId: string) {
    return this.licensesService.remove(licenseId);
  }
}
