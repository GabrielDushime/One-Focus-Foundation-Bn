import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum GuestRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONTACTED = 'contacted'
}

export enum GuestType {
  PODCAST = 'podcast',
  WORKSHOP = 'workshop',
  EVENT_SPEAKER = 'event_speaker',
  WEBINAR = 'webinar'
}

@Entity('guest_requests')
export class GuestRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column()
  organization: string;

  @Column({ name: 'job_title' })
  jobTitle: string;

  @Column({
    type: 'enum',
    enum: GuestType,
    name: 'guest_type'
  })
  guestType: GuestType;

  @Column({ type: 'text', name: 'topic_expertise' })
  topicExpertise: string;

  @Column({ type: 'text', name: 'why_be_guest' })
  whyBeGuest: string;


  @Column({
    type: 'enum',
    enum: GuestRequestStatus,
    default: GuestRequestStatus.PENDING,
    name: 'request_status'
  })
  requestStatus: GuestRequestStatus;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}