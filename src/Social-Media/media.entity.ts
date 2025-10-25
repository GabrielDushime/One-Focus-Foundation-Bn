import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SocialMediaPlatform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
}

export enum SupportRequestStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

@Entity('social_media_support_requests')
export class SocialMediaSupportRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'applicant_name', type: 'varchar', length: 200 })
  applicantName: string;

  @Column({ name: 'organization', type: 'varchar', length: 255, nullable: true })
  organization?: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 50 })
  phone: string;

  @Column({ name: 'social_media_handles', type: 'json' })
  socialMediaHandles: Record<string, string>;

  @Column({
    type: 'simple-array',
    name: 'platforms_requested',
  })
  platformsRequested: SocialMediaPlatform[];

  @Column({ name: 'support_description', type: 'text' })
  supportDescription: string;

  @Column({ name: 'goals_kpis', type: 'text' })
  goalsKPIs: string;

  @Column({ name: 'budget', type: 'varchar', length: 100, nullable: true })
  budget?: string;

  @Column({ name: 'consent_confirmed', type: 'boolean', default: false })
  consentConfirmed: boolean;

  @Column({
    type: 'enum',
    enum: SupportRequestStatus,
    name: 'status',
    default: SupportRequestStatus.PENDING,
  })
  status: SupportRequestStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ name: 'assigned_to', type: 'varchar', length: 255, nullable: true })
  assignedTo?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}