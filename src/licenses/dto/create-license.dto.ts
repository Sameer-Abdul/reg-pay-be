import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateLicenseDto {
  @IsString()
  licenseType: string;

  @IsDateString()
  validFrom: Date;

  @IsDateString()
  validTo: Date;

  @IsString()
  tenantId: string;

  @IsOptional()
  @IsString()
  @IsIn(['Yes', 'No'])
  eligibleForLicense?: string = 'Yes';
}
