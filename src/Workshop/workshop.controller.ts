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
import { WorkshopService } from './workshop.service';
import {
  CreateWorkshopRegistrationDto,
  UpdateWorkshopRegistrationDto,
  WorkshopRegistrationResponseDto,
  WorkshopStatsResponseDto,
} from './workshop.dto';
import { 
  RegistrationStatus, 
  WorkshopCategory, 
  ParticipantType,
  WorkshopFormat 
} from './workshop.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Workshop Registrations')
@Controller('workshops')
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register for a workshop' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Workshop registration submitted successfully',
    type: WorkshopRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Registration with this email already exists for this workshop',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'You have already registered for this workshop' },
        error: { type: 'string', example: 'Conflict' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createRegistration(@Body() createRegistrationDto: CreateWorkshopRegistrationDto) {
    const registration = await this.workshopService.createRegistration(createRegistrationDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for registering! Your workshop registration has been received. You will receive a confirmation email with workshop details soon.',
      data: registration,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all workshop registrations (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: RegistrationStatus, description: 'Filter by registration status' })
  @ApiQuery({ name: 'category', required: false, enum: WorkshopCategory, description: 'Filter by workshop category' })
  @ApiQuery({ name: 'format', required: false, enum: WorkshopFormat, description: 'Filter by workshop format' })
  @ApiQuery({ name: 'participantType', required: false, enum: ParticipantType, description: 'Filter by participant type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registrations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Workshop registrations retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            registrations: { type: 'array', items: { $ref: '#/components/schemas/WorkshopRegistrationResponseDto' } },
            total: { type: 'number', example: 200 },
            totalPages: { type: 'number', example: 20 },
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
    @Query('category') category?: WorkshopCategory,
    @Query('format') format?: WorkshopFormat,
    @Query('participantType') participantType?: ParticipantType,
  ) {
    const result = await this.workshopService.findAllRegistrations(
      page, 
      limit, 
      status, 
      category, 
      format, 
      participantType
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Workshop registrations retrieved successfully',
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
  @ApiOperation({ summary: 'Get workshop registration statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: WorkshopStatsResponseDto,
  })
  async getRegistrationStats() {
    const stats = await this.workshopService.getRegistrationStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Workshop registration statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming workshops' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of upcoming workshops to retrieve', example: 5 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upcoming workshops retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Upcoming workshops retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/WorkshopRegistrationResponseDto' } }
      }
    }
  })
  async getUpcomingWorkshops(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    const workshops = await this.workshopService.getUpcomingWorkshops(limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Upcoming workshops retrieved successfully',
      data: workshops,
    };
  }

  @Get('by-date')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get registrations by workshop date range (Admin only)' })
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
        data: { type: 'array', items: { $ref: '#/components/schemas/WorkshopRegistrationResponseDto' } }
      }
    }
  })
  async getRegistrationsByDate(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const registrations = await this.workshopService.getRegistrationsByDateRange(startDate, endDate);
    return {
      statusCode: HttpStatus.OK,
      message: 'Registrations by date retrieved successfully',
      data: registrations,
    };
  }

  @Get('by-workshop/:workshopTitle')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all registrations for a specific workshop (Admin only)' })
  @ApiParam({ name: 'workshopTitle', description: 'Workshop title' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Workshop registrations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Workshop registrations retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/WorkshopRegistrationResponseDto' } }
      }
    }
  })
  async getRegistrationsByWorkshop(@Param('workshopTitle') workshopTitle: string) {
    const registrations = await this.workshopService.getRegistrationsByWorkshop(workshopTitle);
    return {
      statusCode: HttpStatus.OK,
      message: 'Workshop registrations retrieved successfully',
      data: registrations,
    };
  }

  @Get('group-registrations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all group registrations (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group registrations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Group registrations retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/WorkshopRegistrationResponseDto' } }
      }
    }
  })
  async getGroupRegistrations() {
    const registrations = await this.workshopService.getGroupRegistrations();
    return {
      statusCode: HttpStatus.OK,
      message: 'Group registrations retrieved successfully',
      data: registrations,
    };
  }

  @Get('certificate-eligible')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get participants eligible for certificates (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Certificate eligible participants retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Certificate eligible participants retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/WorkshopRegistrationResponseDto' } }
      }
    }
  })
  async getCertificateEligibleParticipants() {
    const participants = await this.workshopService.getCertificateEligibleParticipants();
    return {
      statusCode: HttpStatus.OK,
      message: 'Certificate eligible participants retrieved successfully',
      data: participants,
    };
  }

  @Get('by-payment-status/:paymentStatus')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get registrations by payment status (Admin only)' })
  @ApiParam({ name: 'paymentStatus', description: 'Payment status (paid, unpaid, waived, pending)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registrations by payment status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Registrations retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/WorkshopRegistrationResponseDto' } }
      }
    }
  })
  async getRegistrationsByPaymentStatus(@Param('paymentStatus') paymentStatus: string) {
    const registrations = await this.workshopService.getRegistrationsByPaymentStatus(paymentStatus);
    return {
      statusCode: HttpStatus.OK,
      message: 'Registrations retrieved successfully',
      data: registrations,
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
    type: WorkshopRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Registration not found',
  })
  async findRegistrationById(@Param('id', ParseUUIDPipe) id: string) {
    const registration = await this.workshopService.findRegistrationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Workshop registration retrieved successfully',
      data: registration,
    };
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get all registrations by email' })
  @ApiParam({ name: 'email', description: 'Email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registrations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Registrations retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/WorkshopRegistrationResponseDto' } }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No registrations found',
  })
  async findRegistrationByEmail(@Param('email') email: string) {
    const registrations = await this.workshopService.findRegistrationByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Workshop registrations retrieved successfully',
      data: registrations,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update registration details (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration updated successfully',
    type: WorkshopRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Registration not found',
  })
  async updateRegistration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRegistrationDto: UpdateWorkshopRegistrationDto,
  ) {
    const registration = await this.workshopService.updateRegistration(id, updateRegistrationDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Workshop registration updated successfully',
      data: registration,
    };
  }

  @Patch(':id/confirm')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Confirm a workshop registration (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration confirmed successfully',
    type: WorkshopRegistrationResponseDto,
  })
  async confirmRegistration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('confirmedDate') confirmedDate: string,
    @Body('workshopFee') workshopFee?: number,
  ) {
    const registration = await this.workshopService.confirmRegistration(
      id, 
      new Date(confirmedDate),
      workshopFee
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Workshop registration confirmed successfully',
      data: registration,
    };
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel a workshop registration (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration cancelled successfully',
    type: WorkshopRegistrationResponseDto,
  })
  async cancelRegistration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
  ) {
    const registration = await this.workshopService.cancelRegistration(id, reason);
    return {
      statusCode: HttpStatus.OK,
      message: 'Workshop registration cancelled successfully',
      data: registration,
    };
  }

  @Patch(':id/issue-certificate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Issue certificate to participant (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Certificate issued successfully',
    type: WorkshopRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Certificate requirements not met',
  })
  async issueCertificate(@Param('id', ParseUUIDPipe) id: string) {
    const registration = await this.workshopService.issueCertificate(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Certificate issued successfully',
      data: registration,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    await this.workshopService.deleteRegistration(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Workshop registration deleted successfully',
    };
  }
}