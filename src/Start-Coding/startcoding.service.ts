import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStartCodingDto, UpdateStartCodingDto } from './startcoding.dto';
import { StartCodingApplication, EnrollmentStatus } from './startcoding.entity';

@Injectable()
export class StartCodingService {
  constructor(
    @InjectRepository(StartCodingApplication)
    private readonly applicationRepository: Repository<StartCodingApplication>,
  ) {}

  async createApplication(
    createDto: CreateStartCodingDto,
  ): Promise<StartCodingApplication> {
    // Validate consent
    if (!createDto.consentConfirmed) {
      throw new BadRequestException(
        'You must confirm consent to proceed with the application',
      );
    }

    // Check for duplicate active application
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        email: createDto.email.toLowerCase(),
        status: EnrollmentStatus.PENDING,
      },
    });

    if (existingApplication) {
      throw new ConflictException(
        'You already have a pending coding program application',
      );
    }

    // Check if user already has an active enrollment
    const activeEnrollment = await this.applicationRepository.findOne({
      where: {
        email: createDto.email.toLowerCase(),
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (activeEnrollment) {
      throw new ConflictException(
        'You already have an active enrollment in the coding program',
      );
    }

    // Create application
    const application = this.applicationRepository.create(createDto);
    return await this.applicationRepository.save(application);
  }

  async findAllApplications(
    page: number = 1,
    limit: number = 10,
    status?: EnrollmentStatus,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.applicationRepository.createQueryBuilder('app');

    if (status) {
      queryBuilder.andWhere('app.status = :status', { status });
    }

    queryBuilder.orderBy('app.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [applications, total] = await queryBuilder.getManyAndCount();

    return {
      applications,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findApplicationById(id: string): Promise<StartCodingApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async findApplicationsByEmail(email: string): Promise<StartCodingApplication[]> {
    return await this.applicationRepository.find({
      where: { email: email.toLowerCase() },
      order: { createdAt: 'DESC' },
    });
  }

  async updateApplication(
    id: string,
    updateDto: UpdateStartCodingDto,
  ): Promise<StartCodingApplication> {
    const application = await this.findApplicationById(id);
    Object.assign(application, updateDto);
    return await this.applicationRepository.save(application);
  }

  async deleteApplication(id: string): Promise<void> {
    const application = await this.findApplicationById(id);
    await this.applicationRepository.remove(application);
  }
}