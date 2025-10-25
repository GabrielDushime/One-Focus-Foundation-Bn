import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrainingEnrollmentDto, UpdateTrainingEnrollmentDto } from './training.dto';
import { TrainingEnrollment, HowDidYouHear, EnrollmentStatus } from './training.entity';

@Injectable()
export class TrainingEnrollmentService {
  constructor(
    @InjectRepository(TrainingEnrollment)
    private readonly enrollmentRepository: Repository<TrainingEnrollment>,
  ) {}

  private generateEnrollmentNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRN-${timestamp}-${random}`;
  }

  async createEnrollment(
    createDto: CreateTrainingEnrollmentDto,
  ): Promise<TrainingEnrollment> {
    // Validate payment confirmation
    if (!createDto.paymentConfirmed) {
      throw new BadRequestException(
        'You must understand the program fee and agree to pay accordingly',
      );
    }

    // Validate preferred start date
    const startDate = new Date(createDto.preferredStartDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (startDate < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Validate "Other" field if selected
    if (createDto.howDidYouHear === HowDidYouHear.OTHER && !createDto.howDidYouHearOther) {
      throw new BadRequestException(
        'Please specify how you heard about us',
      );
    }

    // Check for duplicate enrollment
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        email: createDto.email.toLowerCase(),
        trainingProgram: createDto.trainingProgram,
        status: EnrollmentStatus.CONFIRMED,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException(
        'You are already enrolled in this training program',
      );
    }

    // Create enrollment
    const enrollment = this.enrollmentRepository.create({
      ...createDto,
      enrollmentNumber: this.generateEnrollmentNumber(),
      status: EnrollmentStatus.PAYMENT_PENDING,
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  async findAllEnrollments(
    page: number = 1,
    limit: number = 10,
    status?: EnrollmentStatus,
    program?: string,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.enrollmentRepository.createQueryBuilder('enrollment');

    if (status) {
      queryBuilder.andWhere('enrollment.status = :status', { status });
    }

    if (program) {
      queryBuilder.andWhere('enrollment.training_program ILIKE :program', {
        program: `%${program}%`,
      });
    }

    queryBuilder.orderBy('enrollment.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [enrollments, total] = await queryBuilder.getManyAndCount();

    return {
      enrollments,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findEnrollmentById(id: string): Promise<TrainingEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  async findEnrollmentByNumber(
    enrollmentNumber: string,
  ): Promise<TrainingEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { enrollmentNumber },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment with number ${enrollmentNumber} not found`,
      );
    }

    return enrollment;
  }

  async findEnrollmentsByEmail(email: string): Promise<TrainingEnrollment[]> {
    return await this.enrollmentRepository.find({
      where: { email: email.toLowerCase() },
      order: { createdAt: 'DESC' },
    });
  }

  async updateEnrollment(
    id: string,
    updateDto: UpdateTrainingEnrollmentDto,
  ): Promise<TrainingEnrollment> {
    const enrollment = await this.findEnrollmentById(id);

    // If confirming payment, set confirmation date
    if (updateDto.status === EnrollmentStatus.CONFIRMED && !enrollment.paymentConfirmationDate) {
      enrollment.paymentConfirmationDate = new Date();
    }

    Object.assign(enrollment, updateDto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async cancelEnrollment(id: string): Promise<TrainingEnrollment> {
    const enrollment = await this.findEnrollmentById(id);

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed enrollment');
    }

    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new ConflictException('Enrollment is already cancelled');
    }

    enrollment.status = EnrollmentStatus.CANCELLED;
    return await this.enrollmentRepository.save(enrollment);
  }

  async deleteEnrollment(id: string): Promise<void> {
    const enrollment = await this.findEnrollmentById(id);
    await this.enrollmentRepository.remove(enrollment);
  }

  async getEnrollmentStats(program?: string) {
    const queryBuilder = this.enrollmentRepository.createQueryBuilder('enrollment');

    if (program) {
      queryBuilder.where('enrollment.training_program ILIKE :program', {
        program: `%${program}%`,
      });
    }

    const total = await queryBuilder.getCount();

    const confirmed = await queryBuilder
      .clone()
      .andWhere('enrollment.status = :status', { status: EnrollmentStatus.CONFIRMED })
      .getCount();

    const inProgress = await queryBuilder
      .clone()
      .andWhere('enrollment.status = :status', { status: EnrollmentStatus.IN_PROGRESS })
      .getCount();

    const completed = await queryBuilder
      .clone()
      .andWhere('enrollment.status = :status', { status: EnrollmentStatus.COMPLETED })
      .getCount();

    return {
      total,
      confirmed,
      inProgress,
      completed,
    };
  }
}
