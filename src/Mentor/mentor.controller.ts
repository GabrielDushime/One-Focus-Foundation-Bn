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
import { MentorService } from './mentor.service';
import {
  CreateMentorDto,
  UpdateMentorDto,
  MentorResponseDto,
  MentorStatsResponseDto,
} from './mentor.dto';
import { 
  MentorStatus, 
  ProfessionalStatus, 
  MentorshipArea 
} from './mentor.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Mentors')
@Controller('mentors')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Post()
  @ApiOperation({ summary: 'Register as a mentor for ONEFOCUS Foundation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Mentor registration submitted successfully',
    type: MentorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mentor with this email already exists',
  })
  async createMentor(@Body() createMentorDto: CreateMentorDto) {
    const mentor = await this.mentorService.createMentor(createMentorDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for joining as a mentor! The ONEFOCUS team will contact you soon to match you with mentees who align with your expertise. Together, let\'s empower Africa\'s next generation of leaders!',
      data: mentor,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all mentors (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: MentorStatus, description: 'Filter by mentor status' })
  @ApiQuery({ name: 'professionalStatus', required: false, enum: ProfessionalStatus, description: 'Filter by professional status' })
  @ApiQuery({ name: 'mentorshipArea', required: false, enum: MentorshipArea, description: 'Filter by mentorship area' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentors retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Mentors retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            mentors: { type: 'array', items: { $ref: '#/components/schemas/MentorResponseDto' } },
            total: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 5 },
            currentPage: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  async findAllMentors(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: MentorStatus,
    @Query('professionalStatus') professionalStatus?: ProfessionalStatus,
    @Query('mentorshipArea') mentorshipArea?: MentorshipArea,
  ) {
    const result = await this.mentorService.findAllMentors(page, limit, status, professionalStatus, mentorshipArea);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentors retrieved successfully',
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
  @ApiOperation({ summary: 'Get mentor statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: MentorStatsResponseDto,
  })
  async getMentorStats() {
    const stats = await this.mentorService.getMentorStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentor statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('by-status/:status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get mentors by status (Admin only)' })
  @ApiParam({ name: 'status', enum: MentorStatus, description: 'Mentor status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentors by status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Mentors by status retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/MentorResponseDto' } }
      }
    }
  })
  async getMentorsByStatus(@Param('status') status: MentorStatus) {
    const mentors = await this.mentorService.getMentorsByStatus(status);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentors by status retrieved successfully',
      data: mentors,
    };
  }

  @Get('by-area/:area')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get mentors by mentorship area (Admin only)' })
  @ApiParam({ name: 'area', enum: MentorshipArea, description: 'Mentorship area' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentors by area retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Mentors by area retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/MentorResponseDto' } }
      }
    }
  })
  async getMentorsByArea(@Param('area') area: MentorshipArea) {
    const mentors = await this.mentorService.getMentorsByArea(area);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentors by area retrieved successfully',
      data: mentors,
    };
  }

  @Get('by-date')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get mentors by date range (Admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentors by date retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Mentors by date retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/MentorResponseDto' } }
      }
    }
  })
  async getMentorsByDate(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const mentors = await this.mentorService.getMentorsByDateRange(startDate, endDate);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentors by date retrieved successfully',
      data: mentors,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific mentor by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Mentor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentor retrieved successfully',
    type: MentorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Mentor not found',
  })
  async findMentorById(@Param('id', ParseUUIDPipe) id: string) {
    const mentor = await this.mentorService.findMentorById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentor retrieved successfully',
      data: mentor,
    };
  }

  @Get('email/:email')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get mentors by email (Admin only)' })
  @ApiParam({ name: 'email', description: 'Email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentors retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Mentors retrieved successfully' },
        data: { type: 'array', items: { $ref: '#/components/schemas/MentorResponseDto' } }
      }
    }
  })
  async findMentorsByEmail(@Param('email') email: string) {
    const mentors = await this.mentorService.findMentorsByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentors retrieved successfully',
      data: mentors,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update mentor status and details (Admin only)' })
  @ApiParam({ name: 'id', description: 'Mentor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentor updated successfully',
    type: MentorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Mentor not found',
  })
  async updateMentor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMentorDto: UpdateMentorDto,
  ) {
    const mentor = await this.mentorService.updateMentor(id, updateMentorDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentor updated successfully',
      data: mentor,
    };
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve a mentor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Mentor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentor approved successfully',
    type: MentorResponseDto,
  })
  async approveMentor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const mentor = await this.mentorService.approveMentor(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentor approved successfully',
      data: mentor,
    };
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reject a mentor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Mentor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentor rejected successfully',
    type: MentorResponseDto,
  })
  async rejectMentor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const mentor = await this.mentorService.rejectMentor(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentor rejected successfully',
      data: mentor,
    };
  }

  @Patch(':id/activate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Activate a mentor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Mentor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentor activated successfully',
    type: MentorResponseDto,
  })
  async activateMentor(@Param('id', ParseUUIDPipe) id: string) {
    const mentor = await this.mentorService.activateMentor(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentor activated successfully',
      data: mentor,
    };
  }

  @Patch(':id/deactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Deactivate a mentor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Mentor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentor deactivated successfully',
    type: MentorResponseDto,
  })
  async deactivateMentor(@Param('id', ParseUUIDPipe) id: string) {
    const mentor = await this.mentorService.deactivateMentor(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentor deactivated successfully',
      data: mentor,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a mentor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Mentor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mentor deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Mentor not found',
  })
  async deleteMentor(@Param('id', ParseUUIDPipe) id: string) {
    await this.mentorService.deleteMentor(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Mentor deleted successfully',
    };
  }
}