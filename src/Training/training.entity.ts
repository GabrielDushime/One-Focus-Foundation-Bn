import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  PAYMENT_PENDING = 'payment_pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum HowDidYouHear {
  SOCIAL_MEDIA = 'social_media',
  FRIEND_REFERRAL = 'friend_referral',
  WEBSITE = 'website',
  GOOGLE_SEARCH = 'google_search',
  EVENT = 'event',
  OTHER = 'other',
}

@Entity('training_enrollments')
export class TrainingEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 50 })
  phone: string;

  @Column({ name: 'age', type: 'int', nullable: true })
  age?: number;

  @Column({ name: 'country', type: 'varchar', length: 100 })
  country: string;

  @Column({ name: 'training_program', type: 'varchar', length: 255 })
  trainingProgram: string;

  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    name: 'experience_level',
  })
  experienceLevel: ExperienceLevel;

  @Column({
    type: 'enum',
    enum: HowDidYouHear,
    name: 'how_did_you_hear',
  })
  howDidYouHear: HowDidYouHear;

  @Column({ name: 'how_did_you_hear_other', type: 'varchar', length: 255, nullable: true })
  howDidYouHearOther?: string;

  @Column({ name: 'preferred_start_date', type: 'date' })
  preferredStartDate: Date;

  @Column({ name: 'payment_confirmed', type: 'boolean', default: false })
  paymentConfirmed: boolean;

  @Column({ name: 'payment_confirmation_date', type: 'timestamp', nullable: true })
  paymentConfirmationDate?: Date;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    name: 'status',
    default: EnrollmentStatus.PENDING,
  })
  status: EnrollmentStatus;

  @Column({ name: 'enrollment_number', type: 'varchar', length: 50, unique: true })
  enrollmentNumber: string;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ name: 'assigned_instructor', type: 'varchar', length: 255, nullable: true })
  assignedInstructor?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}