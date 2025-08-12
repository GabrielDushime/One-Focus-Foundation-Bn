import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AcademicProfessionalStatus {
  STUDENT = 'Student',
  GRADUATE = 'Graduate',
  JOB_SEEKER = 'Job Seeker',
  EARLY_CAREER_PROFESSIONAL = 'Early Career Professional',
  ENTREPRENEUR = 'Entrepreneur',
}

export enum SkillSupport {
  CAREER_GUIDANCE = 'Career Guidance',
  ENTREPRENEURSHIP = 'Entrepreneurship',
  PUBLIC_SPEAKING = 'Public Speaking',
  DIGITAL_SKILLS = 'Digital Skills',
  OTHER = 'Other',
}

@Entity('get_involved')
export class GetInvolved {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @ApiProperty({ description: 'Full name of the applicant' })
  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @ApiProperty({ description: 'Email address' })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ApiProperty({ description: 'Phone number (WhatsApp preferred)' })
  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @ApiProperty({ description: 'Age of the applicant', required: false })
  @Column({ type: 'int', nullable: true })
  age?: number;

  @ApiProperty({ description: 'Location (City, Country)' })
  @Column({ type: 'varchar', length: 255 })
  location: string;

  // About You
  @ApiProperty({ 
    description: 'Current academic/professional status',
    enum: AcademicProfessionalStatus
  })
  @Column({
    type: 'enum',
    enum: AcademicProfessionalStatus,
  })
  currentStatus: AcademicProfessionalStatus;

  @ApiProperty({ description: 'Field of interest or career path' })
  @Column({ type: 'varchar', length: 255 })
  fieldOfInterest: string;

  @ApiProperty({ description: 'Why you want a mentor (max 100 words)' })
  @Column({ type: 'text' })
  whyMentor: string;

  @ApiProperty({
    description: 'Skills or support looking for',
    enum: SkillSupport
  })
  @Column({
    type: 'enum',
    enum: SkillSupport,
  })
  skillsSupport: SkillSupport;

  // Mentorship Preferences
  @ApiProperty({ description: 'One-on-one virtual mentorship preference' })
  @Column({ type: 'boolean', default: false })
  oneOnOneVirtual: boolean;

  @ApiProperty({ description: 'Group mentorship sessions preference' })
  @Column({ type: 'boolean', default: false })
  groupSessions: boolean;

  @ApiProperty({ description: 'In-person mentorship preference (Rwanda only)' })
  @Column({ type: 'boolean', default: false })
  inPersonRwanda: boolean;

  @ApiProperty({ description: 'Weekday evenings availability' })
  @Column({ type: 'boolean', default: false })
  weekdayEvenings: boolean;

  @ApiProperty({ description: 'Weekend availability' })
  @Column({ type: 'boolean', default: false })
  weekends: boolean;

  @ApiProperty({ description: 'Flexible availability' })
  @Column({ type: 'boolean', default: false })
  flexible: boolean;

  // Consent
  @ApiProperty({ description: 'Agreement to participate with commitment and respect' })
  @Column({ type: 'boolean' })
  agreesToParticipate: boolean;

  @ApiProperty({ description: 'Consent to follow mentorship program guidelines' })
  @Column({ type: 'boolean' })
  consentToGuidelines: boolean;

  @ApiProperty({ description: 'Application status' })
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}