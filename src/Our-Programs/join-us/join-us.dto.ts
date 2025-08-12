import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsInt, 
  Min, 
  Max, 
  MaxLength,
  IsNotEmpty,
  ValidateIf
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Gender, EducationLevel, SessionType } from './join-us.entity';

export class CreateJoinUsApplicationDto {
  @ApiProperty({ 
    description: 'Full name of the applicant',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ 
    description: 'Email address of the applicant',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    description: 'Phone number (WhatsApp preferred)',
    example: '+250788123456'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;

  @ApiPropertyOptional({ 
    description: 'Age of the applicant',
    minimum: 15,
    maximum: 35,
    example: 25
  })
  @IsOptional()
  @IsInt()
  @Min(15, { message: 'Age must be at least 15 years old' })
  @Max(35, { message: 'Age must be at most 35 years old' })
  age?: number;

  @ApiPropertyOptional({ 
    description: 'Gender of the applicant',
    enum: Gender,
    example: Gender.MALE
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ 
    description: 'Education level of the applicant',
    enum: EducationLevel,
    example: EducationLevel.UNIVERSITY
  })
  @IsEnum(EducationLevel)
  @IsNotEmpty()
  educationLevel: EducationLevel;

  @ApiProperty({ 
    description: 'Country of residence',
    example: 'Rwanda'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  country: string;

  @ApiProperty({ 
    description: 'City or District of residence',
    example: 'Kigali'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  cityDistrict: string;

  @ApiProperty({ 
    description: 'Session availability preference',
    enum: SessionType,
    example: SessionType.ONLINE
  })
  @IsEnum(SessionType)
  @IsNotEmpty()
  sessionAvailability: SessionType;

  @ApiProperty({ 
    description: 'Motivation for joining (max 100 words)',
    example: 'I want to develop my skills and build a better career path...',
    maxLength: 500
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Motivation must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  motivation: string;

  @ApiProperty({ 
    description: 'Consent that information provided is accurate',
    example: true
  })
  @IsBoolean()
  @ValidateIf((o) => o.infoAccuracyConsent !== true)
  @IsNotEmpty({ message: 'You must confirm that the information provided is accurate' })
  infoAccuracyConsent: boolean;

  @ApiProperty({ 
    description: 'Agreement to receive communication updates from ONEFOCUS',
    example: true
  })
  @IsBoolean()
  @ValidateIf((o) => o.communicationConsent !== true)
  @IsNotEmpty({ message: 'You must agree to receive communication updates' })
  communicationConsent: boolean;

  @ApiProperty({ 
    description: 'Understanding that workshop is open to all youth',
    example: true
  })
  @IsBoolean()
  @ValidateIf((o) => o.workshopUnderstandingConsent !== true)
  @IsNotEmpty({ message: 'You must confirm understanding of the workshop terms' })
  workshopUnderstandingConsent: boolean;
}

export class UpdateJoinUsApplicationDto {
  @ApiPropertyOptional({ 
    description: 'Application status',
    example: 'approved'
  })
  @IsOptional()
  @IsString()
  applicationStatus?: string;
}

export class JoinUsApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ required: false })
  age?: number;

  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender;

  @ApiProperty({ enum: EducationLevel })
  educationLevel: EducationLevel;

  @ApiProperty()
  country: string;

  @ApiProperty()
  cityDistrict: string;

  @ApiProperty({ enum: SessionType })
  sessionAvailability: SessionType;

  @ApiProperty()
  motivation: string;

  @ApiProperty()
  infoAccuracyConsent: boolean;

  @ApiProperty()
  communicationConsent: boolean;

  @ApiProperty()
  workshopUnderstandingConsent: boolean;

  @ApiProperty()
  applicationStatus: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}