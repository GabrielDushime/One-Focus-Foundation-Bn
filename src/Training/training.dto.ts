import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ExperienceLevel, HowDidYouHear, EnrollmentStatus } from './training.entity';

export class CreateTrainingEnrollmentDto {
  @ApiProperty({
    description: 'Full name',
    example: 'Alice Johnson',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({
    description: 'Email address',
    example: 'alice@example.com',
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

  @ApiPropertyOptional({
    description: 'Age',
    example: 25,
    minimum: 13,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(13)
  @Max(100)
  @Type(() => Number)
  age?: number;

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
    description: 'Training program interested in',
    example: 'Web Development Bootcamp',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  trainingProgram: string;

  @ApiProperty({
    description: 'Prior experience level',
    enum: ExperienceLevel,
    example: ExperienceLevel.BEGINNER,
  })
  @IsEnum(ExperienceLevel)
  @IsNotEmpty()
  experienceLevel: ExperienceLevel;

  @ApiProperty({
    description: 'How did you hear about us?',
    enum: HowDidYouHear,
    example: HowDidYouHear.SOCIAL_MEDIA,
  })
  @IsEnum(HowDidYouHear)
  @IsNotEmpty()
  howDidYouHear: HowDidYouHear;

  @ApiPropertyOptional({
    description: 'Other source (if "Other" selected)',
    example: 'LinkedIn post',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  howDidYouHearOther?: string;

  @ApiProperty({
    description: 'Preferred start date',
    example: '2025-02-01',
  })
  @IsDateString()
  @IsNotEmpty()
  preferredStartDate: string;

  @ApiProperty({
    description: 'Payment confirmation checkbox',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  paymentConfirmed: boolean;
}

export class UpdateTrainingEnrollmentDto extends PartialType(
  CreateTrainingEnrollmentDto,
) {
  @ApiPropertyOptional({
    description: 'Enrollment status',
    enum: EnrollmentStatus,
  })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @ApiPropertyOptional({
    description: 'Admin notes',
    example: 'Student shows great potential',
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Assigned instructor',
    example: 'John Smith - Senior Developer',
  })
  @IsString()
  @IsOptional()
  assignedInstructor?: string;
}

export class TrainingEnrollmentResponseDto {
  @ApiProperty({ description: 'Enrollment ID' })
  id: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Training program' })
  trainingProgram: string;

  @ApiProperty({ description: 'Status', enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @ApiProperty({ description: 'Enrollment number' })
  enrollmentNumber: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;
}
