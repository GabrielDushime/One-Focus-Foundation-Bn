import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookShootResponseDto, CreateBookShootDto, UpdateBookShootDto } from './bookshoot.dto';
import { BookingStatus } from './bookshoot.entity';
import { BookShootService } from './bookshoot.service';

@ApiTags('Book Shoot')
@Controller('book-shoot')
export class BookShootController {
  constructor(private readonly bookingService: BookShootService) {}

  @Post()
  @ApiOperation({ summary: 'Book a shoot session (Public)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Booking submitted successfully',
    type: BookShootResponseDto,
  })
  async createBooking(@Body() createDto: CreateBookShootDto) {
    const booking = await this.bookingService.createBooking(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Your shoot booking has been submitted successfully',
      data: booking,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiResponse({ status: HttpStatus.OK })
  async findAllBookings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: BookingStatus,
  ) {
    const result = await this.bookingService.findAllBookings(
      page,
      limit,
      status,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Bookings retrieved successfully',
      data: { ...result, currentPage: page, limit },
    };
  }

  @Get('my-bookings/:email')
  @ApiOperation({ summary: 'Get bookings by email (Public)' })
  @ApiParam({ name: 'email' })
  @ApiResponse({ status: HttpStatus.OK })
  async findBookingsByEmail(@Param('email') email: string) {
    const bookings = await this.bookingService.findBookingsByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Your bookings retrieved successfully',
      data: { bookings, total: bookings.length },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async findBookingById(@Param('id', ParseUUIDPipe) id: string) {
    const booking = await this.bookingService.findBookingById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Booking retrieved successfully',
      data: booking,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update booking (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBookShootDto,
  ) {
    const booking = await this.bookingService.updateBooking(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Booking updated successfully',
      data: booking,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete booking (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteBooking(@Param('id', ParseUUIDPipe) id: string) {
    await this.bookingService.deleteBooking(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Booking deleted successfully',
    };
  }
}
