import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProfessionalStatus {
  EMPLOYEE = 'employee',
  ENTREPRENEUR = 'entrepreneur',
  SENIOR_PROFESSIONAL = 'senior_professional',
  ACADEMIC = 'academic',
  OTHER = 'other'
}

export enum YearsOfExperience {
  ONE_TO_THREE = '1_3',
  FOUR_TO_SIX = '4_6',
  SEVEN_TO_TEN = '7_10',
  TEN_PLUS = '10_plus'
}

export enum EducationLevel {
  BACHELOR = 'bachelor',
  MASTERS = 'masters',
  PHD = 'phd',
  PROFESSIONAL_CERTIFICATION = 'professional_certification',
  OTHER = 'other'
}

export enum MentorshipArea {
  CAREER_GUIDANCE = 'career_guidance',
  ENTREPRENEURSHIP = 'entrepreneurship',
  PUBLIC_SPEAKING = 'public_speaking',
  DIGITAL_SKILLS = 'digital_skills',
  LEADERSHIP = 'leadership',
  OTHER = 'other'
}

export enum MentorshipFormat {
  ONE_ON_ONE_VIRTUAL = 'one_on_one_virtual',
  GROUP_SESSIONS = 'group_sessions',
  IN_PERSON_RWANDA = 'in_person_rwanda'
}

export enum Availability {
  WEEKDAYS_EVENINGS = 'weekdays_evenings',
  WEEKENDS = 'weekends',
  FLEXIBLE = 'flexible'
}

export enum MentorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REJECTED = 'rejected'
}

@Entity('mentors')
export class Mentor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column()
  age: number;

  @Column()
  location: string;

  // Professional Background
  @Column({
    type: 'enum',
    enum: ProfessionalStatus,
    name: 'professional_status'
  })
  professionalStatus: ProfessionalStatus;

  @Column({ name: 'field_of_expertise' })
  fieldOfExpertise: string;

  @Column({
    type: 'enum',
    enum: YearsOfExperience,
    name: 'years_of_experience'
  })
  yearsOfExperience: YearsOfExperience;

  @Column({
    type: 'enum',
    enum: EducationLevel,
    name: 'education_level'
  })
  educationLevel: EducationLevel;

  // Mentorship Contribution
  @Column({ type: 'text', name: 'motivation_message' })
  motivationMessage: string;

  @Column({
    type: 'enum',
    enum: MentorshipArea,
    name: 'mentorship_area'
  })
  mentorshipArea: MentorshipArea;

  @Column({
    type: 'simple-array',
    name: 'preferred_formats'
  })
  preferredFormats: MentorshipFormat[];

  @Column({
    type: 'simple-array'
  })
  availability: Availability[];

  // Consent & Agreement
  @Column({ name: 'agree_to_mentor_responsibly', type: 'boolean' })
  agreeToMentorResponsibly: boolean;

  @Column({ name: 'consent_to_guidelines', type: 'boolean' })
  consentToGuidelines: boolean;

  // Status and Tracking
  @Column({
    type: 'enum',
    enum: MentorStatus,
    name: 'mentor_status',
    default: MentorStatus.PENDING
  })
  mentorStatus: MentorStatus;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}