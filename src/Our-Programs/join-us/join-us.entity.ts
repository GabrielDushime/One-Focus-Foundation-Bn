import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum EducationLevel {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  UNIVERSITY = 'university',
  EMPLOYEE = 'employee',
  SELF_EMPLOYED = 'self_employed',
  MASTERS = 'masters',
  PHD = 'phd'
}

export enum SessionType {
  ONLINE = 'online',
  PHYSICAL = 'physical',
  BOTH = 'both'
}

@Entity('join_us_applications')
export class JoinUsApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: EducationLevel,
    name: 'education_level'
  })
  educationLevel: EducationLevel;

  @Column()
  country: string;

  @Column({ name: 'city_district' })
  cityDistrict: string;

  @Column({
    type: 'enum',
    enum: SessionType,
    name: 'session_availability'
  })
  sessionAvailability: SessionType;

  @Column({ type: 'text' })
  motivation: string;

  @Column({ name: 'info_accuracy_consent', default: false })
  infoAccuracyConsent: boolean;

  @Column({ name: 'communication_consent', default: false })
  communicationConsent: boolean;

  @Column({ name: 'workshop_understanding_consent', default: false })
  workshopUnderstandingConsent: boolean;

  @Column({ name: 'application_status', default: 'pending' })
  applicationStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}