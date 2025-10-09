
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { Event, EventStatus, EventType } from './event.entity';
import { CreateEventDto, UpdateEventDto, EventStatsDto } from './event.dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class EventService {
  private readonly uploadPath = path.join(process.cwd(), 'public', 'events');

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {
    // Create upload directory if it doesn't exist
    this.ensureUploadDirectory();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirectory() {
    try {
      await mkdir(this.uploadPath, { recursive: true });
    } catch (error) {
      console.log('Upload directory already exists or created');
    }
  }

  /**
   * Save uploaded file to disk and return the file path
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `event-${timestamp}-${randomString}${extension}`;
    
    const filePath = path.join(this.uploadPath, filename);
    
    // Save file to disk
    await writeFile(filePath, file.buffer);
    
    // Return the public URL path (relative path that will be accessible via web server)
    return `/events/${filename}`;
  }

  /**
   * Delete file from disk
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      if (filePath && filePath.startsWith('/events/')) {
        const filename = filePath.replace('/events/', '');
        const fullPath = path.join(this.uploadPath, filename);
        if (fs.existsSync(fullPath)) {
          await unlink(fullPath);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  /**
   * Create a new event
   */
  async createEvent(createDto: CreateEventDto): Promise<Event> {
    // Validate dates
    const eventDate = new Date(createDto.eventDate);
    const now = new Date();

    if (eventDate < now) {
      throw new BadRequestException('Event date cannot be in the past');
    }

    if (createDto.registrationDeadline) {
      const deadline = new Date(createDto.registrationDeadline);
      if (deadline >= eventDate) {
        throw new BadRequestException(
          'Registration deadline must be before event date',
        );
      }
    }

    // Validate virtual/hybrid event has meeting link
    if (
      (createDto.venueType === 'virtual' || createDto.venueType === 'hybrid') &&
      !createDto.meetingLink
    ) {
      throw new BadRequestException(
        'Meeting link is required for virtual/hybrid events',
      );
    }

    // Validate paid event has price
    if (createDto.isFree === false && !createDto.price) {
      throw new BadRequestException('Price is required for paid events');
    }

    const event = this.eventRepository.create(createDto);
    return await this.eventRepository.save(event);
  }

  /**
   * Find all events with filtering and pagination
   */
  async findAllEvents(
    page: number = 1,
    limit: number = 10,
    status?: EventStatus,
    eventType?: EventType,
    upcoming?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.eventRepository.createQueryBuilder('event');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('event.status = :status', { status });
    }

    if (eventType) {
      queryBuilder.andWhere('event.eventType = :eventType', { eventType });
    }

    if (upcoming) {
      const now = new Date();
      queryBuilder.andWhere('event.eventDate >= :now', { now });
    }

    // Order by event date (ascending for upcoming, descending otherwise)
    queryBuilder.orderBy(
      'event.eventDate',
      upcoming ? 'ASC' : 'DESC',
    );

    // Pagination
    queryBuilder.skip(skip).take(limit);

    const [events, total] = await queryBuilder.getManyAndCount();

    return {
      events,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all published events
   */
  async findPublishedEvents(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [events, total] = await this.eventRepository.findAndCount({
      where: { status: EventStatus.PUBLISHED },
      order: { eventDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      events,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all upcoming events (published and in the future)
   */
  async findUpcomingEvents(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const [events, total] = await this.eventRepository.findAndCount({
      where: {
        status: EventStatus.PUBLISHED,
        eventDate: MoreThanOrEqual(now),
      },
      order: { eventDate: 'ASC' },
      skip,
      take: limit,
    });

    return {
      events,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find event by ID
   */
  async findEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  /**
   * Search events by title, description, or tags
   */
  async searchEvents(searchTerm: string): Promise<Event[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new BadRequestException('Search term cannot be empty');
    }

    const term = `%${searchTerm.trim()}%`;

    const events = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.title ILIKE :term', { term })
      .orWhere('event.description ILIKE :term', { term })
      .orWhere('event.location ILIKE :term', { term })
      .orWhere('event.tags::text ILIKE :term', { term })
      .orderBy('event.eventDate', 'DESC')
      .getMany();

    return events;
  }

  /**
   * Update an event
   */
  async updateEvent(id: string, updateDto: UpdateEventDto): Promise<Event> {
    const event = await this.findEventById(id);

    // If updating photo, delete old photo from disk
    if (updateDto.eventPhoto && event.eventPhoto && event.eventPhoto !== updateDto.eventPhoto) {
      await this.deleteFile(event.eventPhoto);
    }

    // Validate dates if being updated
    if (updateDto.eventDate) {
      const eventDate = new Date(updateDto.eventDate);
      const now = new Date();

      if (eventDate < now && event.status !== EventStatus.COMPLETED) {
        throw new BadRequestException('Event date cannot be in the past');
      }
    }

    if (updateDto.registrationDeadline && updateDto.eventDate) {
      const deadline = new Date(updateDto.registrationDeadline);
      const eventDate = new Date(updateDto.eventDate);

      if (deadline >= eventDate) {
        throw new BadRequestException(
          'Registration deadline must be before event date',
        );
      }
    }

    // Validate virtual/hybrid event has meeting link
    const venueType = updateDto.venueType || event.venueType;
    const meetingLink = updateDto.meetingLink !== undefined 
      ? updateDto.meetingLink 
      : event.meetingLink;

    if ((venueType === 'virtual' || venueType === 'hybrid') && !meetingLink) {
      throw new BadRequestException(
        'Meeting link is required for virtual/hybrid events',
      );
    }

    // Validate paid event has price
    const isFree = updateDto.isFree !== undefined ? updateDto.isFree : event.isFree;
    const price = updateDto.price !== undefined ? updateDto.price : event.price;

    if (isFree === false && !price) {
      throw new BadRequestException('Price is required for paid events');
    }

    Object.assign(event, updateDto);
    return await this.eventRepository.save(event);
  }

  /**
   * Publish an event
   */
  async publishEvent(id: string): Promise<Event> {
    const event = await this.findEventById(id);

    if (event.status === EventStatus.PUBLISHED) {
      throw new ConflictException('Event is already published');
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Cannot publish a completed event');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot publish a cancelled event');
    }

    event.status = EventStatus.PUBLISHED;
    return await this.eventRepository.save(event);
  }

  /**
   * Cancel an event
   */
  async cancelEvent(id: string): Promise<Event> {
    const event = await this.findEventById(id);

    if (event.status === EventStatus.CANCELLED) {
      throw new ConflictException('Event is already cancelled');
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed event');
    }

    event.status = EventStatus.CANCELLED;
    return await this.eventRepository.save(event);
  }

  /**
   * Mark event as ongoing
   */
  async markEventAsOngoing(id: string): Promise<Event> {
    const event = await this.findEventById(id);

    if (event.status === EventStatus.ONGOING) {
      throw new ConflictException('Event is already ongoing');
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Cannot mark a completed event as ongoing');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot mark a cancelled event as ongoing');
    }

    event.status = EventStatus.ONGOING;
    return await this.eventRepository.save(event);
  }

  /**
   * Mark event as completed
   */
  async markEventAsCompleted(id: string): Promise<Event> {
    const event = await this.findEventById(id);

    if (event.status === EventStatus.COMPLETED) {
      throw new ConflictException('Event is already completed');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled event');
    }

    event.status = EventStatus.COMPLETED;
    return await this.eventRepository.save(event);
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    const event = await this.findEventById(id);
    
    // Delete associated photo file if exists
    if (event.eventPhoto) {
      await this.deleteFile(event.eventPhoto);
    }
    
    await this.eventRepository.remove(event);
  }

  /**
   * Get event statistics
   */
  async getEventStats(): Promise<EventStatsDto> {
    const now = new Date();

    // Total events
    const totalEvents = await this.eventRepository.count();

    // Events by status
    const publishedEvents = await this.eventRepository.count({
      where: { status: EventStatus.PUBLISHED },
    });

    const upcomingEvents = await this.eventRepository.count({
      where: {
        status: EventStatus.PUBLISHED,
        eventDate: MoreThanOrEqual(now),
      },
    });

    const ongoingEvents = await this.eventRepository.count({
      where: { status: EventStatus.ONGOING },
    });

    const completedEvents = await this.eventRepository.count({
      where: { status: EventStatus.COMPLETED },
    });

    // Events by type
    const byEventType: Record<string, number> = {};
    for (const type of Object.values(EventType)) {
      const count = await this.eventRepository.count({
        where: { eventType: type },
      });
      byEventType[type] = count;
    }

    // Monthly events (last 12 months)
    const monthlyEvents = await this.getMonthlyEventStats();

    // Total registrations (placeholder - implement when registration entity is ready)
    const totalRegistrations = 0;

    return {
      totalEvents,
      publishedEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalRegistrations,
      byEventType,
      monthlyEvents,
    };
  }

  /**
   * Get monthly event statistics for the last 12 months
   */
  private async getMonthlyEventStats(): Promise<
    Array<{ month: string; count: number }>
  > {
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    const events = await this.eventRepository.find({
      where: {
        eventDate: Between(twelveMonthsAgo, now),
      },
      select: ['eventDate'],
    });

    // Group by month
    const monthCounts: Record<string, number> = {};

    events.forEach((event) => {
      const monthKey = new Date(event.eventDate).toISOString().slice(0, 7); // YYYY-MM
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    // Convert to array and sort
    const result = Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return result;
  }
}