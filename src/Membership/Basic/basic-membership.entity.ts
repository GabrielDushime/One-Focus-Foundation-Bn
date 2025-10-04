// src/Membership/Basic/basic-membership.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AreasOfInterest {
  WORKSHOPS = 'workshops',
  MENTORSHIP = 'mentorship',
  VOICE_OF_TOMORROW_PODCAST = 'voice_of_tomorrow_podcast',
  NETWORKING_EVENTS = 'networking_events'
}

export enum MembershipStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Entity('basic_memberships')
export class BasicMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'second_name' })
  secondName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'country_city' })
  countryCity: string;

  @Column({ name: 'occupation_role' })
  occupationRole: string;

  @Column({ name: 'website_social_media', nullable: true })
  websiteSocialMedia?: string;

  // Membership Details
  @Column({ type: 'text', name: 'why_join_onefocus' })
  whyJoinOnefocus: string;

  @Column({
    type: 'simple-array',
    name: 'areas_of_interest'
  })
  areasOfInterest: AreasOfInterest[];

  // Agreement & Consent
  @Column({ name: 'confirm_accuracy', type: 'boolean' })
  confirmAccuracy: boolean;

  @Column({ name: 'agree_to_terms', type: 'boolean' })
  agreeToTerms: boolean;

  @Column({ name: 'signature', type: 'text' })
  signature: string;

  @Column({ name: 'signature_date', type: 'date' })
  signatureDate: Date;

  // Status and Tracking
  @Column({
    type: 'enum',
    enum: MembershipStatus,
    name: 'membership_status',
    default: MembershipStatus.PENDING
  })
  membershipStatus: MembershipStatus;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}