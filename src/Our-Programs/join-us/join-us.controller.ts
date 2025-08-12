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
import { JoinUsService } from './join-us.service';
import {
  CreateJoinUsApplicationDto,
  UpdateJoinUsApplicationDto,
  JoinUsApplicationResponseDto,
} from './join-us.dto';

@ApiTags('Join Us')
@Controller('join-us')
export class JoinUsController {
  constructor(private readonly joinUsService: JoinUsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new join us application' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Application submitted successfully',
    type: JoinUsApplicationResponseDto,
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
  async createApplication(@Body() createJoinUsApplicationDto: CreateJoinUsApplicationDto) {
    const application = await this.joinUsService.createApplication(createJoinUsApplicationDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for registering! Our team will contact you shortly with session details. See you at the workshop!',
      data: application,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all join us applications (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by application status' })
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
            applications: { type: 'array', items: { $ref: '#/components/schemas/JoinUsApplicationResponseDto' } },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
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
    @Query('status') status?: string,
  ) {
    const result = await this.joinUsService.findAllApplications(page, limit, status);
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
  @ApiOperation({ summary: 'Get application statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Statistics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 150 },
            pending: { type: 'number', example: 50 },
            approved: { type: 'number', example: 80 },
            rejected: { type: 'number', example: 20 },
            byEducationLevel: { type: 'object' },
            byCountry: { type: 'object' },
            bySessionType: { type: 'object' }
          }
        }
      }
    }
  })
  async getApplicationStats() {
    const stats = await this.joinUsService.getApplicationStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific application by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application retrieved successfully',
    type: JoinUsApplicationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Application not found',
  })
  async findApplicationById(@Param('id', ParseUUIDPipe) id: string) {
    const application = await this.joinUsService.findApplicationById(id);
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
            applicationStatus: { type: 'string', example: 'pending' },
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
    const application = await this.joinUsService.findApplicationByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application status retrieved successfully',
      data: {
        id: application.id,
        email: application.email,
        applicationStatus: application.applicationStatus,
        createdAt: application.createdAt,
      },
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update application status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application updated successfully',
    type: JoinUsApplicationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Application not found',
  })
  async updateApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJoinUsApplicationDto: UpdateJoinUsApplicationDto,
  ) {
    const application = await this.joinUsService.updateApplication(id, updateJoinUsApplicationDto);
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
    await this.joinUsService.deleteApplication(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application deleted successfully',
    };
  }
}