import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ShootFormat {
  PODCAST = 'podcast',
  VIDEO = 'video',
  INTERVIEW = 'interview',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  RESCHEDULED = 'rescheduled',
}

@Entity('book_shoot_applications')
export class BookShootApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'applicant_name', type: 'varchar', length: 200 })
  applicantName: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 50 })
  phone: string;

  @Column({ name: 'requested_datetime', type: 'timestamp' })
  requestedDatetime: Date;

  @Column({
    type: 'enum',
    enum: ShootFormat,
    name: 'format',
  })
  format: ShootFormat;

  @Column({ name: 'number_of_guests', type: 'int', default: 1 })
  numberOfGuests: number;

  @Column({ name: 'location_preference', type: 'varchar', length: 255 })
  locationPreference: string;

  @Column({ name: 'special_requirements', type: 'text', nullable: true })
  specialRequirements?: string;

  @Column({ name: 'consent_confirmed', type: 'boolean', default: false })
  consentConfirmed: boolean;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    name: 'status',
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
