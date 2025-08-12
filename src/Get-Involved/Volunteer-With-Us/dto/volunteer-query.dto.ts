import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus, VolunteerRole } from '../entities/volunteer.entity';

export class VolunteerQueryDto {
  @ApiPropertyOptional({
    enum: ApplicationStatus,
    description: 'Filter by application status',
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    enum: VolunteerRole,
    description: 'Filter by volunteer role',
  })
  @IsOptional()
  @IsEnum(VolunteerRole)
  role?: VolunteerRole;

  @ApiPropertyOptional({
    description: 'Search by name or email',
  })
  @IsOptional()
  @IsString()
  search?: string;
}