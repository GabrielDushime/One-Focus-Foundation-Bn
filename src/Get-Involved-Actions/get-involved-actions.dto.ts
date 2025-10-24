
import {
  IsString,
  IsEnum,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { InterestArea, ApplicationStatus } from './get-involved-actions.entity';

export class CreateGetInvolvedActionDto {
  @ApiProperty({
    description: 'Full name of the applicant',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Phone number (WhatsApp preferable)',
    example: '788123456',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;

  
  @IsString()
  @IsOptional()
  @MaxLength(10)
  @Transform(({ value }) => value?.trim())
  countryCode?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({
    description: 'Interest area selection',
    enum: InterestArea,
    example: InterestArea.PODCAST_GUEST,
  })
  @IsEnum(InterestArea)
  @IsNotEmpty()
  interestArea: InterestArea;

  @ApiPropertyOptional({
    description: 'Additional information about the applicant',
    example: 'I have experience in public speaking and would love to share my story...',
  })
  @IsString()
  @IsOptional()
  additionalInfo?: string;

  @ApiPropertyOptional({
    description: 'Relevant experience or background',
    example: '5 years of experience in youth empowerment programs',
  })
  @IsString()
  @IsOptional()
  experience?: string;

  @ApiPropertyOptional({
    description: 'Availability information',
    example: 'Available on weekends and evenings',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  availability?: string;

  @ApiPropertyOptional({
    description: 'Is the phone number on WhatsApp?',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isWhatsapp?: boolean;
}

export class UpdateGetInvolvedActionDto extends PartialType(
  CreateGetInvolvedActionDto,
) {
  @ApiPropertyOptional({
    description: 'Application status',
    enum: ApplicationStatus,
    example: ApplicationStatus.REVIEWED,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Admin notes about the application',
    example: 'Contacted via WhatsApp. Scheduled for interview.',
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Date when the applicant was contacted',
    example: '2025-10-09T12:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  contactedAt?: Date;
}

export class GetInvolvedActionResponseDto {
  @ApiProperty({ description: 'Application unique identifier' })
  id: string;

  @ApiProperty({ description: 'Applicant name' })
  name: string;

  @ApiProperty({ description: 'Phone number' })
  phoneNumber: string;

  

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Interest area', enum: InterestArea })
  interestArea: InterestArea;

  @ApiProperty({ description: 'Application status', enum: ApplicationStatus })
  status: ApplicationStatus;

  @ApiProperty({ description: 'Additional information', required: false })
  additionalInfo?: string;

  @ApiProperty({ description: 'Experience', required: false })
  experience?: string;

  @ApiProperty({ description: 'Availability', required: false })
  availability?: string;

  @ApiProperty({ description: 'Admin notes', required: false })
  adminNotes?: string;

  @ApiProperty({ description: 'Is WhatsApp number' })
  isWhatsapp: boolean;

  @ApiProperty({ description: 'Contacted date', required: false })
  contactedAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class GetInvolvedActionsStatsDto {
  @ApiProperty({ description: 'Total number of applications' })
  totalApplications: number;

  @ApiProperty({ description: 'Pending applications' })
  pendingApplications: number;

  @ApiProperty({ description: 'Reviewed applications' })
  reviewedApplications: number;

  @ApiProperty({ description: 'Approved applications' })
  approvedApplications: number;

  @ApiProperty({ description: 'Rejected applications' })
  rejectedApplications: number;

  @ApiProperty({ description: 'Applications by interest area' })
  byInterestArea: Record<string, number>;

  @ApiProperty({ description: 'Recent applications (last 30 days)' })
  recentApplications: number;

  @ApiProperty({ description: 'WhatsApp vs regular phone distribution' })
  communicationPreference: {
    whatsapp: number;
    regular: number;
  };
}