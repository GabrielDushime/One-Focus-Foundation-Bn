// src/Membership/Premium/premium-membership.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CareerGrowthArea {
  ARTISTIC_TALENTS = 'artistic_talents',
  ACADEMIC_INTELLECTUAL = 'academic_intellectual',
  PERFORMING_ARTS = 'performing_arts',
  SPORTS_PHYSICAL = 'sports_physical',
  ENTREPRENEURSHIP_BUSINESS = 'entrepreneurship_business',
  TECHNOLOGY_DIGITAL = 'technology_digital',
  CULTURAL_TRADITIONAL = 'cultural_traditional',
  SOCIAL_COMMUNITY_IMPACT = 'social_community_impact',
  CULINARY_ARTS = 'culinary_arts',
  MISCELLANEOUS_SKILLS = 'miscellaneous_skills'
}

export enum MonthlyContribution {
  FIVE_K = '5000',
  FIFTEEN_K = '15000',
  THIRTY_K = '30000',
  FORTY_FIVE_K = '45000'
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_DEBIT_CARD = 'credit_debit_card'
}

export enum ContributionFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually'
}

export enum PremiumMembershipStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Entity('premium_memberships')
export class PremiumMembership {
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

  // Career Growth
  @Column({
    type: 'enum',
    enum: CareerGrowthArea,
    name: 'career_growth_area'
  })
  careerGrowthArea: CareerGrowthArea;

  // Contribution Details
  @Column({
    type: 'enum',
    enum: MonthlyContribution,
    name: 'monthly_contribution'
  })
  monthlyContribution: MonthlyContribution;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method'
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ContributionFrequency,
    name: 'contribution_frequency'
  })
  contributionFrequency: ContributionFrequency;

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
    enum: PremiumMembershipStatus,
    name: 'membership_status',
    default: PremiumMembershipStatus.PENDING
  })
  membershipStatus: PremiumMembershipStatus;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}