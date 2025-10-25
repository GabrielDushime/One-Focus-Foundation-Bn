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
import {
  CertificateRequestResponseDto,
  CreateCertificateRequestDto,
  UpdateCertificateRequestDto,
} from './certificate.dto';
import { CertificateStatus, ProgramType } from './certificate.entity';
import { CertificateRequestService } from './certificate.service';

@ApiTags('Certificate Requests')
@Controller('certificate-requests')
export class CertificateRequestController {
  constructor(
    private readonly certificateService: CertificateRequestService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Request a certificate (Public)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Certificate request submitted successfully',
    type: CertificateRequestResponseDto,
  })
  async createRequest(@Body() createDto: CreateCertificateRequestDto) {
    const request = await this.certificateService.createRequest(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Your certificate request has been submitted successfully! We will process it shortly.',
      data: request,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all certificate requests (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: CertificateStatus })
  @ApiQuery({ name: 'program', required: false, enum: ProgramType })
  @ApiResponse({ status: HttpStatus.OK })
  async findAllRequests(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: CertificateStatus,
    @Query('program') program?: ProgramType,
  ) {
    const result = await this.certificateService.findAllRequests(
      page,
      limit,
      status,
      program,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Certificate requests retrieved successfully',
      data: { ...result, currentPage: page, limit },
    };
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get certificate statistics (Admin only)' })
  @ApiQuery({ name: 'program', required: false, enum: ProgramType })
  @ApiResponse({ status: HttpStatus.OK })
  async getStatistics(@Query('program') program?: ProgramType) {
    const stats = await this.certificateService.getStatistics(program);
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('my-requests/:email')
  @ApiOperation({ summary: 'Get certificate requests by email (Public)' })
  @ApiParam({ name: 'email' })
  @ApiResponse({ status: HttpStatus.OK })
  async findRequestsByEmail(@Param('email') email: string) {
    const requests = await this.certificateService.findRequestsByEmail(email);
    return {
      statusCode: HttpStatus.OK,
      message: 'Your certificate requests retrieved successfully',
      data: { requests, total: requests.length },
    };
  }

  @Get('certificate/:certificateNumber')
  @ApiOperation({ summary: 'Verify certificate by number (Public)' })
  @ApiParam({ name: 'certificateNumber' })
  @ApiResponse({ status: HttpStatus.OK })
  async verifyCertificate(@Param('certificateNumber') certificateNumber: string) {
    const certificate = await this.certificateService.findRequestByCertificateNumber(
      certificateNumber,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Certificate verified successfully',
      data: certificate,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate request by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async findRequestById(@Param('id', ParseUUIDPipe) id: string) {
    const request = await this.certificateService.findRequestById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Certificate request retrieved successfully',
      data: request,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update certificate request (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCertificateRequestDto,
  ) {
    const request = await this.certificateService.updateRequest(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Certificate request updated successfully',
      data: request,
    };
  }

  @Patch(':id/issue')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Issue certificate (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async issueRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('certificateUrl') certificateUrl: string,
  ) {
    const request = await this.certificateService.issueRequest(id, certificateUrl);
    return {
      statusCode: HttpStatus.OK,
      message: 'Certificate issued successfully',
      data: request,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete certificate request (Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteRequest(@Param('id', ParseUUIDPipe) id: string) {
    await this.certificateService.deleteRequest(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Certificate request deleted successfully',
    };
  }
}