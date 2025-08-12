import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsArray,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnershipType, PartnershipTimeline } from './partnership.entity';

export class CreatePartnershipDto {
  @ApiProperty({
    description: 'Name of Organization / Institution / Individual',
    example: 'Tech Innovation Hub',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  organizationName: string;

  @ApiProperty({
    description: 'Contact Person Name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  contactPersonName: string;

  @ApiProperty({
    description: 'Title/Position',
    example: 'Program Director',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  titlePosition: string;

  @ApiProperty({
    description: 'Email Address',
    example: 'john.doe@techhub.com',
  })
  @IsEmail()
  @IsNotEmpty()
  emailAddress: string;

  @ApiProperty({
    description: 'Phone Number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Website or Social Media',
    example: 'https://www.techhub.com',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  websiteSocialMedia?: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  country: string;

  @ApiProperty({
    description: 'City',
    example: 'San Francisco',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'Types of partnership interested in',
    example: [PartnershipType.TECHNICAL_SUPPORT, PartnershipType.YOUTH_MENTORSHIP],
    enum: PartnershipType,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(PartnershipType, { each: true })
  partnershipTypes: PartnershipType[];

  @ApiProperty({
    description: 'What do you hope to achieve through this partnership?',
    example: 'We aim to provide mentorship and technical training to young entrepreneurs...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  partnershipGoals: string;

  @ApiProperty({
    description: 'Describe your organization or project',
    example: 'Tech Innovation Hub is a non-profit organization focused on...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  organizationDescription: string;

  @ApiProperty({
    description: 'Preferred timeline or period of partnership',
    example: PartnershipTimeline.SIX_MONTHS,
    enum: PartnershipTimeline,
  })
  @IsEnum(PartnershipTimeline)
  preferredTimeline: PartnershipTimeline;

  @ApiProperty({
    description: 'What kind of support are you willing to offer?',
    example: 'We can provide venue space, technical mentors, and training materials...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  contributionCapacity: string;

  @ApiProperty({
    description: 'Agreement to collaborate under ethical terms',
    example: true,
  })
  @IsBoolean()
  termsAgreement: boolean;

  @ApiProperty({
    description: 'Agreement to communication and planning requirements',
    example: true,
  })
  @IsBoolean()
  communicationAgreement: boolean;
}
