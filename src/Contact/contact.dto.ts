

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ContactStatus } from './contact.entity';

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Inquiry about services', description: 'Subject' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  subject: string;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @ApiPropertyOptional({ enum: ContactStatus, description: 'Contact status' })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNotes?: string;

  @ApiPropertyOptional({ description: 'Mark as read' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class ContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  subject: string;

  @ApiProperty({ enum: ContactStatus })
  status: ContactStatus;

  @ApiPropertyOptional()
  adminNotes?: string;

  @ApiProperty()
  isRead: boolean;

  @ApiPropertyOptional()
  readAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ContactStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  new: number;

  @ApiProperty()
  read: number;

  @ApiProperty()
  replied: number;

  @ApiProperty()
  archived: number;
}
