import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsArray,
  IsNumber,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
  ValidateIf,
  IsDateString,
  ArrayMinSize
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { 
  WorkshopCategory, 
  ParticipantType, 
  RegistrationStatus, 
  WorkshopFormat,
  ExperienceLevel 
} from './workshop.entity';

export const LEARNING_GOALS = [
  'Skill Development',
  'Networking',
  'Career Advancement',
  'Personal Growth',
  'Knowledge Acquisition',
  'Certification',
  'Community Building',
  'Other'
] as const;

export class CreateWorkshopRegistrationDto {
  
  @ApiProperty({ 
    description: 'Full name of the participant',
    example: 'John Smith'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ 
    description: 'Email address of the participant',
    example: 'john.smith@example.com'
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
  country: string;

  @ApiPropertyOptional({ 
    description: 'City of residence',
    example: 'Kigali'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  city?: string;

  @ApiPropertyOptional({ 
    description: 'Organization or institution name',
    example: 'Tech Innovators Ltd'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  organization?: string;

  @ApiProperty({ 
    description: 'Title of the workshop',
    example: 'Digital Marketing Fundamentals'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  workshopTitle: string;

  @ApiProperty({ 
    description: 'Category of the workshop',
    enum: WorkshopCategory,
    example: WorkshopCategory.DIGITAL_SKILLS
  })
  @IsEnum(WorkshopCategory)
  @IsNotEmpty()
  workshopCategory: WorkshopCategory;

  @ApiProperty({ 
    description: 'Preferred workshop format',
    enum: WorkshopFormat,
    example: WorkshopFormat.VIRTUAL
  })
  @IsEnum(WorkshopFormat)
  @IsNotEmpty()
  workshopFormat: WorkshopFormat;

  @ApiPropertyOptional({ 
    description: 'Preferred workshop date',
    example: '2024-12-15'
  })
  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @ApiPropertyOptional({ 
    description: 'Preferred workshop session',
    example: 'Morning Session (9:00 AM - 12:00 PM)'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  workshopSession?: string;

  @ApiProperty({ 
    description: 'Type of participant',
    enum: ParticipantType,
    example: ParticipantType.STUDENT
  })
  @IsEnum(ParticipantType)
  @IsNotEmpty()
  participantType: ParticipantType;

  @ApiProperty({ 
    description: 'Experience level in the workshop topic',
    enum: ExperienceLevel,
    example: ExperienceLevel.BEGINNER
  })
  @IsEnum(ExperienceLevel)
  @IsNotEmpty()
  experienceLevel: ExperienceLevel;

  @ApiProperty({ 
    description: 'Learning goals for the workshop',
    example: ['Skill Development', 'Networking', 'Career Advancement'],
    isArray: true,
    enum: LEARNING_GOALS
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Please select at least one learning goal' })
  @IsString({ each: true })
  learningGoals: string[];

  @ApiPropertyOptional({ 
    description: 'What do you hope to achieve from this workshop?',
    example: 'I want to learn practical digital marketing strategies to grow my business...',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Expectations must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  expectations?: string;

  @ApiProperty({ 
    description: 'Do you have any special requirements?',
    example: false
  })
  @IsBoolean()
  hasSpecialRequirements: boolean;

  @ApiPropertyOptional({ 
    description: 'Special requirements details (accessibility, dietary, etc.)',
    example: 'Wheelchair accessible venue needed',
    maxLength: 300
  })
  @ValidateIf((o) => o.hasSpecialRequirements === true)
  @IsNotEmpty({ message: 'Special requirements details are required when indicated' })
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Special requirements must not exceed 300 characters' })
  @Transform(({ value }) => value?.trim())
  specialRequirements?: string;

  @ApiProperty({ 
    description: 'Is this a group registration?',
    example: false
  })
  @IsBoolean()
  isGroupRegistration: boolean;

  @ApiPropertyOptional({ 
    description: 'Number of participants in the group',
    example: 5,
    minimum: 2,
    maximum: 50
  })
  @ValidateIf((o) => o.isGroupRegistration === true)
  @IsNotEmpty({ message: 'Group size is required for group registrations' })
  @IsOptional()
  @IsInt()
  @Min(2, { message: 'Group size must be at least 2' })
  @Max(50, { message: 'Group size cannot exceed 50' })
  groupSize?: number;

  @ApiPropertyOptional({ 
    description: 'Name of the group or organization',
    example: 'Tech Youth Initiative'
  })
  @ValidateIf((o) => o.isGroupRegistration === true)
  @IsNotEmpty({ message: 'Group name is required for group registrations' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  groupName?: string;

  @ApiProperty({ 
    description: 'I consent to participate in the workshop',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Consent to participate is required' })
  consentToParticipate: boolean;

  @ApiProperty({ 
    description: 'I agree to the workshop terms and conditions',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Agreement to terms is required' })
  agreeToTerms: boolean;

  @ApiProperty({ 
    description: 'I agree to receive workshop updates and communications',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Agreement to receive updates is required' })
  agreeToReceiveUpdates: boolean;

  @ApiPropertyOptional({ 
    description: 'I consent to being photographed/recorded during the workshop',
    example: true 
  })
  @IsOptional()
  @IsBoolean()
  photoConsent?: boolean;

  @ApiPropertyOptional({ 
    description: 'Would you like to receive a certificate of completion?',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  certificateRequested?: boolean;

  @ApiPropertyOptional({ 
    description: 'How did you hear about this workshop?',
    example: 'Social Media'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  howDidYouHear?: string;

  @ApiPropertyOptional({ 
    description: 'Referral code (if applicable)',
    example: 'FRIEND2024'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  referralCode?: string;
}

export class UpdateWorkshopRegistrationDto {
  @ApiPropertyOptional({ 
    description: 'Registration status',
    enum: RegistrationStatus,
    example: RegistrationStatus.CONFIRMED
  })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  registrationStatus?: RegistrationStatus;

  @ApiPropertyOptional({ 
    description: 'Payment status',
    example: 'paid'
  })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ 
    description: 'Workshop fee amount',
    example: 50.00
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  workshopFee?: number;

  @ApiPropertyOptional({ 
    description: 'Confirmed workshop date',
    example: '2024-12-15T10:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  confirmedDate?: string;

  @ApiPropertyOptional({ 
    description: 'Certificate issued status',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  certificateIssued?: boolean;

  @ApiPropertyOptional({ 
    description: 'Attendance percentage',
    example: 85,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  attendancePercentage?: number;

  @ApiPropertyOptional({ 
    description: 'Cancellation reason',
    example: 'Schedule conflict'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  cancellationReason?: string;

  @ApiPropertyOptional({ 
    description: 'Admin notes about the registration',
    example: 'Great participant, highly engaged'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  adminNotes?: string;
}

export class WorkshopRegistrationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  country: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  organization?: string;

  @ApiProperty()
  workshopTitle: string;

  @ApiProperty({ enum: WorkshopCategory })
  workshopCategory: WorkshopCategory;

  @ApiProperty({ enum: WorkshopFormat })
  workshopFormat: WorkshopFormat;

  @ApiProperty({ required: false })
  preferredDate?: Date;

  @ApiProperty({ required: false })
  workshopSession?: string;

  @ApiProperty({ enum: ParticipantType })
  participantType: ParticipantType;

  @ApiProperty({ enum: ExperienceLevel })
  experienceLevel: ExperienceLevel;

  @ApiProperty({ type: [String] })
  learningGoals: string[];

  @ApiProperty({ required: false })
  expectations?: string;

  @ApiProperty()
  hasSpecialRequirements: boolean;

  @ApiProperty({ required: false })
  specialRequirements?: string;

  @ApiProperty()
  isGroupRegistration: boolean;

  @ApiProperty({ required: false })
  groupSize?: number;

  @ApiProperty({ required: false })
  groupName?: string;

  @ApiProperty()
  consentToParticipate: boolean;

  @ApiProperty()
  agreeToTerms: boolean;

  @ApiProperty()
  agreeToReceiveUpdates: boolean;

  @ApiProperty()
  photoConsent: boolean;

  @ApiProperty({ enum: RegistrationStatus })
  registrationStatus: RegistrationStatus;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty({ required: false })
  workshopFee?: number;

  @ApiProperty()
  certificateRequested: boolean;

  @ApiProperty()
  certificateIssued: boolean;

  @ApiProperty({ required: false })
  attendancePercentage?: number;

  @ApiProperty({ required: false })
  howDidYouHear?: string;

  @ApiProperty({ required: false })
  referralCode?: string;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty({ required: false })
  confirmedDate?: Date;

  @ApiProperty({ required: false })
  cancelledDate?: Date;

  @ApiProperty({ required: false })
  cancellationReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class WorkshopStatsResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  confirmed: number;

  @ApiProperty()
  waitlisted: number;

  @ApiProperty()
  cancelled: number;

  @ApiProperty()
  attended: number;

  @ApiProperty()
  noShow: number;

  @ApiProperty()
  byCategory: Record<string, number>;

  @ApiProperty()
  byFormat: Record<string, number>;

  @ApiProperty()
  byParticipantType: Record<string, number>;

  @ApiProperty()
  byExperienceLevel: Record<string, number>;

  @ApiProperty()
  byLearningGoals: Record<string, number>;

  @ApiProperty()
  groupRegistrations: { total: number; totalParticipants: number };

  @ApiProperty()
  certificateStats: { requested: number; issued: number };

  @ApiProperty()
  paymentStats: { paid: number; unpaid: number; waived: number; totalRevenue: number };
}