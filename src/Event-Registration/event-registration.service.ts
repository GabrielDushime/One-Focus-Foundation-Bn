import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventRegistration, RegistrationStatus } from './event-registration.entity';
import { Event, EventStatus } from '../Event-creation/event.entity';
import {
  CreateEventRegistrationDto,
  UpdateEventRegistrationDto,
  MarkAttendanceDto,
  SubmitFeedbackDto,
  RegistrationStatsDto,
} from './event-registration.dto';

@Injectable()
export class EventRegistrationService {
  constructor(
    @InjectRepository(EventRegistration)
    private readonly registrationRepository: Repository<EventRegistration>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  /**
   * Generate unique registration number
   */
  private generateRegistrationNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REG-${timestamp}-${random}`;
  }

  /**
   * Create a new event registration
   */
  async createRegistration(
    createDto: CreateEventRegistrationDto,
  ): Promise<EventRegistration> {
    // Validate event exists and is published
    const event = await this.eventRepository.findOne({
      where: { id: createDto.eventId },
    });

    if (!event) {
      throw new NotFoundException(
        `Event with ID ${createDto.eventId} not found`,
      );
    }

    // Check event status - must be published and not completed/cancelled
    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Cannot register for completed events');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot register for cancelled events');
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot register for events that are not published',
      );
    }

    // Check if event date has passed
    const now = new Date();
    if (new Date(event.eventDate) < now) {
      throw new BadRequestException('Cannot register for past events');
    }

    // Check registration deadline
    if (event.registrationDeadline) {
      if (new Date(event.registrationDeadline) < now) {
        throw new BadRequestException('Registration deadline has passed');
      }
    }

    // Check if user already registered
    const existingRegistration = await this.registrationRepository.findOne({
      where: {
        eventId: createDto.eventId,
        email: createDto.email.toLowerCase(),
        status: RegistrationStatus.CONFIRMED,
      },
    });

    if (existingRegistration) {
      throw new ConflictException(
        'You have already registered for this event',
      );
    }

    // Check if event is full
    if (event.maxParticipants) {
      const currentRegistrations = await this.registrationRepository.count({
        where: {
          eventId: createDto.eventId,
          status: RegistrationStatus.CONFIRMED,
        },
      });

      if (currentRegistrations >= event.maxParticipants) {
        throw new BadRequestException('Event is fully booked');
      }
    }

    // Validate agreement to terms
    if (!createDto.agreedToTerms) {
      throw new BadRequestException(
        'You must agree to terms and conditions to register',
      );
    }

    // Create registration
    const registration = this.registrationRepository.create({
      ...createDto,
      registrationNumber: this.generateRegistrationNumber(),
      status: RegistrationStatus.CONFIRMED,
      agreedAt: new Date(),
      country: createDto.country || 'Rwanda',
    });

    return await this.registrationRepository.save(registration);
  }

  /**
   * Find all registrations with pagination
   */
  async findAllRegistrations(
    page: number = 1,
    limit: number = 10,
    eventId?: string,
    status?: RegistrationStatus,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.registrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.event', 'event');

    if (eventId) {
      queryBuilder.andWhere('registration.eventId = :eventId', { eventId });
    }

    if (status) {
      queryBuilder.andWhere('registration.status = :status', { status });
    }

    queryBuilder.orderBy('registration.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [registrations, total] = await queryBuilder.getManyAndCount();

    return {
      registrations,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find registration by ID
   */
  async findRegistrationById(id: string): Promise<EventRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return registration;
  }

  /**
   * Find registration by registration number
   */
  async findByRegistrationNumber(
    registrationNumber: string,
  ): Promise<EventRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { registrationNumber },
      relations: ['event'],
    });

    if (!registration) {
      throw new NotFoundException(
        `Registration with number ${registrationNumber} not found`,
      );
    }

    return registration;
  }

  /**
   * Find user's registrations by email
   */
  async findUserRegistrations(email: string): Promise<EventRegistration[]> {
    return await this.registrationRepository.find({
      where: { email: email.toLowerCase() },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get registrations for a specific event
   */
  async getEventRegistrations(
    eventId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [registrations, total] = await this.registrationRepository.findAndCount(
      {
        where: { eventId },
        relations: ['event'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      },
    );

    return {
      registrations,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update registration
   */
  async updateRegistration(
    id: string,
    updateDto: UpdateEventRegistrationDto,
  ): Promise<EventRegistration> {
    const registration = await this.findRegistrationById(id);

    // Don't allow updating eventId
    if (updateDto.eventId && updateDto.eventId !== registration.eventId) {
      throw new BadRequestException('Cannot change event for a registration');
    }

    Object.assign(registration, updateDto);
    return await this.registrationRepository.save(registration);
  }

  /**
   * Cancel registration
   */
  async cancelRegistration(id: string): Promise<EventRegistration> {
    const registration = await this.findRegistrationById(id);

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new ConflictException('Registration is already cancelled');
    }

    if (registration.status === RegistrationStatus.ATTENDED) {
      throw new BadRequestException('Cannot cancel an attended registration');
    }

    registration.status = RegistrationStatus.CANCELLED;
    return await this.registrationRepository.save(registration);
  }

  /**
   * Mark attendance
   */
  async markAttendance(
    id: string,
    markAttendanceDto: MarkAttendanceDto,
  ): Promise<EventRegistration> {
    const registration = await this.findRegistrationById(id);

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Cannot mark attendance for cancelled registration');
    }

    registration.attended = markAttendanceDto.attended;
    registration.attendanceMarkedAt = new Date();

    if (markAttendanceDto.attended) {
      registration.status = RegistrationStatus.ATTENDED;
      registration.checkInTime = new Date();
    } else {
      registration.status = RegistrationStatus.NO_SHOW;
    }

    return await this.registrationRepository.save(registration);
  }

  /**
   * Submit feedback
   */
  async submitFeedback(
    id: string,
    feedbackDto: SubmitFeedbackDto,
  ): Promise<EventRegistration> {
    const registration = await this.findRegistrationById(id);

    if (registration.status !== RegistrationStatus.ATTENDED) {
      throw new BadRequestException(
        'Only attended participants can submit feedback',
      );
    }

    registration.rating = feedbackDto.rating;
    registration.feedback = feedbackDto.feedback;

    return await this.registrationRepository.save(registration);
  }

  /**
   * Get registration statistics for an event
   */
  async getEventRegistrationStats(
    eventId: string,
  ): Promise<RegistrationStatsDto> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const totalRegistrations = await this.registrationRepository.count({
      where: { eventId },
    });

    const confirmedRegistrations = await this.registrationRepository.count({
      where: { eventId, status: RegistrationStatus.CONFIRMED },
    });

    const cancelledRegistrations = await this.registrationRepository.count({
      where: { eventId, status: RegistrationStatus.CANCELLED },
    });

    const attendedCount = await this.registrationRepository.count({
      where: { eventId, status: RegistrationStatus.ATTENDED },
    });

    const noShowCount = await this.registrationRepository.count({
      where: { eventId, status: RegistrationStatus.NO_SHOW },
    });

    // FIX: Calculate average rating with proper type handling
    const registrationsWithRatings = await this.registrationRepository.find({
      where: { eventId },
      select: ['rating'],
    });

    // Filter out null/undefined ratings and ensure type safety
    const ratingsArray = registrationsWithRatings
      .map((r) => r.rating)
      .filter((rating): rating is number => rating !== null && rating !== undefined);

    const averageRating =
      ratingsArray.length > 0
        ? ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length
        : undefined;

    // Calculate available spots
    let availableSpots: number | undefined;
    if (event.maxParticipants) {
      availableSpots = event.maxParticipants - confirmedRegistrations;
    }

    return {
      totalRegistrations,
      confirmedRegistrations,
      cancelledRegistrations,
      attendedCount,
      noShowCount,
      availableSpots,
      averageRating: averageRating ? Number(averageRating.toFixed(2)) : undefined,
    };
  }

  /**
   * Delete registration
   */
  async deleteRegistration(id: string): Promise<void> {
    const registration = await this.findRegistrationById(id);
    await this.registrationRepository.remove(registration);
  }
}