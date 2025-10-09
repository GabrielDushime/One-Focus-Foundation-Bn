
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../Event-creation/event.entity'

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show',
}

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 50 })
  phone: string;

  @Column({ name: 'organization', type: 'varchar', length: 255, nullable: true })
  organization?: string;

  @Column({ name: 'job_title', type: 'varchar', length: 255, nullable: true })
  jobTitle?: string;

  @Column({ name: 'age_group', type: 'varchar', length: 50, nullable: true })
  ageGroup?: string;

  @Column({ name: 'gender', type: 'varchar', length: 50, nullable: true })
  gender?: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ name: 'country', type: 'varchar', length: 100, default: 'Rwanda' })
  country: string;

  // Additional Information
  @Column({ name: 'dietary_restrictions', type: 'text', nullable: true })
  dietaryRestrictions?: string;

  @Column({ name: 'special_requirements', type: 'text', nullable: true })
  specialRequirements?: string;

  @Column({ name: 'how_did_you_hear', type: 'varchar', length: 255, nullable: true })
  howDidYouHear?: string;

  @Column({ name: 'additional_notes', type: 'text', nullable: true })
  additionalNotes?: string;

  // Agreement & Consent
  @Column({ name: 'agreed_to_terms', type: 'boolean', default: false })
  agreedToTerms: boolean;

  @Column({ name: 'agreed_at', type: 'timestamp', nullable: true })
  agreedAt?: Date;

  @Column({ name: 'consent_for_photography', type: 'boolean', default: false })
  consentForPhotography: boolean;

  @Column({ name: 'consent_for_communication', type: 'boolean', default: false })
  consentForCommunication: boolean;

  // Registration Details
  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    name: 'status',
    default: RegistrationStatus.CONFIRMED,
  })
  status: RegistrationStatus;

  @Column({ name: 'registration_number', type: 'varchar', length: 50, unique: true })
  registrationNumber: string;

  @Column({ name: 'attended', type: 'boolean', default: false })
  attended: boolean;

  @Column({ name: 'attendance_marked_at', type: 'timestamp', nullable: true })
  attendanceMarkedAt?: Date;

  @Column({ name: 'check_in_time', type: 'timestamp', nullable: true })
  checkInTime?: Date;

  @Column({ name: 'feedback', type: 'text', nullable: true })
  feedback?: string;

  @Column({ name: 'rating', type: 'int', nullable: true })
  rating?: number; // 1-5 stars

  // Relationship with Event
  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @ManyToOne(() => Event, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}