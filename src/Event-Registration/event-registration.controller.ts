
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
import { EventRegistrationService } from './event-registration.service';
import {
  CreateEventRegistrationDto,
  UpdateEventRegistrationDto,
  EventRegistrationResponseDto,
  MarkAttendanceDto,
  SubmitFeedbackDto,
  RegistrationStatsDto,
} from './event-registration.dto';
import { RegistrationStatus } from './event-registration.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Event Registrations')
@Controller('event-registrations')
export class EventRegistrationController {
  constructor(
    private readonly registrationService: EventRegistrationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register for an event (Public)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registration successful',
    type: EventRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or event not available for registration',
  })
  async registerForEvent(@Body() createDto: CreateEventRegistrationDto) {
    const registration = await this.registrationService.createRegistration(
      createDto,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Successfully registered for the event',
      data: registration,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all registrations (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: RegistrationStatus })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registrations retrieved successfully',
  })
  async findAllRegistrations(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('eventId') eventId?: string,
    @Query('status') status?: RegistrationStatus,
  ) {
    const result = await this.registrationService.findAllRegistrations(
      page,
      limit,
      eventId,
      status,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Registrations retrieved successfully',
      data: {
        ...result,
        currentPage: page,
        limit,
      },
    };
  }

  @Get('my-registrations/:email')
  @ApiOperation({ summary: 'Get user registrations by email (Public)' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User registrations retrieved successfully',
  })
  async findUserRegistrations(@Param('email') email: string) {
    const registrations = await this.registrationService.findUserRegistrations(
      email,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Your registrations retrieved successfully',
      data: {
        registrations,
        total: registrations.length,
      },
    };
  }

  @Get('event/:eventId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get registrations for a specific event (Admin only)' })
  @ApiParam({ name: 'eventId', description: 'Event UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event registrations retrieved successfully',
  })
  async getEventRegistrations(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.registrationService.getEventRegistrations(
      eventId,
      page,
      limit,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Event registrations retrieved successfully',
      data: {
        ...result,
        currentPage: page,
        limit,
      },
    };
  }

  @Get('event/:eventId/stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get registration statistics for an event (Admin only)',
  })
  @ApiParam({ name: 'eventId', description: 'Event UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: RegistrationStatsDto,
  })
  async getEventRegistrationStats(
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    const stats = await this.registrationService.getEventRegistrationStats(
      eventId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('number/:registrationNumber')
  @ApiOperation({ summary: 'Get registration by number (Public)' })
  @ApiParam({ name: 'registrationNumber', description: 'Registration number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration retrieved successfully',
  })
  async findByRegistrationNumber(
    @Param('registrationNumber') registrationNumber: string,
  ) {
    const registration = await this.registrationService.findByRegistrationNumber(
      registrationNumber,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration retrieved successfully',
      data: registration,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get registration by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration retrieved successfully',
    type: EventRegistrationResponseDto,
  })
  async findRegistrationById(@Param('id', ParseUUIDPipe) id: string) {
    const registration = await this.registrationService.findRegistrationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration retrieved successfully',
      data: registration,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update registration (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration updated successfully',
  })
  async updateRegistration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEventRegistrationDto,
  ) {
    const registration = await this.registrationService.updateRegistration(
      id,
      updateDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration updated successfully',
      data: registration,
    };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel registration (Public)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration cancelled successfully',
  })
  async cancelRegistration(@Param('id', ParseUUIDPipe) id: string) {
    const registration = await this.registrationService.cancelRegistration(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration cancelled successfully',
      data: registration,
    };
  }

  @Patch(':id/attendance')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark attendance (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance marked successfully',
  })
  async markAttendance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() markAttendanceDto: MarkAttendanceDto,
  ) {
    const registration = await this.registrationService.markAttendance(
      id,
      markAttendanceDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Attendance marked successfully',
      data: registration,
    };
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit event feedback (Public - for attended participants)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback submitted successfully',
  })
  async submitFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() feedbackDto: SubmitFeedbackDto,
  ) {
    const registration = await this.registrationService.submitFeedback(
      id,
      feedbackDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Thank you for your feedback!',
      data: registration,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete registration (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration deleted successfully',
  })
  async deleteRegistration(@Param('id', ParseUUIDPipe) id: string) {
    await this.registrationService.deleteRegistration(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration deleted successfully',
    };
  }
}
