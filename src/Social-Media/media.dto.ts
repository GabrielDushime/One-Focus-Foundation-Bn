import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
  IsArray,
  IsObject,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { SocialMediaPlatform, SupportRequestStatus } from './media.entity';

export class CreateSocialMediaSupportRequestDto {
  @ApiProperty({
    description: 'Applicant name',
    example: 'Jane Smith',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  applicantName: string;

  @ApiPropertyOptional({
    description: 'Organization name',
    example: 'Tech Startup Inc.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  organization?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'jane@techstartup.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+250788123456',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  phone: string;

  @ApiProperty({
    description: 'Social media handles',
    example: {
      instagram: '@mytechstartup',
      linkedin: 'linkedin.com/company/techstartup',
    },
  })
  @IsObject()
  @IsNotEmpty()
  socialMediaHandles: Record<string, string>;

  @ApiProperty({
    description: 'Platforms requested',
    enum: SocialMediaPlatform,
    isArray: true,
    example: [SocialMediaPlatform.INSTAGRAM, SocialMediaPlatform.LINKEDIN],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(SocialMediaPlatform, { each: true })
  platformsRequested: SocialMediaPlatform[];

  @ApiProperty({
    description: 'Description of support needed',
    example: 'We need help growing our Instagram presence and creating engaging content',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  supportDescription: string;

  @ApiProperty({
    description: 'Goals and KPIs',
    example: 'Gain 500 followers in 3 months, achieve 5% engagement rate, post 10 times per week',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  goalsKPIs: string;

  @ApiPropertyOptional({
    description: 'Budget or support needed',
    example: '$500-$1000 per month',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  budget?: string;

  @ApiProperty({
    description: 'Consent to terms and conditions',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  consentConfirmed: boolean;
}

export class UpdateSocialMediaSupportRequestDto extends PartialType(
  CreateSocialMediaSupportRequestDto,
) {
  @ApiPropertyOptional({
    description: 'Request status',
    enum: SupportRequestStatus,
  })
  @IsEnum(SupportRequestStatus)
  @IsOptional()
  status?: SupportRequestStatus;

  @ApiPropertyOptional({
    description: 'Admin notes',
    example: 'Good candidate for our social media program',
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Assigned team member',
    example: 'Social Media Team Lead',
  })
  @IsString()
  @IsOptional()
  assignedTo?: string;
}

export class SocialMediaSupportRequestResponseDto {
  @ApiProperty({ description: 'Request ID' })
  id: string;

  @ApiProperty({ description: 'Applicant name' })
  applicantName: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Status', enum: SupportRequestStatus })
  status: SupportRequestStatus;

  @ApiProperty({ description: 'Platforms requested' })
  platformsRequested: SocialMediaPlatform[];

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;
}