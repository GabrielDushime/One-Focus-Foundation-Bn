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
import { TrainingEnrollmentResponseDto, CreateTrainingEnrollmentDto, UpdateTrainingEnrollmentDto } from './training.dto';
import { EnrollmentStatus } from './training.entity';
import { TrainingEnrollmentService } from './training.service';

@ApiTags('Training Enrollments')
@Controller('training-enrollments')
export class TrainingEnrollmentController {
  constructor(
    private readonly enrollmentService: TrainingEnrollmentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Enroll in training program (Public)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Enrollment created successfully',
    type: TrainingEnrollmentResponseDto,
  })
  async createEnrollment(@Body() createDto: CreateTrainingEnrollmentDto) {
    const enrollment = await this.enrollmentService.createEnrollment(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Your enrollment has been submitted successfully. Please proceed with payment.',
      data: enrollment,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all enrollments (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: EnrollmentStatus })
  @ApiQuery({ name: 'program', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK })
  async findAllEnrollments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: EnrollmentStatus,
    @Query('program') program?: string,
  ) {
    const result = await this.enrollmentService.findAllEnrollments(
      page,
      limit,
      status,
      program,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Enrollments retrieved successfully',
      data: { ...result, currentPage: page, limit },
    };
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get enrollment statistics (Admin only)' })
  @ApiQuery({ name: 'program', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK })
  async getEnrollmentStats(@Query('program') program?: string) {
    const stats = await this.enrollmentService.getEnrollmentStats(program);
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('my-enrollments/:email')
  @ApiOperation({ summary: 'Get enrollments by email (Public)' })
  @ApiParam({ name: 'email' })
  @ApiResponse({ status: HttpStatus.OK })
  async findEnrollmentsByEmail(@Param('email') email: string) {
    const enrollments = await this.enrollmentService.findEnrollmentsByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Your enrollments retrieved successfully',
      data: { enrollments, total: enrollments.length },
    };
  }

  @Get('number/:enrollmentNumber')
  @ApiOperation({ summary: 'Get enrollment by number (Public)' })
  @ApiParam({ name: 'enrollmentNumber' })
  @ApiResponse({ status: HttpStatus.OK })
  async findEnrollmentByNumber(@Param('enrollmentNumber') enrollmentNumber: string) {
    const enrollment = await this.enrollmentService.findEnrollmentByNumber(enrollmentNumber);
    return {
      statusCode: HttpStatus.OK,
      message: 'Enrollment retrieved successfully',
      data: enrollment,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async findEnrollmentById(@Param('id', ParseUUIDPipe) id: string) {
    const enrollment = await this.enrollmentService.findEnrollmentById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Enrollment retrieved successfully',
      data: enrollment,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update enrollment (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateEnrollment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTrainingEnrollmentDto,
  ) {
    const enrollment = await this.enrollmentService.updateEnrollment(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Enrollment updated successfully',
      data: enrollment,
    };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel enrollment (Public)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async cancelEnrollment(@Param('id', ParseUUIDPipe) id: string) {
    const enrollment = await this.enrollmentService.cancelEnrollment(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Enrollment cancelled successfully',
      data: enrollment,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete enrollment (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteEnrollment(@Param('id', ParseUUIDPipe) id: string) {
    await this.enrollmentService.deleteEnrollment(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Enrollment deleted successfully',
    };
  }
}
