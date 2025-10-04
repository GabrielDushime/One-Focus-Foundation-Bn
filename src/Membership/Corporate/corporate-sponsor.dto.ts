// src/Sponsors/Corporate/corporate-sponsor.dto.ts

import { 
  IsString, 
  IsEmail, 
  IsEnum, 
  IsBoolean,
  IsArray,
  IsDateString,
  IsNotEmpty,
  ArrayNotEmpty,
  MaxLength,
  IsOptional
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { 
  OrganizationSize,
  SponsorshipFocus,
  SponsorshipPackage,
  PaymentMethod,
  ContributionFrequency,
  SponsorStatus
} from './corporate-sponsor.entity';

export class CreateCorporateSponsorDto {
  @ApiProperty({ 
    description: 'Full name or organization name',
    example: 'Tech Solutions Rwanda Ltd'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullNameOrganization: string;

  @ApiProperty({ 
    description: 'Email address',
    example: 'info@techsolutions.rw'
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    description: 'Phone number (WhatsApp number)',
    example: '+250788123456'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;

  @ApiProperty({ 
    description: 'Country / City',
    example: 'Kigali, Rwanda'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  countryCity: string;

  @ApiProperty({ 
    description: 'Occupation / Role',
    example: 'CEO / Marketing Director'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  occupationRole: string;

  @ApiPropertyOptional({ 
    description: 'Website / Social Media (if applicable)',
    example: 'https://www.techsolutions.rw'
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  websiteSocialMedia?: string;

  @ApiProperty({ 
    description: 'Organization size',
    enum: OrganizationSize,
    example: OrganizationSize.MEDIUM
  })
  @IsEnum(OrganizationSize)
  @IsNotEmpty()
  organizationSize: OrganizationSize;

  @ApiProperty({ 
    description: 'Sponsorship focus areas',
    enum: SponsorshipFocus,
    isArray: true,
    example: [SponsorshipFocus.BRANDING_MARKETING, SponsorshipFocus.CSR_COMMUNITY]
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one sponsorship focus must be selected' })
  @IsEnum(SponsorshipFocus, { each: true })
  sponsorshipFocus: SponsorshipFocus[];

  @ApiProperty({ 
    description: 'Preferred sponsorship package',
    enum: SponsorshipPackage,
    example: SponsorshipPackage.GOLD
  })
  @IsEnum(SponsorshipPackage)
  @IsNotEmpty()
  sponsorshipPackage: SponsorshipPackage;

  @ApiPropertyOptional({ 
    description: 'Custom package details (if custom package selected)',
    example: 'We would like a customized package focusing on youth tech training'
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  customPackageDetails?: string;

  @ApiProperty({ 
    description: 'Preferred payment method',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({ 
    description: 'Contribution frequency',
    enum: ContributionFrequency,
    example: ContributionFrequency.QUARTERLY
  })
  @IsEnum(ContributionFrequency)
  @IsNotEmpty()
  contributionFrequency: ContributionFrequency;

  @ApiProperty({ 
    description: 'I confirm that all information provided is accurate',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'You must confirm the accuracy of information' })
  confirmAccuracy: boolean;

  @ApiProperty({ 
    description: 'I agree to ONEFOCUS rules, guidelines, and sponsorship terms',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'You must agree to terms and conditions' })
  agreeToTerms: boolean;

  @ApiProperty({ 
    description: 'Digital signature',
    example: 'John Doe - CEO'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  signature: string;

  @ApiProperty({ 
    description: 'Signature date',
    example: '2025-10-03'
  })
  @IsDateString()
  @IsNotEmpty()
  signatureDate: Date;
}

export class UpdateCorporateSponsorDto {
  @ApiPropertyOptional({ 
    description: 'Sponsor status',
    enum: SponsorStatus,
    example: SponsorStatus.APPROVED
  })
  @IsEnum(SponsorStatus)
  @IsOptional()
  sponsorStatus?: SponsorStatus;

  @ApiPropertyOptional({ 
    description: 'Admin notes about the sponsorship',
    example: 'Approved for Gold package. Contract signed. Payment verified.'
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  adminNotes?: string;
}

export class CorporateSponsorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullNameOrganization: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  countryCity: string;

  @ApiProperty()
  occupationRole: string;

  @ApiProperty({ required: false })
  websiteSocialMedia?: string;

  @ApiProperty({ enum: OrganizationSize })
  organizationSize: OrganizationSize;

  @ApiProperty({ enum: SponsorshipFocus, isArray: true })
  sponsorshipFocus: SponsorshipFocus[];

  @ApiProperty({ enum: SponsorshipPackage })
  sponsorshipPackage: SponsorshipPackage;

  @ApiProperty({ required: false })
  customPackageDetails?: string;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: ContributionFrequency })
  contributionFrequency: ContributionFrequency;

  @ApiProperty()
  confirmAccuracy: boolean;

  @ApiProperty()
  agreeToTerms: boolean;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  signatureDate: Date;

  @ApiProperty({ enum: SponsorStatus })
  sponsorStatus: SponsorStatus;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CorporateSponsorStatsDto {
  @ApiProperty()
  totalSponsors: number;

  @ApiProperty()
  pendingSponsors: number;

  @ApiProperty()
  approvedSponsors: number;

  @ApiProperty()
  activeSponsors: number;

  @ApiProperty()
  inactiveSponsors: number;

  @ApiProperty()
  rejectedSponsors: number;

  @ApiProperty()
  byOrganizationSize: Record<string, number>;

  @ApiProperty()
  bySponsorshipPackage: Record<string, number>;

  @ApiProperty()
  bySponsorshipFocus: Record<string, number>;

  @ApiProperty()
  byPaymentMethod: Record<string, number>;

  @ApiProperty()
  monthlyRegistrations: Array<{ month: string; count: number }>;
}