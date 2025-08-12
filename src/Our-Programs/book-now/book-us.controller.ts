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
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookUsService } from './book-us.service';
import {
  CreateBookUsApplicationDto,
  UpdateBookUsApplicationDto,
  BookUsApplicationResponseDto,
  BookUsStatsResponseDto,
} from './book-us.dto';
import { BookingStatus } from './book-us.entity';

@ApiTags('Book Now')
@Controller('book-us')
export class BookUsController {
  constructor(private readonly bookUsService: BookUsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new podcast booking application' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Podcast booking application submitted successfully',
    type: BookUsApplicationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Application with this email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'An application with this email already exists' },
        error: { type: 'string', example: 'Conflict' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createApplication(@Body() createBookUsApplicationDto: CreateBookUsApplicationDto) {
    const application = await this.bookUsService.createApplication(createBookUsApplicationDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for booking! Our team will review your story and reach out to schedule your podcast session. You arere one step closer to inspiring the world',
      data: application,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all podcast booking applications (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus, description: 'Filter by booking status' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by podcast category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Applications retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            applications: { type: 'array', items: { $ref: '#/components/schemas/BookUsApplicationResponseDto' } },
            total: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 5 },
            currentPage: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  async findAllApplications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: BookingStatus,
    @Query('category') category?: string,
  ) {
    const result = await this.bookUsService.findAllApplications(page, limit, status, category);
    return {
      statusCode: HttpStatus.OK,
      message: 'Applications retrieved successfully',
      data: {
        ...result,
        currentPage: page,
        limit,
      },
    };
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get podcast booking statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: BookUsStatsResponseDto,
  })
  async getApplicationStats() {
    const stats = await this.bookUsService.getApplicationStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('scheduled')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get scheduled podcast applications (Admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scheduled applications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Scheduled applications retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/BookUsApplicationResponseDto' } }
      }
    }
  })
  async getScheduledApplications(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const applications = await this.bookUsService.getScheduledApplications(startDate, endDate);
    return {
      statusCode: HttpStatus.OK,
      message: 'Scheduled applications retrieved successfully',
      data: applications,
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming podcasts (public endpoint)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of upcoming podcasts to retrieve', example: 5 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upcoming podcasts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Upcoming podcasts retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/BookUsApplicationResponseDto' } }
      }
    }
  })
  async getUpcomingPodcasts(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    const podcasts = await this.bookUsService.getUpcomingPodcasts(limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Upcoming podcasts retrieved successfully',
      data: podcasts,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific application by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application retrieved successfully',
    type: BookUsApplicationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Application not found',
  })
  async findApplicationById(@Param('id', ParseUUIDPipe) id: string) {
    const application = await this.bookUsService.findApplicationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application retrieved successfully',
      data: application,
    };
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Check application status by email' })
  @ApiParam({ name: 'email', description: 'Email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Application status retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            bookingStatus: { type: 'string', example: 'pending' },
            scheduledDate: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Application not found',
  })
  async findApplicationByEmail(@Param('email') email: string) {
    const application = await this.bookUsService.findApplicationByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application status retrieved successfully',
      data: {
        id: application.id,
        email: application.email,
        bookingStatus: application.bookingStatus,
        scheduledDate: application.scheduledDate,
        createdAt: application.createdAt,
      },
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update application status and details (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application updated successfully',
    type: BookUsApplicationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Application not found',
  })
  async updateApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookUsApplicationDto: UpdateBookUsApplicationDto,
  ) {
    const application = await this.bookUsService.updateApplication(id, updateBookUsApplicationDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application updated successfully',
      data: application,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an application (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Application not found',
  })
  async deleteApplication(@Param('id', ParseUUIDPipe) id: string) {
    await this.bookUsService.deleteApplication(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application deleted successfully',
    };
  }
}