// src/Sponsors/Corporate/corporate-sponsor.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OrganizationSize {
  SMALL = 'small_1_50',
  MEDIUM = 'medium_51_200',
  LARGE = 'large_200_plus'
}

export enum SponsorshipFocus {
  BRANDING_MARKETING = 'branding_marketing_visibility',
  CSR_COMMUNITY = 'csr_community_impact',
  TALENT_DEVELOPMENT = 'talent_development_recruitment'
}

export enum SponsorshipPackage {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  CUSTOM = 'custom'
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

export enum SponsorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REJECTED = 'rejected'
}

@Entity('corporate_sponsors')
export class CorporateSponsor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal/Company Information
  @Column({ name: 'full_name_organization' })
  fullNameOrganization: string;

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

  // Organization Details
  @Column({
    type: 'enum',
    enum: OrganizationSize,
    name: 'organization_size'
  })
  organizationSize: OrganizationSize;

  // Sponsorship Details
  @Column({
    type: 'simple-array',
    name: 'sponsorship_focus'
  })
  sponsorshipFocus: SponsorshipFocus[];

  @Column({
    type: 'enum',
    enum: SponsorshipPackage,
    name: 'sponsorship_package'
  })
  sponsorshipPackage: SponsorshipPackage;

  @Column({ name: 'custom_package_details', type: 'text', nullable: true })
  customPackageDetails?: string;

  // Contribution Details
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
    enum: SponsorStatus,
    name: 'sponsor_status',
    default: SponsorStatus.PENDING
  })
  sponsorStatus: SponsorStatus;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}