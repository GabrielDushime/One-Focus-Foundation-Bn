import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SkillLevel {
  NONE = 'none',
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  CASH = 'cash',
}

export enum PaymentFrequency {
  MONTHLY = 'monthly',
  PER_MODULE = 'per_module',
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
}

@Entity('start_coding_applications')
export class StartCodingApplication {
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

  @Column({ name: 'programming_languages', type: 'simple-array' })
  programmingLanguages: string[];

  @Column({
    type: 'enum',
    enum: SkillLevel,
    name: 'current_skill_level',
  })
  currentSkillLevel: SkillLevel;

  @Column({ name: 'portfolio_link', type: 'varchar', length: 500, nullable: true })
  portfolioLink?: string;

  @Column({ name: 'project_statement', type: 'text' })
  projectStatement: string;

  @Column({ name: 'consent_confirmed', type: 'boolean', default: false })
  consentConfirmed: boolean;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method',
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentFrequency,
    name: 'payment_frequency',
  })
  paymentFrequency: PaymentFrequency;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    name: 'status',
    default: EnrollmentStatus.PENDING,
  })
  status: EnrollmentStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
