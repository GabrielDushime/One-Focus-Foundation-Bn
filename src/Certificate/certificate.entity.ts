import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CertificateStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  ISSUED = 'issued',
  REJECTED = 'rejected',
}

export enum ProgramType {
  INTERNSHIP = 'internship',
  DESIGN = 'design',
  CODING = 'coding',
  SPEAKING = 'speaking',
  VIDEOGRAPHY = 'videography',
  SOCIAL_MEDIA = 'social_media',
}

@Entity('certificate_requests')
export class CertificateRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 50 })
  phone: string;

  @Column({
    type: 'enum',
    enum: ProgramType,
    name: 'program_completed',
  })
  programCompleted: ProgramType;

  @Column({ name: 'completion_date', type: 'date', nullable: true })
  completionDate?: Date;

  @Column({ name: 'additional_info', type: 'text', nullable: true })
  additionalInfo?: string;

  @Column({
    type: 'enum',
    enum: CertificateStatus,
    name: 'status',
    default: CertificateStatus.PENDING,
  })
  status: CertificateStatus;

  @Column({ name: 'certificate_number', type: 'varchar', length: 50, unique: true, nullable: true })
  certificateNumber?: string;

  @Column({ name: 'certificate_url', type: 'varchar', length: 500, nullable: true })
  certificateUrl?: string;

  @Column({ name: 'issued_date', type: 'date', nullable: true })
  issuedDate?: Date;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}