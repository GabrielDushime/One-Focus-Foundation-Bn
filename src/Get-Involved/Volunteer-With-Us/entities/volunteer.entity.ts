// src/volunteer/entities/volunteer.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum VolunteerRole {
  MENTOR = 'mentor',
  WORKSHOP_TRAINER = 'workshop_trainer',
  PODCAST_SUPPORT = 'podcast_support',
  TECHNICAL_SUPPORT = 'technical_support',
  EVENT_ORGANIZATION = 'event_organization',
  SCHOOL_OUTREACH = 'school_outreach',
  MEDIA_CONTENT_CREATION = 'media_content_creation',
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
}

export enum TimeSlot {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ONBOARDING = 'onboarding',
  ACTIVE = 'active',
}

@Entity('volunteers')
export class Volunteer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({ name: 'email_address', unique: true })
  emailAddress: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column('simple-array', { name: 'preferred_languages' })
  preferredLanguages: string[];

  // Volunteer Roles
  @Column({
    type: 'enum',
    enum: VolunteerRole,
    array: true,
    name: 'volunteer_roles',
  })
  volunteerRoles: VolunteerRole[];

  // Availability
  @Column({
    type: 'enum',
    enum: DayOfWeek,
    array: true,
    name: 'available_days',
  })
  availableDays: DayOfWeek[];

  @Column({
    type: 'enum',
    enum: TimeSlot,
    array: true,
    name: 'preferred_times',
  })
  preferredTimes: TimeSlot[];

  // Experience & Skills
  @Column('text', { name: 'relevant_experience' })
  relevantExperience: string;

  @Column({ name: 'linkedin_website', nullable: true })
  linkedinWebsite?: string;

  // Motivation
  @Column('text', { name: 'motivation' })
  motivation: string;

  // Agreement
  @Column({ name: 'mission_agreement', default: false })
  missionAgreement: boolean;

  @Column({ name: 'onboarding_agreement', default: false })
  onboardingAgreement: boolean;

  // Application Status
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column('text', { nullable: true, name: 'admin_notes' })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}