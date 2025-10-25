import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
  IsArray,
  ArrayMinSize,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { SkillLevel, PaymentMethod, PaymentFrequency, EnrollmentStatus } from './startcoding.entity';

export class CreateStartCodingDto {
  @ApiProperty({
    description: 'Full name',
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
    description: 'Programming languages of interest',
    example: ['JavaScript', 'Python', 'React'],
    isArray: true,
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => value.map((v: string) => v.trim()))
  programmingLanguages: string[];

  @ApiProperty({
    description: 'Current skill level',
    enum: SkillLevel,
    example: SkillLevel.BEGINNER,
  })
  @IsEnum(SkillLevel)
  @IsNotEmpty()
  currentSkillLevel: SkillLevel;

  @ApiPropertyOptional({
    description: 'Portfolio or GitHub link',
    example: 'https://github.com/johndoe',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  portfolioLink?: string;

  @ApiProperty({
    description: 'What project would you like to build after training?',
    example: 'I want to build a mobile app that helps farmers...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(1500)
  projectStatement: string;

  @ApiProperty({
    description: 'Consent confirmation',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  consentConfirmed: boolean;

  @ApiProperty({
    description: 'Preferred payment method',
    enum: PaymentMethod,
    example: PaymentMethod.MOBILE_MONEY,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment frequency',
    enum: PaymentFrequency,
    example: PaymentFrequency.MONTHLY,
  })
  @IsEnum(PaymentFrequency)
  @IsNotEmpty()
  paymentFrequency: PaymentFrequency;
}

export class UpdateStartCodingDto extends PartialType(CreateStartCodingDto) {
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
}

export class StartCodingResponseDto {
  @ApiProperty({ description: 'Application ID' })
  id: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Programming languages', isArray: true })
  programmingLanguages: string[];

  @ApiProperty({ description: 'Skill level', enum: SkillLevel })
  currentSkillLevel: SkillLevel;

  @ApiProperty({ description: 'Status', enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;
}
