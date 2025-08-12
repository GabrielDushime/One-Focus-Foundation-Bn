import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PodcastCategory {
  YOUNG_TALENTS = 'young_talents_on_journey',
  SUCCESSFUL_PERSONALITIES = 'successful_personalities_role_models',
  VISIONARY_MINDS = 'visionary_minds_business_innovation'
}

export enum ContentType {
  LIVE_CAMERA = 'live_camera',
  AUDIO_ONLY = 'audio_only',
  PRE_RECORDED = 'pre_recorded'
}

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

@Entity('book_us_applications')
export class BookUsApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'city_district' })
  cityDistrict: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ name: 'occupation_career' })
  occupationCareer: string;

  // Segment Selection
  @Column({
    type: 'enum',
    enum: PodcastCategory,
    name: 'podcast_category'
  })
  podcastCategory: PodcastCategory;

  // Content Type
  @Column({
    type: 'enum',
    enum: ContentType,
    name: 'content_type'
  })
  contentType: ContentType;

  // About You
  @Column({ type: 'text', name: 'story_description' })
  storyDescription: string;

  @Column({ type: 'text', name: 'message_to_youth' })
  messageToYouth: string;

  @Column({ name: 'has_podcast_experience', default: false })
  hasPodcastExperience: boolean;

  @Column({ type: 'text', name: 'experience_description', nullable: true })
  experienceDescription: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    name: 'booking_status',
    default: BookingStatus.PENDING
  })
  bookingStatus: BookingStatus;

  // Consent 
  @Column({ name: 'agrees_to_be_featured', type: 'boolean' })
  agreesTobeFeatured: boolean;

  @Column({ name: 'consent_to_guidelines', type: 'boolean' })
  consentToGuidelines: boolean;

  @Column({ name: 'scheduled_date', type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}