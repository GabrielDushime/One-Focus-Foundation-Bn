import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInternshipApplicationDto, UpdateInternshipApplicationDto } from './internship.dto';
import { InternshipApplication, InternshipStatus } from './internship.entity';

@Injectable()
export class InternshipApplicationService {
  constructor(
    @InjectRepository(InternshipApplication)
    private readonly applicationRepository: Repository<InternshipApplication>,
  ) {}

  async createApplication(
    createDto: CreateInternshipApplicationDto,
  ): Promise<InternshipApplication> {
    // Validate consent
    if (!createDto.consentConfirmed) {
      throw new BadRequestException(
        'You must confirm that all information provided is true',
      );
    }

    // Validate availability dates
    const startDate = new Date(createDto.availabilityStart);
    const endDate = new Date(createDto.availabilityEnd);
    const now = new Date();

    if (startDate < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for duplicate application
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        email: createDto.email.toLowerCase(),
        status: InternshipStatus.PENDING,
      },
    });

    if (existingApplication) {
      throw new ConflictException(
        'You already have a pending internship application',
      );
    }

    // Create application
    const application = this.applicationRepository.create(createDto);
    return await this.applicationRepository.save(application);
  }

  async findAllApplications(
    page: number = 1,
    limit: number = 10,
    status?: InternshipStatus,
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

  async findApplicationById(id: string): Promise<InternshipApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async findApplicationsByEmail(email: string): Promise<InternshipApplication[]> {
    return await this.applicationRepository.find({
      where: { email: email.toLowerCase() },
      order: { createdAt: 'DESC' },
    });
  }

  async updateApplication(
    id: string,
    updateDto: UpdateInternshipApplicationDto,
  ): Promise<InternshipApplication> {
    const application = await this.findApplicationById(id);
    Object.assign(application, updateDto);
    return await this.applicationRepository.save(application);
  }

  async deleteApplication(id: string): Promise<void> {
    const application = await this.findApplicationById(id);
    await this.applicationRepository.remove(application);
  }
}