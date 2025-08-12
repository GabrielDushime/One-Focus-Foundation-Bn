import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PartnershipType {
  EVENT_CO_HOSTING = 'Event Co-Hosting',
  YOUTH_MENTORSHIP = 'Youth Mentorship Collaboration',
  WORKSHOP_SPONSORSHIP = 'Workshop/Training Sponsorship',
  MEDIA_PARTNERSHIP = 'Media & Podcast Partnership',
  SCHOOL_OUTREACH = 'School Outreach Collaboration',
  TECHNICAL_SUPPORT = 'Technical/Creative Support',
  FINANCIAL_SPONSORSHIP = 'Financial Sponsorship',
  RESOURCE_CONTRIBUTION = 'Resource or Equipment Contribution',
  INTERNSHIP_PROGRAMS = 'Internship or Career Exposure Programs',
}

export enum PartnershipTimeline {
  ONGOING = 'Ongoing',
  THREE_MONTHS = '3 Months',
  SIX_MONTHS = '6 Months',
  ANNUAL = 'Annual',
}

export enum PartnershipStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('partnerships')
export class Partnership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Organization Information
  @Column({ name: 'organization_name' })
  organizationName: string;

  @Column({ name: 'contact_person_name' })
  contactPersonName: string;

  @Column({ name: 'title_position' })
  titlePosition: string;

  @Column({ name: 'email_address' })
  emailAddress: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'website_social_media', nullable: true })
  websiteSocialMedia?: string;

  @Column()
  country: string;

  @Column()
  city: string;

  // Partnership Details
  @Column('simple-array', { name: 'partnership_types' })
  partnershipTypes: PartnershipType[];

  @Column('text', { name: 'partnership_goals' })
  partnershipGoals: string;

  @Column('text', { name: 'organization_description' })
  organizationDescription: string;

  @Column({
    type: 'enum',
    enum: PartnershipTimeline,
    name: 'preferred_timeline',
  })
  preferredTimeline: PartnershipTimeline;

  @Column('text', { name: 'contribution_capacity' })
  contributionCapacity: string;

  // Agreement
  @Column({ name: 'terms_agreement', default: false })
  termsAgreement: boolean;

  @Column({ name: 'communication_agreement', default: false })
  communicationAgreement: boolean;

  // Status
  @Column({
    type: 'enum',
    enum: PartnershipStatus,
    default: PartnershipStatus.PENDING,
  })
  status: PartnershipStatus;

  @Column('text', { name: 'admin_notes', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
