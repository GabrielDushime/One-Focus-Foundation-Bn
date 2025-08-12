import { IsString, IsEmail, IsOptional, IsInt, IsBoolean, IsEnum, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AcademicProfessionalStatus, SkillSupport } from './get-involved.entity';

export class CreateGetInvolvedDto {
  @ApiProperty({ description: 'Full name of the applicant', example: 'John Doe' })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ description: 'Phone number (WhatsApp preferred)', example: '+250123456789' })
  @IsString()
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({ description: 'Age of the applicant', example: 25, required: false })
  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(100)
  age?: number;

  @ApiProperty({ description: 'Location (City, Country)', example: 'Kigali, Rwanda' })
  @IsString()
  @MaxLength(255)
  location: string;

  @ApiProperty({
    description: 'Current academic/professional status',
    enum: AcademicProfessionalStatus,
    example: AcademicProfessionalStatus.STUDENT
  })
  @IsEnum(AcademicProfessionalStatus)
  currentStatus: AcademicProfessionalStatus;

  @ApiProperty({ description: 'Field of interest or career path', example: 'Software Development' })
  @IsString()
  @MaxLength(255)
  fieldOfInterest: string;

  @ApiProperty({
    description: 'Why you want a mentor (max 100 words)',
    example: 'I want to grow my technical skills and learn from experienced professionals in my field.'
  })
  @IsString()
  @MaxLength(500) // Allowing more characters for flexibility
  whyMentor: string;

  @ApiProperty({
    description: 'Skills or support looking for',
    enum: SkillSupport,
    example: SkillSupport.CAREER_GUIDANCE
  })
  @IsEnum(SkillSupport)
  skillsSupport: SkillSupport;

  @ApiProperty({ description: 'One-on-one virtual mentorship preference', example: true })
  @IsBoolean()
  oneOnOneVirtual: boolean;

  @ApiProperty({ description: 'Group mentorship sessions preference', example: false })
  @IsBoolean()
  groupSessions: boolean;

  @ApiProperty({ description: 'In-person mentorship preference (Rwanda only)', example: true })
  @IsBoolean()
  inPersonRwanda: boolean;

  @ApiProperty({ description: 'Weekday evenings availability', example: true })
  @IsBoolean()
  weekdayEvenings: boolean;

  @ApiProperty({ description: 'Weekend availability', example: false })
  @IsBoolean()
  weekends: boolean;

  @ApiProperty({ description: 'Flexible availability', example: true })
  @IsBoolean()
  flexible: boolean;

  @ApiProperty({ description: 'Agreement to participate with commitment and respect', example: true })
  @IsBoolean()
  agreesToParticipate: boolean;

  @ApiProperty({ description: 'Consent to follow mentorship program guidelines', example: true })
  @IsBoolean()
  consentToGuidelines: boolean;
}
