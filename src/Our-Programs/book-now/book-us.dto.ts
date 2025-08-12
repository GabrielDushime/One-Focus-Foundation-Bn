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
  ValidateIf,
  IsDateString
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PodcastCategory, ContentType, BookingStatus } from './book-us.entity';

export class CreateBookUsApplicationDto {
  
  @ApiProperty({ 
    description: 'Full name of the applicant',
    example: 'Jane Doe'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ 
    description: 'Email address of the applicant',
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
    description: 'City or District of residence',
    example: 'Kigali'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  cityDistrict: string;

  @ApiPropertyOptional({ 
    description: 'Age of the applicant',
    minimum: 16,
    maximum: 65,
    example: 28
  })
  @IsOptional()
  @IsInt()
  @Min(16, { message: 'Age must be at least 16 years old' })
  @Max(65, { message: 'Age must be at most 65 years old' })
  age?: number;

  @ApiProperty({ 
    description: 'Occupation or career path',
    example: 'Software Developer'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  occupationCareer: string;

  // Segment Selection
  @ApiProperty({ 
    description: 'Podcast category that fits the story best',
    enum: PodcastCategory,
    example: PodcastCategory.YOUNG_TALENTS
  })
  @IsEnum(PodcastCategory)
  @IsNotEmpty()
  podcastCategory: PodcastCategory;

  // Content Type
  @ApiProperty({ 
    description: 'Preferred content type for the podcast',
    enum: ContentType,
    example: ContentType.LIVE_CAMERA
  })
  @IsEnum(ContentType)
  @IsNotEmpty()
  contentType: ContentType;

  // About You
  @ApiProperty({ 
    description: 'Brief description of story, business idea, or talent (max 500 characters)',
    example: 'I started a tech company at 22 and have been building innovative solutions...',
    maxLength: 500
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Story description must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  storyDescription: string;

  @ApiProperty({ 
    description: 'Message you want to share with youth or audience',
    example: 'Never give up on your dreams, start small but think big...',
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Message to youth must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  messageToYouth: string;

  @ApiProperty({ 
    description: 'Do you have previous podcast or public speaking experience?',
    example: true
  })
  @IsBoolean()
  hasPodcastExperience: boolean;

  @ApiPropertyOptional({ 
    description: 'Brief description of previous experience (required if hasPodcastExperience is true)',
    example: 'I have been a guest on 3 local radio shows and spoke at 2 tech conferences...',
    maxLength: 500
  })
  @ValidateIf((o) => o.hasPodcastExperience === true)
  @IsNotEmpty({ message: 'Experience description is required when you have previous experience' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Experience description must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  experienceDescription?: string;

  // Consent Fields - Added these missing fields
  @ApiProperty({ 
    description: 'I agree to be featured publicly on ONEFOCUS platforms', 
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Agreement to be featured is required' })
  agreesTobeFeatured: boolean;

  @ApiProperty({ 
    description: 'I understand this is a youth empowerment platform and agree to share positively and responsibly', 
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Consent to guidelines is required' })
  consentToGuidelines: boolean;
}

export class UpdateBookUsApplicationDto {
  @ApiPropertyOptional({ 
    description: 'Booking status',
    enum: BookingStatus,
    example: BookingStatus.APPROVED
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  bookingStatus?: BookingStatus;

  @ApiPropertyOptional({ 
    description: 'Scheduled date for the podcast',
    example: '2024-12-15T10:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ 
    description: 'Admin notes about the application',
    example: 'Great story, perfect for our young talents segment'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  adminNotes?: string;
}

export class BookUsApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  cityDistrict: string;

  @ApiProperty({ required: false })
  age?: number;

  @ApiProperty()
  occupationCareer: string;

  @ApiProperty({ enum: PodcastCategory })
  podcastCategory: PodcastCategory;

  @ApiProperty({ enum: ContentType })
  contentType: ContentType;

  @ApiProperty()
  storyDescription: string;

  @ApiProperty()
  messageToYouth: string;

  @ApiProperty()
  hasPodcastExperience: boolean;

  @ApiProperty({ required: false })
  experienceDescription?: string;

  @ApiProperty()
  agreesTobeFeatured: boolean;

  @ApiProperty()
  consentToGuidelines: boolean;

  @ApiProperty({ enum: BookingStatus })
  bookingStatus: BookingStatus;

  @ApiProperty({ required: false })
  scheduledDate?: Date;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BookUsStatsResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  approved: number;

  @ApiProperty()
  scheduled: number;

  @ApiProperty()
  completed: number;

  @ApiProperty()
  rejected: number;

  @ApiProperty()
  byCategory: Record<string, number>;

  @ApiProperty()
  byContentType: Record<string, number>;

  @ApiProperty()
  byExperience: { experienced: number; newTalent: number };
}