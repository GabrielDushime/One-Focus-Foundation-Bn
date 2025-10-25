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
import { StartCodingResponseDto, CreateStartCodingDto, UpdateStartCodingDto } from './startcoding.dto';
import { EnrollmentStatus } from './startcoding.entity';
import { StartCodingService } from './startcoding.service';

@ApiTags('Start Coding')
@Controller('start-coding')
export class StartCodingController {
  constructor(private readonly applicationService: StartCodingService) {}

  @Post()
  @ApiOperation({ summary: 'Apply for coding program (Public)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Application submitted successfully',
    type: StartCodingResponseDto,
  })
  async createApplication(@Body() createDto: CreateStartCodingDto) {
    const application = await this.applicationService.createApplication(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Your coding program application has been submitted successfully',
      data: application,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all applications (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: EnrollmentStatus })
  @ApiResponse({ status: HttpStatus.OK })
  async findAllApplications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: EnrollmentStatus,
  ) {
    const result = await this.applicationService.findAllApplications(
      page,
      limit,
      status,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Applications retrieved successfully',
      data: { ...result, currentPage: page, limit },
    };
  }

  @Get('my-applications/:email')
  @ApiOperation({ summary: 'Get applications by email (Public)' })
  @ApiParam({ name: 'email' })
  @ApiResponse({ status: HttpStatus.OK })
  async findApplicationsByEmail(@Param('email') email: string) {
    const applications = await this.applicationService.findApplicationsByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Your applications retrieved successfully',
      data: { applications, total: applications.length },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async findApplicationById(@Param('id', ParseUUIDPipe) id: string) {
    const application = await this.applicationService.findApplicationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application retrieved successfully',
      data: application,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update application (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateStartCodingDto,
  ) {
    const application = await this.applicationService.updateApplication(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application updated successfully',
      data: application,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete application (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteApplication(@Param('id', ParseUUIDPipe) id: string) {
    await this.applicationService.deleteApplication(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Application deleted successfully',
    };
  }
}