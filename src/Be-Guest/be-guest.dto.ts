
import { 
  IsString, 
  IsEmail, 
  IsEnum,
  IsNotEmpty,
  MaxLength,
  IsOptional
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { GuestType, GuestRequestStatus } from './be-guest.entity';

export class CreateGuestRequestDto {
  @ApiProperty({ 
    description: 'Full name',
    example: 'Jane Smith'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ 
    description: 'Email address',
    example: 'jane.smith@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    description: 'Phone number',
    example: '+250788123456'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;

  @ApiProperty({ 
    description: 'Organization/Company',
    example: 'Tech Innovation Hub'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  organization: string;

  @ApiProperty({ 
    description: 'Job title',
    example: 'Senior Software Engineer'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  jobTitle: string;

  @ApiProperty({ 
    description: 'Type of guest appearance',
    enum: GuestType,
    example: GuestType.PODCAST
  })
  @IsEnum(GuestType)
  @IsNotEmpty()
  guestType: GuestType;

  @ApiProperty({ 
    description: 'Topic/Area of expertise',
    example: 'AI and Machine Learning in Healthcare',
    maxLength: 500
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  topicExpertise: string;

  @ApiProperty({ 
    description: 'Why you want to be a guest',
    example: 'I want to share my experience and insights with the community.',
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  whyBeGuest: string;
}

export class UpdateGuestRequestDto {
  @ApiPropertyOptional({ 
    description: 'Request status',
    enum: GuestRequestStatus,
    example: GuestRequestStatus.APPROVED
  })
  @IsEnum(GuestRequestStatus)
  @IsOptional()
  requestStatus?: GuestRequestStatus;

  @ApiPropertyOptional({ 
    description: 'Admin notes',
    example: 'Contacted on 2025-10-10. Scheduled for podcast episode.'
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  adminNotes?: string;
}

export class GuestRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  organization: string;

  @ApiProperty()
  jobTitle: string;

  @ApiProperty({ enum: GuestType })
  guestType: GuestType;

  @ApiProperty()
  topicExpertise: string;

  @ApiProperty()
  whyBeGuest: string;



  @ApiProperty({ enum: GuestRequestStatus })
  requestStatus: GuestRequestStatus;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GuestRequestStatsDto {
  @ApiProperty()
  totalRequests: number;

  @ApiProperty()
  pendingRequests: number;

  @ApiProperty()
  approvedRequests: number;

  @ApiProperty()
  rejectedRequests: number;

  @ApiProperty()
  contactedRequests: number;

  @ApiProperty()
  byGuestType: Record<string, number>;
}