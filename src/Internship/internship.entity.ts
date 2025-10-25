import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InternshipStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum EducationLevel {
  HIGH_SCHOOL = 'high_school',
  DIPLOMA = 'diploma',
  BACHELORS = 'bachelors',
  MASTERS = 'masters',
  PHD = 'phd',
}

@Entity('internship_applications')
export class InternshipApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 50 })
  phone: string;

  @Column({ name: 'country', type: 'varchar', length: 100 })
  country: string;

  @Column({ name: 'city', type: 'varchar', length: 100 })
  city: string;

  @Column({
    type: 'enum',
    enum: EducationLevel,
    name: 'education_level',
  })
  educationLevel: EducationLevel;

  @Column({ name: 'department_interest', type: 'varchar', length: 255 })
  departmentInterest: string;

  @Column({ name: 'availability_start', type: 'date' })
  availabilityStart: Date;

  @Column({ name: 'availability_end', type: 'date' })
  availabilityEnd: Date;

  @Column({ name: 'statement', type: 'text' })
  statement: string;

  @Column({ name: 'consent_confirmed', type: 'boolean', default: false })
  consentConfirmed: boolean;

  @Column({
    type: 'enum',
    enum: InternshipStatus,
    name: 'status',
    default: InternshipStatus.PENDING,
  })
  status: InternshipStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}