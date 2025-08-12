import {
  IsString,
  IsEmail,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsNotEmpty,
  ArrayMinSize,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Gender,
  VolunteerRole,
  DayOfWeek,
  TimeSlot,
} from '../entities/volunteer.entity';

export class CreateVolunteerDto {
  @ApiProperty({ 
    description: 'Full name of the volunteer',
    example: 'Jean Baptiste Uwimana'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ 
    enum: Gender, 
    description: 'Gender of the volunteer',
    example: Gender.MALE
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ 
    description: 'Date of birth (YYYY-MM-DD format)',
    example: '1992-08-15'
  })
  @IsDateString({}, { message: 'Date of birth must be in YYYY-MM-DD format' })
  dateOfBirth: string;

  @ApiProperty({ 
    description: 'Email address of the volunteer',
    example: 'jean.uwimana@gmail.com'
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  emailAddress: string;

  @ApiProperty({ 
    description: 'Phone number of the volunteer (WhatsApp preferred)',
    example: '+250788123456'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;

  @ApiProperty({ 
    description: 'Country of residence',
    example: 'Rwanda'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  country: string;

  @ApiProperty({ 
    description: 'City of residence',
    example: 'Kigali'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  city: string;

  @ApiProperty({
    type: [String],
    description: 'Preferred languages for communication and volunteering',
    example: ['English', 'Kinyarwanda', 'French']
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  preferredLanguages: string[];

  @ApiProperty({
    enum: VolunteerRole,
    isArray: true,
    description: 'Selected volunteer roles you are interested in',
    example: [VolunteerRole.MENTOR, VolunteerRole.WORKSHOP_TRAINER]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(VolunteerRole, { each: true })
  volunteerRoles: VolunteerRole[];

  @ApiProperty({
    enum: DayOfWeek,
    isArray: true,
    description: 'Days you are available to volunteer',
    example: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(DayOfWeek, { each: true })
  availableDays: DayOfWeek[];

  @ApiProperty({
    enum: TimeSlot,
    isArray: true,
    description: 'Preferred time slots (Rwanda Time)',
    example: [TimeSlot.MORNING, TimeSlot.AFTERNOON]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(TimeSlot, { each: true })
  preferredTimes: TimeSlot[];

  @ApiProperty({
    description: 'Describe your relevant experience in mentorship, training, speaking, media, or related fields (minimum 20 characters)',
    example: 'I have 5 years of experience as a software developer and have mentored over 20 junior developers. I conducted training workshops on React and Node.js at local tech meetups, and I have been a guest speaker at 3 university career fairs sharing insights about the tech industry.',
    maxLength: 2000
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Please provide at least 20 characters describing your relevant experience' })
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  relevantExperience: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile or personal website URL (optional)',
    example: 'https://linkedin.com/in/jean-uwimana-dev'
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Please provide a valid URL (including https://)' })
  @Transform(({ value }) => value?.trim())
  linkedinWebsite?: string;

  @ApiProperty({
    description: 'What drives you to be part of ONEFOCUS FOUNDATION? Share your motivation for volunteering (minimum 20 characters)',
    example: 'I am passionate about empowering young Rwandans to achieve their potential. Growing up, I benefited from mentors who guided me in my tech career, and now I want to give back to the community. I believe ONEFOCUS FOUNDATION\'s mission aligns with my values of youth empowerment and skills development.',
    maxLength: 2000
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Please provide at least 20 characters explaining your motivation' })
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  motivation: string;

  @ApiProperty({
    description: 'I commit to respecting the mission, values, and youth-centered ethics of ONEFOCUS FOUNDATION',
    example: true
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'You must agree to respect the mission and values' })
  missionAgreement: boolean;

  @ApiProperty({
    description: 'I agree to attend an online or in-person onboarding session before I begin volunteering',
    example: true
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'You must agree to attend the onboarding session' })
  onboardingAgreement: boolean;
}