// src/Membership/Premium/premium-membership.dto.ts

import { 
  IsString, 
  IsEmail, 
  IsEnum, 
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  MaxLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { 
  CareerGrowthArea,
  MonthlyContribution,
  PaymentMethod,
  ContributionFrequency,
  PremiumMembershipStatus
} from './premium-membership.entity';

export class CreatePremiumMembershipDto {
  @ApiProperty({ 
    description: 'First name',
    example: 'Jane'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ 
    description: 'Second name / Last name',
    example: 'Smith'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  secondName: string;

  @ApiProperty({ 
    description: 'Email address',
    example: 'jane.smith@example.com'
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
    example: 'Business Owner'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  occupationRole: string;

  @ApiPropertyOptional({ 
    description: 'Website / Social Media (if applicable)',
    example: 'https://instagram.com/janesmith'
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  websiteSocialMedia?: string;

  @ApiProperty({ 
    description: 'Career or skills area you would like to grow in',
    enum: CareerGrowthArea,
    example: CareerGrowthArea.ENTREPRENEURSHIP_BUSINESS
  })
  @IsEnum(CareerGrowthArea)
  @IsNotEmpty()
  careerGrowthArea: CareerGrowthArea;

  @ApiProperty({ 
    description: 'Expected monthly contribution',
    enum: MonthlyContribution,
    example: MonthlyContribution.FIFTEEN_K
  })
  @IsEnum(MonthlyContribution)
  @IsNotEmpty()
  monthlyContribution: MonthlyContribution;

  @ApiProperty({ 
    description: 'Preferred payment method',
    enum: PaymentMethod,
    example: PaymentMethod.MOBILE_MONEY
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({ 
    description: 'Contribution frequency',
    enum: ContributionFrequency,
    example: ContributionFrequency.MONTHLY
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
    description: 'I agree to ONEFOCUS rules, guidelines, and membership terms',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'You must agree to terms and conditions' })
  agreeToTerms: boolean;

  @ApiProperty({ 
    description: 'Digital signature',
    example: 'Jane Smith'
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

export class UpdatePremiumMembershipDto {
  @ApiPropertyOptional({ 
    description: 'Membership status',
    enum: PremiumMembershipStatus,
    example: PremiumMembershipStatus.APPROVED
  })
  @IsEnum(PremiumMembershipStatus)
  membershipStatus?: PremiumMembershipStatus;

  @ApiPropertyOptional({ 
    description: 'Admin notes about the membership',
    example: 'Payment verified. Membership activated.'
  })
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  adminNotes?: string;
}

export class PremiumMembershipResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  secondName: string;

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

  @ApiProperty({ enum: CareerGrowthArea })
  careerGrowthArea: CareerGrowthArea;

  @ApiProperty({ enum: MonthlyContribution })
  monthlyContribution: MonthlyContribution;

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

  @ApiProperty({ enum: PremiumMembershipStatus })
  membershipStatus: PremiumMembershipStatus;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PremiumMembershipStatsDto {
  @ApiProperty()
  totalMembers: number;

  @ApiProperty()
  pendingMembers: number;

  @ApiProperty()
  approvedMembers: number;

  @ApiProperty()
  activeMembers: number;

  @ApiProperty()
  inactiveMembers: number;

  @ApiProperty()
  rejectedMembers: number;

  @ApiProperty()
  byCareerGrowthArea: Record<string, number>;

  @ApiProperty()
  byContribution: Record<string, number>;

  @ApiProperty()
  byPaymentMethod: Record<string, number>;

  @ApiProperty()
  monthlyRegistrations: Array<{ month: string; count: number }>;
}