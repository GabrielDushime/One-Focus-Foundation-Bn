import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EducationLevel, InternshipStatus } from './internship.entity';

export class CreateInternshipApplicationDto {
  @ApiProperty({
    description: 'Full name of the applicant',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  fullName: string;

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
    description: 'Phone number',
    example: '+250788123456',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  phone: string;

  @ApiProperty({
    description: 'Country',
    example: 'Rwanda',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  country: string;

  @ApiProperty({
    description: 'City',
    example: 'Kigali',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  city: string;

  @ApiProperty({
    description: 'Highest education level',
    enum: EducationLevel,
    example: EducationLevel.BACHELORS,
  })
  @IsEnum(EducationLevel)
  @IsNotEmpty()
  educationLevel: EducationLevel;

  @ApiProperty({
    description: 'Department or role interested in',
    example: 'Social Media Marketing',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  departmentInterest: string;

  @ApiProperty({
    description: 'Availability start date',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  availabilityStart: string;

  @ApiProperty({
    description: 'Availability end date',
    example: '2025-06-30',
  })
  @IsDateString()
  @IsNotEmpty()
  availabilityEnd: string;

  @ApiProperty({
    description: 'Statement (250 words): Why you want an internship at ONEFOCUS',
    example: 'I am passionate about making a difference...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(2000)
  statement: string;

  @ApiProperty({
    description: 'Consent confirmation',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  consentConfirmed: boolean;
}

export class UpdateInternshipApplicationDto extends PartialType(
  CreateInternshipApplicationDto,
) {
  @ApiPropertyOptional({
    description: 'Application status',
    enum: InternshipStatus,
  })
  @IsEnum(InternshipStatus)
  @IsOptional()
  status?: InternshipStatus;

  @ApiPropertyOptional({
    description: 'Admin notes',
    example: 'Good candidate for tech team',
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class InternshipApplicationResponseDto {
  @ApiProperty({ description: 'Application ID' })
  id: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Status', enum: InternshipStatus })
  status: InternshipStatus;

  @ApiProperty({ description: 'Department interest' })
  departmentInterest: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;
}