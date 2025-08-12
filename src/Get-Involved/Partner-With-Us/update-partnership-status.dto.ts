import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartnershipStatus } from './partnership.entity';

export class UpdatePartnershipStatusDto {
  @ApiPropertyOptional({
    description: 'Partnership status',
    enum: PartnershipStatus,
    example: PartnershipStatus.APPROVED,
  })
  @IsEnum(PartnershipStatus)
  @IsOptional()
  status?: PartnershipStatus;

  @ApiPropertyOptional({
    description: 'Admin notes',
    example: 'Approved for 6-month collaboration period',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  adminNotes?: string;
}
