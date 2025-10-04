// src/Membership/Basic/basic-membership.dto.ts

import { 
  IsString, 
  IsEmail, 
  IsEnum, 
  IsBoolean,
  IsArray,
  IsDateString,
  IsNotEmpty,
  ArrayNotEmpty,
  MaxLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { 
  AreasOfInterest,
  MembershipStatus
} from './basic-membership.entity';

export class CreateBasicMembershipDto {
  @ApiProperty({ 
    description: 'First name',
    example: 'John'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ 
    description: 'Second name / Last name',
    example: 'Doe'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  secondName: string;

  @ApiProperty({ 
    description: 'Email address',
    example: 'john.doe@example.com'
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
    example: 'Software Developer'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  occupationRole: string;

  @ApiPropertyOptional({ 
    description: 'Website / Social Media (if applicable)',
    example: 'https://linkedin.com/in/johndoe'
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  websiteSocialMedia?: string;

  @ApiProperty({ 
    description: 'Why do you want to join ONEFOCUS',
    example: 'I want to connect with like-minded individuals and grow my professional network.',
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Motivation message must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  whyJoinOnefocus: string;

  @ApiProperty({ 
    description: 'Areas of interest',
    enum: AreasOfInterest,
    isArray: true,
    example: [AreasOfInterest.WORKSHOPS, AreasOfInterest.MENTORSHIP]
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one area of interest must be selected' })
  @IsEnum(AreasOfInterest, { each: true })
  areasOfInterest: AreasOfInterest[];

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
    example: 'John Doe'
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

export class UpdateBasicMembershipDto {
  @ApiPropertyOptional({ 
    description: 'Membership status',
    enum: MembershipStatus,
    example: MembershipStatus.APPROVED
  })
  @IsEnum(MembershipStatus)
  membershipStatus?: MembershipStatus;

  @ApiPropertyOptional({ 
    description: 'Admin notes about the membership',
    example: 'Approved after verification. Active member.'
  })
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  adminNotes?: string;
}

export class BasicMembershipResponseDto {
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

  @ApiProperty()
  whyJoinOnefocus: string;

  @ApiProperty({ enum: AreasOfInterest, isArray: true })
  areasOfInterest: AreasOfInterest[];

  @ApiProperty()
  confirmAccuracy: boolean;

  @ApiProperty()
  agreeToTerms: boolean;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  signatureDate: Date;

  @ApiProperty({ enum: MembershipStatus })
  membershipStatus: MembershipStatus;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BasicMembershipStatsDto {
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
  byAreasOfInterest: Record<string, number>;

  @ApiProperty()
  monthlyRegistrations: Array<{ month: string; count: number }>;
}