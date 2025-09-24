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
  UseGuards
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterNowService } from './register-now.service';
import {
  CreateConferenceRegistrationDto,
  UpdateConferenceRegistrationDto,
  ConferenceRegistrationResponseDto,
  ConferenceStatsResponseDto,
} from './register-now.dto';
import { RegistrationStatus, AgeGroup, EngagementDetails } from './register-now.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Online Empowerment Conference Africa')
@Controller('register-now')
export class RegisterNowController {
  constructor(private readonly registerNowService: RegisterNowService) {}

  @Post()
  @ApiOperation({ summary: 'Register for the Online Empowerment Conference Africa' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Conference registration submitted successfully',
    type: ConferenceRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Registration with this email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'A registration with this email already exists' },
        error: { type: 'string', example: 'Conflict' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createRegistration(@Body() createRegistrationDto: CreateConferenceRegistrationDto) {
    const registration = await this.registerNowService.createRegistration(createRegistrationDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for registering! We are excited to have you join the Online Empowerment Conference Africa. You will receive a confirmation email with event details soon.',
      data: registration,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: 'Get all conference registrations (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: RegistrationStatus, description: 'Filter by registration status' })
  @ApiQuery({ name: 'ageGroup', required: false, enum: AgeGroup, description: 'Filter by age group' })
  @ApiQuery({ name: 'engagementDetails', required: false, enum: EngagementDetails, description: 'Filter by engagement role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registrations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Registrations retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            registrations: { type: 'array', items: { $ref: '#/components/schemas/ConferenceRegistrationResponseDto' } },
            total: { type: 'number', example: 150 },
            totalPages: { type: 'number', example: 15 },
            currentPage: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  async findAllRegistrations(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: RegistrationStatus,
    @Query('ageGroup') ageGroup?: AgeGroup,
    @Query('engagementDetails') engagementDetails?: EngagementDetails,
  ) {
    const result = await this.registerNowService.findAllRegistrations(page, limit, status, ageGroup, engagementDetails);
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

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get conference registration statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: ConferenceStatsResponseDto,
  })
  async getRegistrationStats() {
    const stats = await this.registerNowService.getRegistrationStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('upcoming')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get upcoming conferences (public endpoint)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of upcoming conferences to retrieve', example: 5 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upcoming conferences retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Upcoming conferences retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/ConferenceRegistrationResponseDto' } }
      }
    }
  })
  async getUpcomingConferences(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    const conferences = await this.registerNowService.getUpcomingConferences(limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Upcoming conferences retrieved successfully',
      data: conferences,
    };
  }

  @Get('by-date')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get registrations by conference date (Admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registrations by date retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Registrations by date retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/ConferenceRegistrationResponseDto' } }
      }
    }
  })
  async getRegistrationsByDate(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const registrations = await this.registerNowService.getRegistrationsByConferenceDate(startDate, endDate);
    return {
      statusCode: HttpStatus.OK,
      message: 'Registrations by date retrieved successfully',
      data: registrations,
    };
  }

  @Get('talent-showcase')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get participants interested in talent showcase (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Talent showcase participants retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Talent showcase participants retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/ConferenceRegistrationResponseDto' } }
      }
    }
  })
  async getTalentShowcaseParticipants() {
    const participants = await this.registerNowService.getTalentShowcaseParticipants();
    return {
      statusCode: HttpStatus.OK,
      message: 'Talent showcase participants retrieved successfully',
      data: participants,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific registration by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration retrieved successfully',
    type: ConferenceRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Registration not found',
  })
  async findRegistrationById(@Param('id', ParseUUIDPipe) id: string) {
    const registration = await this.registerNowService.findRegistrationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration retrieved successfully',
      data: registration,
    };
  }

  @Get('email/:email')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check registration status by email' })
  @ApiParam({ name: 'email', description: 'Email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Registration status retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            registrationStatus: { type: 'string', example: 'confirmed' },
            conferenceDate: { type: 'string', format: 'date-time', nullable: true },
            conferenceType: { type: 'string', example: 'virtual' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Registration not found',
  })
  async findRegistrationByEmail(@Param('email') email: string) {
    const registration = await this.registerNowService.findRegistrationByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration status retrieved successfully',
      data: {
        id: registration.id,
        email: registration.email,
        registrationStatus: registration.registrationStatus,
        conferenceDate: registration.conferenceDate,
        conferenceType: registration.conferenceType,
        createdAt: registration.createdAt,
      },
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update registration status and details (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration updated successfully',
    type: ConferenceRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Registration not found',
  })
  async updateRegistration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRegistrationDto: UpdateConferenceRegistrationDto,
  ) {
    const registration = await this.registerNowService.updateRegistration(id, updateRegistrationDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration updated successfully',
      data: registration,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a registration (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Registration not found',
  })
  async deleteRegistration(@Param('id', ParseUUIDPipe) id: string) {
    await this.registerNowService.deleteRegistration(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Registration deleted successfully',
    };
  }
}