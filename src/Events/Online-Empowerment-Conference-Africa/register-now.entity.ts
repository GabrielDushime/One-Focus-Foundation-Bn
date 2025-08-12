import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AgeGroup {
  UNDER_18 = 'under_18',
  EIGHTEEN_TO_25 = '18_25',
  TWENTY_SIX_TO_35 = '26_35',
  THIRTY_SIX_TO_45 = '36_45',
  FORTY_SIX_TO_55 = '46_55',
  OVER_55 = 'over_55'
}

export enum EngagementDetails {
  YOUTH_PARTICIPANT = 'youth_participant',
  GUEST_SPEAKER = 'guest_speaker',
  PARTNER_ORGANIZATION_REPRESENTATIVE = 'partner_organization_representative',
  VOLUNTEER = 'volunteer'
}

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended'
}

export enum ConferenceType {
  VIRTUAL = 'virtual',
  HYBRID = 'hybrid',
  IN_PERSON = 'in_person'
}

@Entity('conference_registrations')
export class ConferenceRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'country_of_residence' })
  countryOfResidence: string;

  @Column({
    type: 'enum',
    enum: AgeGroup,
    name: 'age_group'
  })
  ageGroup: AgeGroup;

  // Areas of Interest (stored as JSON array)
  @Column({ type: 'json', name: 'areas_of_interest' })
  areasOfInterest: string[];

  // Engagement Details
  @Column({
    type: 'enum',
    enum: EngagementDetails,
    name: 'engagement_details'
  })
  engagementDetails: EngagementDetails;

  // Panelists and Guests
  @Column({ name: 'wants_to_showcase_talent', default: false })
  wantsToShowcaseTalent: boolean;

  @Column({ type: 'text', name: 'brief_description', nullable: true })
  briefDescription: string;

  // Consent fields
  @Column({ name: 'consent_to_participate', type: 'boolean' })
  consentToParticipate: boolean;

  @Column({ name: 'agree_to_receive_updates', type: 'boolean' })
  agreeToReceiveUpdates: boolean;

  @Column({ name: 'agree_to_guidelines', type: 'boolean' })
  agreeToGuidelines: boolean;

  // Conference details
  @Column({
    type: 'enum',
    enum: ConferenceType,
    name: 'conference_type',
    default: ConferenceType.VIRTUAL
  })
  conferenceType: ConferenceType;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    name: 'registration_status',
    default: RegistrationStatus.PENDING
  })
  registrationStatus: RegistrationStatus;

  @Column({ name: 'conference_date', type: 'timestamp', nullable: true })
  conferenceDate: Date;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}