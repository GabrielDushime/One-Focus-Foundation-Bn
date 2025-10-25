import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ShootFormat, BookingStatus } from './bookshoot.entity';

export class CreateBookShootDto {
  @ApiProperty({
    description: 'Applicant name',
    example: 'Jane Smith',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  applicantName: string;

  @ApiProperty({
    description: 'Email address',
    example: 'jane.smith@example.com',
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
    description: 'Requested date and time',
    example: '2025-11-15T14:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  requestedDatetime: string;

  @ApiProperty({
    description: 'Shoot format',
    enum: ShootFormat,
    example: ShootFormat.PODCAST,
  })
  @IsEnum(ShootFormat)
  @IsNotEmpty()
  format: ShootFormat;

  @ApiProperty({
    description: 'Number of guests',
    example: 2,
    minimum: 1,
    maximum: 20,
  })
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  numberOfGuests: number;

  @ApiProperty({
    description: 'Location preference',
    example: 'ONEFOCUS Studio, Kigali',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  locationPreference: string;

  @ApiPropertyOptional({
    description: 'Any special requirements',
    example: 'Need microphone setup for 3 people',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  specialRequirements?: string;

  @ApiProperty({
    description: 'Consent: I agree to arrive at scheduled time and adhere to guidelines',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  consentConfirmed: boolean;
}

export class UpdateBookShootDto extends PartialType(CreateBookShootDto) {
  @ApiPropertyOptional({
    description: 'Booking status',
    enum: BookingStatus,
  })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiPropertyOptional({
    description: 'Admin notes',
    example: 'Confirmed with studio team',
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class BookShootResponseDto {
  @ApiProperty({ description: 'Booking ID' })
  id: string;

  @ApiProperty({ description: 'Applicant name' })
  applicantName: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Requested date and time' })
  requestedDatetime: Date;

  @ApiProperty({ description: 'Format', enum: ShootFormat })
  format: ShootFormat;

  @ApiProperty({ description: 'Status', enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;
}