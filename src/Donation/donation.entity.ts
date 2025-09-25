import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DonationType {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  RECURRING = 'recurring'
}

export enum Currency {
  RWF = 'RWF',
  USD = 'USD',
  EUR = 'EUR'
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  OTHER = 'other'
}

export enum DonationPurpose {
  GENERAL_SUPPORT = 'general_support',
  YOUTH_WORKSHOPS = 'youth_workshops',
  MENTORSHIP_PROGRAM = 'mentorship_program',
  PODCAST = 'podcast',
  OTHER = 'other'
}

export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Donor Information
  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  email: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'country_city' })
  countryCity: string;

  // Donation Details
  @Column({
    type: 'enum',
    enum: DonationType,
    name: 'donation_type'
  })
  donationType: DonationType;

  @Column({ name: 'donation_amount', type: 'decimal', precision: 10, scale: 2 })
  donationAmount: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD
  })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method'
  })
  paymentMethod: PaymentMethod;

  // Additional Options
  @Column({
    type: 'enum',
    enum: DonationPurpose,
    name: 'purpose_of_donation',
    nullable: true
  })
  purposeOfDonation?: DonationPurpose;

  @Column({ type: 'text', name: 'message_to_onefocus', nullable: true })
  messageToOnefocus?: string;

  // Consent
  @Column({ name: 'agree_to_contribution_use', type: 'boolean' })
  agreeToContributionUse: boolean;

  @Column({ name: 'agree_to_receive_updates', type: 'boolean' })
  agreeToReceiveUpdates: boolean;

  // Status and Tracking
  @Column({
    type: 'enum',
    enum: DonationStatus,
    name: 'donation_status',
    default: DonationStatus.PENDING
  })
  donationStatus: DonationStatus;

  @Column({ name: 'transaction_reference', nullable: true })
  transactionReference?: string;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}