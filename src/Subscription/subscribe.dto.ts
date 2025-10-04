
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SubscriberStatus } from './subscribe.entity';

export class CreateSubscriberDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address to subscribe' })
  @IsEmail()
  email: string;
}

export class UpdateSubscriberDto {
  @ApiPropertyOptional({ enum: SubscriberStatus, description: 'Subscriber status' })
  @IsOptional()
  @IsEnum(SubscriberStatus)
  status?: SubscriberStatus;

  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNotes?: string;
}

export class SubscriberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: SubscriberStatus })
  status: SubscriberStatus;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiPropertyOptional()
  source?: string;

  @ApiPropertyOptional()
  unsubscribedAt?: Date;

  @ApiPropertyOptional()
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SubscriberStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  active: number;

  @ApiProperty()
  unsubscribed: number;

  @ApiProperty()
  bounced: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  todaySubscriptions: number;

  @ApiProperty()
  weekSubscriptions: number;

  @ApiProperty()
  monthSubscriptions: number;

  @ApiProperty()
  growthRate: number;
}

export class SubscriberAnalyticsDto {
  @ApiProperty()
  dailySubscriptions: { date: string; count: number }[];

  @ApiProperty()
  monthlySubscriptions: { month: string; count: number }[];

  @ApiProperty()
  topSources: { source: string; count: number }[];

  @ApiProperty()
  statusDistribution: { status: string; count: number; percentage: number }[];

  @ApiProperty()
  recentSubscribers: SubscriberResponseDto[];
}
