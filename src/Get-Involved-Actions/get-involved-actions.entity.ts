
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InterestArea {
  PODCAST_GUEST = 'podcast_guest',
  EVENT_SPEAKER = 'event_speaker',
  MEDIA_COLLABORATOR = 'media_collaborator',
  STORY_CONTRIBUTOR = 'story_contributor',
  VOLUNTEER = 'volunteer',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONTACTED = 'contacted',
}

@Entity('get_involved_actions')
export class GetInvolvedAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 50 })
  phoneNumber: string;

  @Column({ name: 'country_code', type: 'varchar', length: 10, nullable: true })
  countryCode?: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({
    type: 'enum',
    enum: InterestArea,
    name: 'interest_area',
  })
  interestArea: InterestArea;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    name: 'status',
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ name: 'additional_info', type: 'text', nullable: true })
  additionalInfo?: string;

  @Column({ name: 'experience', type: 'text', nullable: true })
  experience?: string;

  @Column({ name: 'availability', type: 'varchar', length: 500, nullable: true })
  availability?: string;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ name: 'is_whatsapp', type: 'boolean', default: true })
  isWhatsapp: boolean;

  @Column({ name: 'contacted_at', type: 'timestamp', nullable: true })
  contactedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
