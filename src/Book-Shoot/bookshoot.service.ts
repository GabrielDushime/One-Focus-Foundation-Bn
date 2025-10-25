import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookShootDto, UpdateBookShootDto } from './bookshoot.dto';
import { BookShootApplication, BookingStatus } from './bookshoot.entity';

@Injectable()
export class BookShootService {
  constructor(
    @InjectRepository(BookShootApplication)
    private readonly bookingRepository: Repository<BookShootApplication>,
  ) {}

  async createBooking(
    createDto: CreateBookShootDto,
  ): Promise<BookShootApplication> {
    // Validate consent
    if (!createDto.consentConfirmed) {
      throw new BadRequestException(
        'You must agree to arrive at scheduled time and adhere to guidelines',
      );
    }

    // Validate requested datetime
    const requestedDate = new Date(createDto.requestedDatetime);
    const now = new Date();

    if (requestedDate < now) {
      throw new BadRequestException('Requested date and time cannot be in the past');
    }

    // Check for conflicting bookings (same date/time slot within 2 hours)
    const twoHoursBefore = new Date(requestedDate.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(requestedDate.getTime() + 2 * 60 * 60 * 1000);

    const conflictingBooking = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.requestedDatetime BETWEEN :start AND :end', {
        start: twoHoursBefore,
        end: twoHoursAfter,
      })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      })
      .getOne();

    if (conflictingBooking) {
      throw new ConflictException(
        'A booking already exists within this time slot. Please choose a different time.',
      );
    }

    // Create booking
    const booking = this.bookingRepository.create(createDto);
    return await this.bookingRepository.save(booking);
  }

  async findAllBookings(
    page: number = 1,
    limit: number = 10,
    status?: BookingStatus,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking');

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    queryBuilder.orderBy('booking.requestedDatetime', 'ASC');
    queryBuilder.skip(skip).take(limit);

    const [bookings, total] = await queryBuilder.getManyAndCount();

    return {
      bookings,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBookingById(id: string): Promise<BookShootApplication> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findBookingsByEmail(email: string): Promise<BookShootApplication[]> {
    return await this.bookingRepository.find({
      where: { email: email.toLowerCase() },
      order: { requestedDatetime: 'DESC' },
    });
  }

  async updateBooking(
    id: string,
    updateDto: UpdateBookShootDto,
  ): Promise<BookShootApplication> {
    const booking = await this.findBookingById(id);
    Object.assign(booking, updateDto);
    return await this.bookingRepository.save(booking);
  }

  async deleteBooking(id: string): Promise<void> {
    const booking = await this.findBookingById(id);
    await this.bookingRepository.remove(booking);
  }
}