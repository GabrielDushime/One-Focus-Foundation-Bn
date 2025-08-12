import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { BookUsApplication, BookingStatus } from './book-us.entity';
import { CreateBookUsApplicationDto, UpdateBookUsApplicationDto } from './book-us.dto';

@Injectable()
export class BookUsService {
  constructor(
    @InjectRepository(BookUsApplication)
    private readonly bookUsRepository: Repository<BookUsApplication>,
  ) {}

  async createApplication(createBookUsApplicationDto: CreateBookUsApplicationDto): Promise<BookUsApplication> {
    // Check if user already applied with this email
    const existingApplication = await this.bookUsRepository.findOne({
      where: { email: createBookUsApplicationDto.email }
    });

    if (existingApplication) {
      throw new ConflictException('An application with this email already exists');
    }

    // Validate consent agreements - Fixed to use the DTO instance, not the class
    if (!createBookUsApplicationDto.agreesTobeFeatured || !createBookUsApplicationDto.consentToGuidelines) {
      throw new ConflictException('Both consent agreements must be accepted');
    }
    
    const application = this.bookUsRepository.create(createBookUsApplicationDto);
    return await this.bookUsRepository.save(application);
  }

  async findAllApplications(
    page: number = 1, 
    limit: number = 10, 
    status?: BookingStatus,
    category?: string
  ): Promise<{ applications: BookUsApplication[]; total: number; totalPages: number }> {
    const options: FindManyOptions<BookUsApplication> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const whereClause: any = {};
    if (status) {
      whereClause.bookingStatus = status;
    }
    if (category) {
      whereClause.podcastCategory = category;
    }

    if (Object.keys(whereClause).length > 0) {
      options.where = whereClause;
    }

    const [applications, total] = await this.bookUsRepository.findAndCount(options);
    
    return {
      applications,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findApplicationById(id: string): Promise<BookUsApplication> {
    const application = await this.bookUsRepository.findOne({ where: { id } });
    
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async findApplicationByEmail(email: string): Promise<BookUsApplication> {
    const application = await this.bookUsRepository.findOne({ where: { email } });
    
    if (!application) {
      throw new NotFoundException(`Application with email ${email} not found`);
    }

    return application;
  }

  async updateApplication(id: string, updateBookUsApplicationDto: UpdateBookUsApplicationDto): Promise<BookUsApplication> {
    const application = await this.findApplicationById(id);
    
    // Convert scheduled date string to Date object if provided
    if (updateBookUsApplicationDto.scheduledDate) {
      updateBookUsApplicationDto.scheduledDate = new Date(updateBookUsApplicationDto.scheduledDate) as any;
    }

    Object.assign(application, updateBookUsApplicationDto);
    
    return await this.bookUsRepository.save(application);
  }

  async deleteApplication(id: string): Promise<void> {
    const application = await this.findApplicationById(id);
    await this.bookUsRepository.remove(application);
  }

  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    scheduled: number;
    completed: number;
    rejected: number;
    byCategory: Record<string, number>;
    byContentType: Record<string, number>;
    byExperience: { experienced: number; newTalent: number };
  }> {
    const total = await this.bookUsRepository.count();
    const pending = await this.bookUsRepository.count({ where: { bookingStatus: BookingStatus.PENDING } });
    const approved = await this.bookUsRepository.count({ where: { bookingStatus: BookingStatus.APPROVED } });
    const scheduled = await this.bookUsRepository.count({ where: { bookingStatus: BookingStatus.SCHEDULED } });
    const completed = await this.bookUsRepository.count({ where: { bookingStatus: BookingStatus.COMPLETED } });
    const rejected = await this.bookUsRepository.count({ where: { bookingStatus: BookingStatus.REJECTED } });

    // Get statistics by podcast category
    const categoryStats = await this.bookUsRepository
      .createQueryBuilder('app')
      .select('app.podcastCategory', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.podcastCategory')
      .getRawMany();

    const byCategory = categoryStats.reduce((acc, stat) => {
      acc[stat.category] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by content type
    const contentTypeStats = await this.bookUsRepository
      .createQueryBuilder('app')
      .select('app.contentType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.contentType')
      .getRawMany();

    const byContentType = contentTypeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    // Get statistics by experience
    const experienced = await this.bookUsRepository.count({ where: { hasPodcastExperience: true } });
    const newTalent = await this.bookUsRepository.count({ where: { hasPodcastExperience: false } });

    return {
      total,
      pending,
      approved,
      scheduled,
      completed,
      rejected,
      byCategory,
      byContentType,
      byExperience: { experienced, newTalent }
    };
  }

  async getScheduledApplications(startDate?: string, endDate?: string): Promise<BookUsApplication[]> {
    const query = this.bookUsRepository
      .createQueryBuilder('app')
      .where('app.bookingStatus = :status', { status: BookingStatus.SCHEDULED })
      .andWhere('app.scheduledDate IS NOT NULL');

    if (startDate) {
      query.andWhere('app.scheduledDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('app.scheduledDate <= :endDate', { endDate });
    }

    return query.orderBy('app.scheduledDate', 'ASC').getMany();
  }

  async getUpcomingPodcasts(limit: number = 5): Promise<BookUsApplication[]> {
    return this.bookUsRepository
      .createQueryBuilder('app')
      .where('app.bookingStatus IN (:...statuses)', { statuses: [BookingStatus.SCHEDULED, BookingStatus.APPROVED] })
      .andWhere('app.scheduledDate IS NOT NULL')
      .andWhere('app.scheduledDate > :now', { now: new Date() })
      .orderBy('app.scheduledDate', 'ASC')
      .take(limit)
      .getMany();
  }
}