// src/Events/event.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany 
} from 'typeorm';
import { EventRegistration } from '../Event-Registration/event-registration.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum EventType {
  WORKSHOP = 'workshop',
  CONFERENCE = 'conference',
  WEBINAR = 'webinar',
  NETWORKING = 'networking',
  TRAINING = 'training',
  MENTORSHIP_SESSION = 'mentorship_session',
  OTHER = 'other'
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'event_photo', type: 'text', nullable: true })
  eventPhoto?: string;

  @Column({
    type: 'enum',
    enum: EventType,
    name: 'event_type',
    default: EventType.OTHER
  })
  eventType: EventType;

  @Column({ name: 'event_date', type: 'timestamp' })
  eventDate: Date;

  @Column({ name: 'event_time', type: 'varchar', length: 50 })
  eventTime: string;

  @Column({ name: 'location', type: 'varchar', length: 500 })
  location: string;

  @Column({ name: 'venue_type', type: 'varchar', length: 50, default: 'physical' })
  venueType: string; // 'physical', 'virtual', 'hybrid'

  @Column({ name: 'meeting_link', type: 'text', nullable: true })
  meetingLink?: string;

  @Column({ name: 'max_participants', type: 'int', nullable: true })
  maxParticipants?: number;

  @Column({ name: 'registration_deadline', type: 'timestamp', nullable: true })
  registrationDeadline?: Date;

  @Column({ name: 'is_free', type: 'boolean', default: true })
  isFree: boolean;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({
    type: 'enum',
    enum: EventStatus,
    name: 'status',
    default: EventStatus.DRAFT
  })
  status: EventStatus;

  @Column({ name: 'organizer_name', type: 'varchar', length: 255, nullable: true })
  organizerName?: string;

  @Column({ name: 'organizer_email', type: 'varchar', length: 255, nullable: true })
  organizerEmail?: string;

  @Column({ name: 'organizer_phone', type: 'varchar', length: 50, nullable: true })
  organizerPhone?: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'requirements', type: 'text', nullable: true })
  requirements?: string;

  @Column({ name: 'agenda', type: 'text', nullable: true })
  agenda?: string;

  @Column({ name: 'speaker_info', type: 'text', nullable: true })
  speakerInfo?: string;

  @OneToMany(() => EventRegistration, registration => registration.event)
  registrations: EventRegistration[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}