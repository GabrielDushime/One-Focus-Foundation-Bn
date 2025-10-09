import { 
  IsString, 
  IsEnum, 
  IsBoolean,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
  IsArray,
  IsUrl
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { EventStatus, EventType } from './event.entity';

export class CreateEventDto {
  @ApiProperty({ 
    description: 'Event title',
    example: 'Youth Empowerment Workshop 2025'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({ 
    description: 'Detailed event description',
    example: 'Join us for an inspiring workshop focused on empowering youth through skills development and networking opportunities.'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiPropertyOptional({ 
    description: 'Event photo (will be set from file upload)',
  })
  @IsString()
  @IsOptional()
  eventPhoto?: string;

  @ApiProperty({ 
    description: 'Type of event',
    enum: EventType,
    example: EventType.WORKSHOP
  })
  @IsEnum(EventType)
  @IsNotEmpty()
  eventType: EventType;

  @ApiProperty({ 
    description: 'Event date',
    example: '2025-12-15T00:00:00.000Z'
  })
  @IsDateString()
  @IsNotEmpty()
  eventDate: Date;

  @ApiProperty({ 
    description: 'Event time',
    example: '14:00 - 17:00 EAT'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  eventTime: string;

  @ApiProperty({ 
    description: 'Event location/venue',
    example: 'ONEFOCUS Foundation Office, Kigali'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  location: string;

  @ApiPropertyOptional({ 
    description: 'Venue type: physical, virtual, or hybrid',
    example: 'physical',
    enum: ['physical', 'virtual', 'hybrid'],
    default: 'physical'
  })
  @IsString()
  @IsOptional()
  venueType?: string;

  @ApiPropertyOptional({ 
    description: 'Meeting link for virtual/hybrid events',
    example: 'https://zoom.us/j/123456789'
  })
  @IsUrl()
  @IsOptional()
  meetingLink?: string;

  @ApiPropertyOptional({ 
    description: 'Maximum number of participants',
    example: 50
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  maxParticipants?: number;

  @ApiPropertyOptional({ 
    description: 'Registration deadline',
    example: '2025-12-10T23:59:59.000Z'
  })
  @IsDateString()
  @IsOptional()
  registrationDeadline?: Date;

  @ApiPropertyOptional({ 
    description: 'Is the event free?',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    // Handle string boolean from multipart form
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isFree?: boolean;

  @ApiPropertyOptional({ 
    description: 'Event price in RWF (if not free)',
    example: 10000
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ 
    description: 'Event status',
    enum: EventStatus,
    example: EventStatus.PUBLISHED,
    default: EventStatus.DRAFT
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiPropertyOptional({ 
    description: 'Organizer name',
    example: 'ONEFOCUS Foundation'
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  organizerName?: string;

  @ApiPropertyOptional({ 
    description: 'Organizer email',
    example: 'events@onefocus.org.rw'
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  organizerEmail?: string;

  @ApiPropertyOptional({ 
    description: 'Organizer phone',
    example: '+250788123456'
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  organizerPhone?: string;

  @ApiPropertyOptional({ 
    description: 'Event tags for categorization',
    example: ['youth', 'empowerment', 'workshop'],
    isArray: true
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Handle comma-separated string from multipart form
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return value;
  })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Event requirements or prerequisites',
    example: 'Participants should bring: laptop, notebook, and pen'
  })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiPropertyOptional({ 
    description: 'Event agenda or schedule',
    example: '14:00 - Opening Remarks | 14:30 - Workshop Session 1 | 16:00 - Break | 16:15 - Workshop Session 2 | 17:00 - Closing'
  })
  @IsString()
  @IsOptional()
  agenda?: string;

  @ApiPropertyOptional({ 
    description: 'Speaker or facilitator information',
    example: 'Dr. Jane Doe - Leadership Expert with 15 years of experience in youth empowerment'
  })
  @IsString()
  @IsOptional()
  speakerInfo?: string;
}

// DTO for Swagger documentation to show file upload field
export class CreateEventWithFileDto {
  @ApiProperty({
    description: 'Event title',
    example: 'Youth Empowerment Workshop 2025'
  })
  title: string;

  @ApiProperty({
    description: 'Detailed event description',
    example: 'Join us for an inspiring workshop focused on empowering youth through skills development and networking opportunities.'
  })
  description: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Upload event photo directly from your computer (jpg, jpeg, png, gif, webp - max 5MB)',
  })
  eventPhoto?: Express.Multer.File;

  @ApiProperty({
    description: 'Type of event',
    enum: EventType,
    example: EventType.WORKSHOP
  })
  eventType: string;

  @ApiProperty({
    description: 'Event date',
    example: '2025-12-15T00:00:00.000Z'
  })
  eventDate: string;

  @ApiProperty({
    description: 'Event time',
    example: '14:00 - 17:00 EAT'
  })
  eventTime: string;

  @ApiProperty({
    description: 'Event location/venue',
    example: 'ONEFOCUS Foundation Office, Kigali'
  })
  location: string;

  @ApiPropertyOptional({
    description: 'Venue type: physical, virtual, or hybrid',
    example: 'physical',
  })
  venueType?: string;

  @ApiPropertyOptional({
    description: 'Meeting link for virtual/hybrid events',
    example: 'https://zoom.us/j/123456789'
  })
  meetingLink?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of participants',
    example: '50'
  })
  maxParticipants?: string;

  @ApiPropertyOptional({
    description: 'Registration deadline',
    example: '2025-12-10T23:59:59.000Z'
  })
  registrationDeadline?: string;

  @ApiPropertyOptional({
    description: 'Is the event free? (true or false)',
    example: 'true'
  })
  isFree?: string;

  @ApiPropertyOptional({
    description: 'Event price in RWF (if not free)',
    example: '10000'
  })
  price?: string;

  @ApiPropertyOptional({
    description: 'Event status',
    enum: EventStatus,
    example: EventStatus.PUBLISHED,
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Organizer name',
    example: 'ONEFOCUS Foundation'
  })
  organizerName?: string;

  @ApiPropertyOptional({
    description: 'Organizer email',
    example: 'events@onefocus.org.rw'
  })
  organizerEmail?: string;

  @ApiPropertyOptional({
    description: 'Organizer phone',
    example: '+250788123456'
  })
  organizerPhone?: string;

  @ApiPropertyOptional({
    description: 'Event tags (comma-separated, e.g., "youth,empowerment,workshop")',
    example: 'youth,empowerment,workshop'
  })
  tags?: string;

  @ApiPropertyOptional({
    description: 'Event requirements or prerequisites',
    example: 'Participants should bring: laptop, notebook, and pen'
  })
  requirements?: string;

  @ApiPropertyOptional({
    description: 'Event agenda or schedule',
    example: '14:00 - Opening Remarks | 14:30 - Workshop Session 1'
  })
  agenda?: string;

  @ApiPropertyOptional({
    description: 'Speaker or facilitator information',
    example: 'Dr. Jane Doe - Leadership Expert'
  })
  speakerInfo?: string;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

export class EventResponseDto {
  @ApiProperty({ description: 'Event unique identifier' })
  id: string;

  @ApiProperty({ description: 'Event title' })
  title: string;

  @ApiProperty({ description: 'Event description' })
  description: string;

  @ApiProperty({ description: 'Event photo URL', required: false })
  eventPhoto?: string;

  @ApiProperty({ description: 'Event type', enum: EventType })
  eventType: EventType;

  @ApiProperty({ description: 'Event date' })
  eventDate: Date;

  @ApiProperty({ description: 'Event time' })
  eventTime: string;

  @ApiProperty({ description: 'Event location' })
  location: string;

  @ApiProperty({ description: 'Venue type' })
  venueType: string;

  @ApiProperty({ description: 'Meeting link for virtual events', required: false })
  meetingLink?: string;

  @ApiProperty({ description: 'Maximum participants', required: false })
  maxParticipants?: number;

  @ApiProperty({ description: 'Registration deadline', required: false })
  registrationDeadline?: Date;

  @ApiProperty({ description: 'Is event free?' })
  isFree: boolean;

  @ApiProperty({ description: 'Event price', required: false })
  price?: number;

  @ApiProperty({ description: 'Event status', enum: EventStatus })
  status: EventStatus;

  @ApiProperty({ description: 'Organizer name', required: false })
  organizerName?: string;

  @ApiProperty({ description: 'Organizer email', required: false })
  organizerEmail?: string;

  @ApiProperty({ description: 'Organizer phone', required: false })
  organizerPhone?: string;

  @ApiProperty({ description: 'Event tags', required: false, isArray: true })
  tags?: string[];

  @ApiProperty({ description: 'Event requirements', required: false })
  requirements?: string;

  @ApiProperty({ description: 'Event agenda', required: false })
  agenda?: string;

  @ApiProperty({ description: 'Speaker information', required: false })
  speakerInfo?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class EventStatsDto {
  @ApiProperty({ description: 'Total number of events' })
  totalEvents: number;

  @ApiProperty({ description: 'Number of published events' })
  publishedEvents: number;

  @ApiProperty({ description: 'Number of upcoming events' })
  upcomingEvents: number;

  @ApiProperty({ description: 'Number of ongoing events' })
  ongoingEvents: number;

  @ApiProperty({ description: 'Number of completed events' })
  completedEvents: number;

  @ApiProperty({ description: 'Total registrations across all events' })
  totalRegistrations: number;

  @ApiProperty({ description: 'Events count by type' })
  byEventType: Record<string, number>;

  @ApiProperty({ description: 'Monthly events statistics' })
  monthlyEvents: Array<{ month: string; count: number }>;
}