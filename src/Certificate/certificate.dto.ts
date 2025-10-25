import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { CertificateStatus, ProgramType } from './certificate.entity';

export class CreateCertificateRequestDto {
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
    description: 'Program completed',
    enum: ProgramType,
    example: ProgramType.CODING,
  })
  @IsEnum(ProgramType)
  @IsNotEmpty()
  programCompleted: ProgramType;

  @ApiPropertyOptional({
    description: 'Completion date',
    example: '2024-12-15',
  })
  @IsDateString()
  @IsOptional()
  completionDate?: string;

  @ApiPropertyOptional({
    description: 'Additional information',
    example: 'Completed all modules with excellent performance',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  additionalInfo?: string;
}

export class UpdateCertificateRequestDto extends PartialType(
  CreateCertificateRequestDto,
) {
  @ApiPropertyOptional({
    description: 'Certificate status',
    enum: CertificateStatus,
  })
  @IsEnum(CertificateStatus)
  @IsOptional()
  status?: CertificateStatus;

  @ApiPropertyOptional({
    description: 'Certificate number',
    example: 'CERT-2024-001234',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  certificateNumber?: string;

  @ApiPropertyOptional({
    description: 'Certificate URL',
    example: 'https://certificates.onefocus.com/cert-001234.pdf',
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  certificateUrl?: string;

  @ApiPropertyOptional({
    description: 'Issued date',
    example: '2024-12-20',
  })
  @IsDateString()
  @IsOptional()
  issuedDate?: string;

  @ApiPropertyOptional({
    description: 'Admin notes',
    example: 'Certificate generated and sent via email',
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class CertificateRequestResponseDto {
  @ApiProperty({ description: 'Request ID' })
  id: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Program completed', enum: ProgramType })
  programCompleted: ProgramType;

  @ApiProperty({ description: 'Status', enum: CertificateStatus })
  status: CertificateStatus;

  @ApiPropertyOptional({ description: 'Certificate number' })
  certificateNumber?: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;
}