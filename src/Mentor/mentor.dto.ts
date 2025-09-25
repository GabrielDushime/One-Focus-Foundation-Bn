import { 
  IsString, 
  IsEmail, 
  IsEnum, 
  IsBoolean, 
  IsNumber,
  IsArray,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
  ArrayNotEmpty
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { 
  ProfessionalStatus,
  YearsOfExperience,
  EducationLevel,
  MentorshipArea,
  MentorshipFormat,
  Availability,
  MentorStatus
} from './mentor.entity';

export class CreateMentorDto {
  @ApiProperty({ 
    description: 'Full name of the mentor',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ 
    description: 'Email address of the mentor',
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

  @ApiProperty({ 
    description: 'Age of the mentor',
    example: 28,
    minimum: 18,
    maximum: 100
  })
  @IsNumber()
  @Min(18, { message: 'Age must be at least 18' })
  @Max(100, { message: 'Age must be less than 100' })
  @Type(() => Number)
  age: number;

  @ApiProperty({ 
    description: 'Location (City, Country)',
    example: 'Kigali, Rwanda'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  location: string;

  @ApiProperty({ 
    description: 'Current professional status',
    enum: ProfessionalStatus,
    example: ProfessionalStatus.EMPLOYEE
  })
  @IsEnum(ProfessionalStatus)
  @IsNotEmpty()
  professionalStatus: ProfessionalStatus;

  @ApiProperty({ 
    description: 'Field of expertise',
    example: 'Software Engineering'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fieldOfExpertise: string;

  @ApiProperty({ 
    description: 'Years of professional experience',
    enum: YearsOfExperience,
    example: YearsOfExperience.FOUR_TO_SIX
  })
  @IsEnum(YearsOfExperience)
  @IsNotEmpty()
  yearsOfExperience: YearsOfExperience;

  @ApiProperty({ 
    description: 'Highest level of education',
    enum: EducationLevel,
    example: EducationLevel.BACHELOR
  })
  @IsEnum(EducationLevel)
  @IsNotEmpty()
  educationLevel: EducationLevel;

  @ApiProperty({ 
    description: 'Why do you want to become a mentor? (Max 100 words)',
    example: 'I want to give back to the community and help young professionals develop their careers.',
    maxLength: 500
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Motivation message must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  motivationMessage: string;

  @ApiProperty({ 
    description: 'Primary area you can support mentees in',
    enum: MentorshipArea,
    example: MentorshipArea.CAREER_GUIDANCE
  })
  @IsEnum(MentorshipArea)
  @IsNotEmpty()
  mentorshipArea: MentorshipArea;

  @ApiProperty({ 
    description: 'Preferred mentorship formats',
    enum: MentorshipFormat,
    isArray: true,
    example: [MentorshipFormat.ONE_ON_ONE_VIRTUAL, MentorshipFormat.GROUP_SESSIONS]
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one mentorship format must be selected' })
  @IsEnum(MentorshipFormat, { each: true })
  preferredFormats: MentorshipFormat[];

  @ApiProperty({ 
    description: 'Availability schedule',
    enum: Availability,
    isArray: true,
    example: [Availability.WEEKDAYS_EVENINGS, Availability.WEEKENDS]
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one availability option must be selected' })
  @IsEnum(Availability, { each: true })
  availability: Availability[];

  @ApiProperty({ 
    description: 'I agree to dedicate time and effort to mentor youth respectfully and responsibly',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Agreement to mentor responsibly is required' })
  agreeToMentorResponsibly: boolean;

  @ApiProperty({ 
    description: 'I consent to ONEFOCUS Foundation guidelines for the mentorship program',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Consent to guidelines is required' })
  consentToGuidelines: boolean;
}

export class UpdateMentorDto {
  @ApiPropertyOptional({ 
    description: 'Mentor status',
    enum: MentorStatus,
    example: MentorStatus.APPROVED
  })
  @IsEnum(MentorStatus)
  mentorStatus?: MentorStatus;

  @ApiPropertyOptional({ 
    description: 'Admin notes about the mentor',
    example: 'Excellent background in software engineering. Approved for career guidance mentorship.'
  })
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  adminNotes?: string;
}

export class MentorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  location: string;

  @ApiProperty({ enum: ProfessionalStatus })
  professionalStatus: ProfessionalStatus;

  @ApiProperty()
  fieldOfExpertise: string;

  @ApiProperty({ enum: YearsOfExperience })
  yearsOfExperience: YearsOfExperience;

  @ApiProperty({ enum: EducationLevel })
  educationLevel: EducationLevel;

  @ApiProperty()
  motivationMessage: string;

  @ApiProperty({ enum: MentorshipArea })
  mentorshipArea: MentorshipArea;

  @ApiProperty({ enum: MentorshipFormat, isArray: true })
  preferredFormats: MentorshipFormat[];

  @ApiProperty({ enum: Availability, isArray: true })
  availability: Availability[];

  @ApiProperty()
  agreeToMentorResponsibly: boolean;

  @ApiProperty()
  consentToGuidelines: boolean;

  @ApiProperty({ enum: MentorStatus })
  mentorStatus: MentorStatus;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MentorStatsResponseDto {
  @ApiProperty()
  totalMentors: number;

  @ApiProperty()
  pendingMentors: number;

  @ApiProperty()
  approvedMentors: number;

  @ApiProperty()
  activeMentors: number;

  @ApiProperty()
  inactiveMentors: number;

  @ApiProperty()
  rejectedMentors: number;

  @ApiProperty()
  byProfessionalStatus: Record<string, number>;

  @ApiProperty()
  byMentorshipArea: Record<string, number>;

  @ApiProperty()
  byExperience: Record<string, number>;

  @ApiProperty()
  byEducationLevel: Record<string, number>;

  @ApiProperty()
  monthlyRegistrations: Array<{ month: string; count: number }>;
}