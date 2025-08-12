import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsArray,
  MaxLength,
  IsNotEmpty,
  ValidateIf,
  IsDateString,
  ArrayMinSize
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { AgeGroup, EngagementDetails, RegistrationStatus, ConferenceType } from './register-now.entity';

// Available areas of interest
export const AREAS_OF_INTEREST = [
  'Leadership',
  'Digital Skills',
  'Business & Entrepreneurship',
  'Art & Creativity',
  'Storytelling',
  'Media & Podcasting',
  'SDGs & Community Impact',
  'Other'
] as const;

export class CreateConferenceRegistrationDto {
  
  @ApiProperty({ 
    description: 'Full name of the participant',
    example: 'Jane Doe'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ 
    description: 'Email address of the participant',
    example: 'jane.doe@example.com'
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

  @ApiProperty({ 
    description: 'Country of residence',
    example: 'Rwanda'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  countryOfResidence: string;

  @ApiProperty({ 
    description: 'Age group of the participant',
    enum: AgeGroup,
    example: AgeGroup.EIGHTEEN_TO_25
  })
  @IsEnum(AgeGroup)
  @IsNotEmpty()
  ageGroup: AgeGroup;

  @ApiProperty({ 
    description: 'Areas of interest for the conference',
    example: ['Leadership', 'Digital Skills', 'Business & Entrepreneurship'],
    isArray: true,
    enum: AREAS_OF_INTEREST
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Please select at least one area of interest' })
  @IsString({ each: true })
  areasOfInterest: string[];

  @ApiProperty({ 
    description: 'Engagement role at the conference',
    enum: EngagementDetails,
    example: EngagementDetails.YOUTH_PARTICIPANT
  })
  @IsEnum(EngagementDetails)
  @IsNotEmpty()
  engagementDetails: EngagementDetails;

  @ApiProperty({ 
    description: 'Would you like to showcase a talent or speak at the conference?',
    example: false
  })
  @IsBoolean()
  wantsToShowcaseTalent: boolean;

  @ApiPropertyOptional({ 
    description: 'Brief description of your talent or speaking topic (required if wantsToShowcaseTalent is true)',
    example: 'I would like to speak about youth entrepreneurship and share my startup journey...',
    maxLength: 500
  })
  @ValidateIf((o) => o.wantsToShowcaseTalent === true)
  @IsNotEmpty({ message: 'Brief description is required when you want to showcase talent' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Brief description must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  briefDescription?: string;

  @ApiProperty({ 
    description: 'I consent to participate in the Online Empowerment Conference Africa',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Consent to participate is required' })
  consentToParticipate: boolean;

  @ApiProperty({ 
    description: 'I agree to receive updates and communications related to the conference',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Agreement to receive updates is required' })
  agreeToReceiveUpdates: boolean;

  @ApiProperty({ 
    description: 'I agree to abide by the event guidelines and code of conduct',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Agreement to guidelines is required' })
  agreeToGuidelines: boolean;

  @ApiPropertyOptional({ 
    description: 'Conference type preference',
    enum: ConferenceType,
    example: ConferenceType.VIRTUAL
  })
  @IsOptional()
  @IsEnum(ConferenceType)
  conferenceType?: ConferenceType;
}

export class UpdateConferenceRegistrationDto {
  @ApiPropertyOptional({ 
    description: 'Registration status',
    enum: RegistrationStatus,
    example: RegistrationStatus.CONFIRMED
  })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  registrationStatus?: RegistrationStatus;

  @ApiPropertyOptional({ 
    description: 'Scheduled date for the conference',
    example: '2024-12-15T10:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  conferenceDate?: string;

  @ApiPropertyOptional({ 
    description: 'Conference type',
    enum: ConferenceType,
    example: ConferenceType.HYBRID
  })
  @IsOptional()
  @IsEnum(ConferenceType)
  conferenceType?: ConferenceType;

  @ApiPropertyOptional({ 
    description: 'Admin notes about the registration',
    example: 'Great speaker prospect for entrepreneurship panel'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  adminNotes?: string;
}

export class ConferenceRegistrationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  countryOfResidence: string;

  @ApiProperty({ enum: AgeGroup })
  ageGroup: AgeGroup;

  @ApiProperty({ type: [String] })
  areasOfInterest: string[];

  @ApiProperty({ enum: EngagementDetails })
  engagementDetails: EngagementDetails;

  @ApiProperty()
  wantsToShowcaseTalent: boolean;

  @ApiProperty({ required: false })
  briefDescription?: string;

  @ApiProperty()
  consentToParticipate: boolean;

  @ApiProperty()
  agreeToReceiveUpdates: boolean;

  @ApiProperty()
  agreeToGuidelines: boolean;

  @ApiProperty({ enum: ConferenceType })
  conferenceType: ConferenceType;

  @ApiProperty({ enum: RegistrationStatus })
  registrationStatus: RegistrationStatus;

  @ApiProperty({ required: false })
  conferenceDate?: Date;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ConferenceStatsResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  confirmed: number;

  @ApiProperty()
  cancelled: number;

  @ApiProperty()
  attended: number;

  @ApiProperty()
  byAgeGroup: Record<string, number>;

  @ApiProperty()
  byEngagementDetails: Record<string, number>;

  @ApiProperty()
  byAreasOfInterest: Record<string, number>;

  @ApiProperty()
  byConferenceType: Record<string, number>;

  @ApiProperty()
  talentShowcase: { interested: number; notInterested: number };
}