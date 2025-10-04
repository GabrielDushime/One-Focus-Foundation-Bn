import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum WorkshopCategory {
  LEADERSHIP = 'leadership',
  DIGITAL_SKILLS = 'digital_skills',
  ENTREPRENEURSHIP = 'entrepreneurship',
  CREATIVE_ARTS = 'creative_arts',
  PERSONAL_DEVELOPMENT = 'personal_development',
  STEM = 'stem',
  COMMUNITY_IMPACT = 'community_impact'
}

export enum ParticipantType {
  INDIVIDUAL = 'individual',
  STUDENT = 'student',
  PROFESSIONAL = 'professional',
  EDUCATOR = 'educator',
  ORGANIZATION_REPRESENTATIVE = 'organization_representative'
}

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  WAITLISTED = 'waitlisted',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show'
}

export enum WorkshopFormat {
  IN_PERSON = 'in_person',
  VIRTUAL = 'virtual',
  HYBRID = 'hybrid'
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels'
}

@Entity('workshop_registrations')
export class WorkshopRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'country' })
  country: string;

  @Column({ name: 'city', nullable: true })
  city: string;

  @Column({ name: 'organization', nullable: true })
  organization: string;

  // Workshop Details
  @Column({ name: 'workshop_title' })
  workshopTitle: string;

  @Column({
    type: 'enum',
    enum: WorkshopCategory,
    name: 'workshop_category'
  })
  workshopCategory: WorkshopCategory;

  @Column({
    type: 'enum',
    enum: WorkshopFormat,
    name: 'workshop_format'
  })
  workshopFormat: WorkshopFormat;

  @Column({ name: 'preferred_date', type: 'date', nullable: true })
  preferredDate: Date;

  @Column({ name: 'workshop_session', nullable: true })
  workshopSession: string; // e.g., "Morning Session", "Afternoon Session"

  // Participant Information
  @Column({
    type: 'enum',
    enum: ParticipantType,
    name: 'participant_type'
  })
  participantType: ParticipantType;

  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    name: 'experience_level'
  })
  experienceLevel: ExperienceLevel;

  // Learning Goals and Interests
  @Column({ type: 'json', name: 'learning_goals' })
  learningGoals: string[]; // Array of specific learning objectives

  @Column({ type: 'text', name: 'expectations', nullable: true })
  expectations: string;

  @Column({ name: 'has_special_requirements', default: false })
  hasSpecialRequirements: boolean;

  @Column({ type: 'text', name: 'special_requirements', nullable: true })
  specialRequirements: string; // Accessibility, dietary, etc.

  // Group Registration
  @Column({ name: 'is_group_registration', default: false })
  isGroupRegistration: boolean;

  @Column({ name: 'group_size', type: 'int', nullable: true })
  groupSize: number;

  @Column({ name: 'group_name', nullable: true })
  groupName: string;

  // Consent and Agreements
  @Column({ name: 'consent_to_participate', type: 'boolean' })
  consentToParticipate: boolean;

  @Column({ name: 'agree_to_terms', type: 'boolean' })
  agreeToTerms: boolean;

  @Column({ name: 'agree_to_receive_updates', type: 'boolean' })
  agreeToReceiveUpdates: boolean;

  @Column({ name: 'photo_consent', type: 'boolean', default: false })
  photoConsent: boolean;

  // Registration Status
  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    name: 'registration_status',
    default: RegistrationStatus.PENDING
  })
  registrationStatus: RegistrationStatus;

  @Column({ name: 'payment_status', default: 'unpaid' })
  paymentStatus: string; // 'unpaid', 'paid', 'waived', 'pending'

  @Column({ name: 'workshop_fee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  workshopFee: number;

  // Certificate and Completion
  @Column({ name: 'certificate_requested', default: false })
  certificateRequested: boolean;

  @Column({ name: 'certificate_issued', default: false })
  certificateIssued: boolean;

  @Column({ name: 'attendance_percentage', type: 'int', nullable: true })
  attendancePercentage: number;

  // Referral and Source
  @Column({ name: 'how_did_you_hear', nullable: true })
  howDidYouHear: string; // 'Social Media', 'Website', 'Friend', 'Email', etc.

  @Column({ name: 'referral_code', nullable: true })
  referralCode: string;

  // Admin Notes
  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes: string;

  @Column({ name: 'confirmed_date', type: 'timestamp', nullable: true })
  confirmedDate: Date;

  @Column({ name: 'cancelled_date', type: 'timestamp', nullable: true })
  cancelledDate: Date;

  @Column({ name: 'cancellation_reason', nullable: true })
  cancellationReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}