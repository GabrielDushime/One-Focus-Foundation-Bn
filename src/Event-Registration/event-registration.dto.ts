
import {
  IsString,
  IsEmail,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { RegistrationStatus } from './event-registration.entity';

export class CreateEventRegistrationDto {
  @ApiProperty({
    description: 'Event ID to register for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName: string;

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

  @ApiPropertyOptional({
    description: 'Organization/Company name',
    example: 'Tech Solutions Ltd',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  organization?: string;

  @ApiPropertyOptional({
    description: 'Job title/Position',
    example: 'Software Developer',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  jobTitle?: string;

  @ApiPropertyOptional({
    description: 'Age group',
    example: '25-34',
    enum: ['18-24', '25-34', '35-44', '45-54', '55+'],
  })
  @IsString()
  @IsOptional()
  ageGroup?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    example: 'Female',
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Kigali',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  city?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'Rwanda',
    default: 'Rwanda',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  country?: string;

  @ApiPropertyOptional({
    description: 'Dietary restrictions or preferences',
    example: 'Vegetarian',
  })
  @IsString()
  @IsOptional()
  dietaryRestrictions?: string;

  @ApiPropertyOptional({
    description: 'Special requirements (accessibility, etc.)',
    example: 'Wheelchair accessible seating',
  })
  @IsString()
  @IsOptional()
  specialRequirements?: string;

  @ApiPropertyOptional({
    description: 'How did you hear about this event?',
    example: 'Social Media',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  howDidYouHear?: string;

  @ApiPropertyOptional({
    description: 'Additional notes or comments',
    example: 'Looking forward to the workshop!',
  })
  @IsString()
  @IsOptional()
  additionalNotes?: string;

  @ApiProperty({
    description: 'Agreement to terms and conditions',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  agreedToTerms: boolean;

  @ApiPropertyOptional({
    description: 'Consent for event photography and media',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  consentForPhotography?: boolean;

  @ApiPropertyOptional({
    description: 'Consent for future communication',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  consentForCommunication?: boolean;
}

export class UpdateEventRegistrationDto extends PartialType(
  CreateEventRegistrationDto,
) {
  @ApiPropertyOptional({
    description: 'Registration status',
    enum: RegistrationStatus,
  })
  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;
}

export class MarkAttendanceDto {
  @ApiProperty({
    description: 'Whether the participant attended',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  attended: boolean;
}

export class SubmitFeedbackDto {
  @ApiProperty({
    description: 'Event rating (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({
    description: 'Detailed feedback',
    example: 'Great event! Very informative and well organized.',
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class EventRegistrationResponseDto {
  @ApiProperty({ description: 'Registration unique identifier' })
  id: string;

  @ApiProperty({ description: 'Event ID' })
  eventId: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Phone number' })
  phone: string;

  @ApiProperty({ description: 'Organization', required: false })
  organization?: string;

  @ApiProperty({ description: 'Job title', required: false })
  jobTitle?: string;

  @ApiProperty({ description: 'Registration number' })
  registrationNumber: string;

  @ApiProperty({ description: 'Registration status', enum: RegistrationStatus })
  status: RegistrationStatus;

  @ApiProperty({ description: 'Agreed to terms' })
  agreedToTerms: boolean;

  @ApiProperty({ description: 'Event details' })
  event: any;

  @ApiProperty({ description: 'Registration date' })
  createdAt: Date;
}

export class RegistrationStatsDto {
  @ApiProperty({ description: 'Total registrations for the event' })
  totalRegistrations: number;

  @ApiProperty({ description: 'Confirmed registrations' })
  confirmedRegistrations: number;

  @ApiProperty({ description: 'Cancelled registrations' })
  cancelledRegistrations: number;

  @ApiProperty({ description: 'Attended participants' })
  attendedCount: number;

  @ApiProperty({ description: 'No-show count' })
  noShowCount: number;

  @ApiProperty({ description: 'Available spots (if limited)' })
  availableSpots?: number;

  @ApiProperty({ description: 'Average rating' })
  averageRating?: number;
}