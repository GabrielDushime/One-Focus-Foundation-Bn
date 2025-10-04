// src/Membership/Basic/basic-membership.controller.ts

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
  Res
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { BasicMembershipService } from './basic-membership.service';
import {
  CreateBasicMembershipDto,
  UpdateBasicMembershipDto,
  BasicMembershipResponseDto,
  BasicMembershipStatsDto,
} from './basic-membership.dto';
import { MembershipStatus } from './basic-membership.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Basic Membership')
@Controller('memberships/basic')
export class BasicMembershipController {
  constructor(private readonly membershipService: BasicMembershipService) {}

  @Post()
  @ApiOperation({ summary: 'Register for Basic Membership with ONEFOCUS Foundation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Basic membership registration submitted successfully',
    type: BasicMembershipResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Member with this email already exists',
  })
  async createMembership(@Body() createDto: CreateBasicMembershipDto) {
    const membership = await this.membershipService.createMembership(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for joining ONEFOCUS Foundation! Your Basic Membership application has been submitted. You can now download your membership form as a PDF.',
      data: membership,
    };
  }

  @Get('download-pdf/:id')
  @ApiOperation({ summary: 'Download Basic Membership form as PDF' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF generated successfully',
  })
  async downloadMembershipPDF(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response
  ) {
    const membership = await this.membershipService.findMembershipById(id);
    
    // Generate PDF content (simplified version - you'll need a PDF library like pdfkit or puppeteer)
    const pdfContent = this.generatePDFContent(membership);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=basic-membership-${membership.id}.pdf`);
    res.send(pdfContent);
  }

  private generatePDFContent(membership: any): string {
    // This is a placeholder. In production, use a library like pdfkit or puppeteer
    return `
      ONEFOCUS FOUNDATION - BASIC MEMBERSHIP FORM
      
      Personal Information:
      Name: ${membership.firstName} ${membership.secondName}
      Email: ${membership.email}
      Phone: ${membership.phoneNumber}
      Location: ${membership.countryCity}
      Occupation: ${membership.occupationRole}
      Website/Social: ${membership.websiteSocialMedia || 'N/A'}
      
      Membership Details:
      Why Join: ${membership.whyJoinOnefocus}
      Areas of Interest: ${membership.areasOfInterest.join(', ')}
      
      Agreement:
      Confirmed Accuracy: ${membership.confirmAccuracy ? 'Yes' : 'No'}
      Agreed to Terms: ${membership.agreeToTerms ? 'Yes' : 'No'}
      
      Signature: ${membership.signature}
      Date: ${membership.signatureDate}
      
      Status: ${membership.membershipStatus}
      Submitted: ${membership.createdAt}
    `;
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all basic memberships (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: MembershipStatus })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Memberships retrieved successfully',
  })
  async findAllMemberships(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: MembershipStatus,
  ) {
    const result = await this.membershipService.findAllMemberships(page, limit, status);
    return {
      statusCode: HttpStatus.OK,
      message: 'Basic memberships retrieved successfully',
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
  @ApiOperation({ summary: 'Get basic membership statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: BasicMembershipStatsDto,
  })
  async getMembershipStats() {
    const stats = await this.membershipService.getMembershipStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Basic membership statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific basic membership by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership retrieved successfully',
    type: BasicMembershipResponseDto,
  })
  async findMembershipById(@Param('id', ParseUUIDPipe) id: string) {
    const membership = await this.membershipService.findMembershipById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Basic membership retrieved successfully',
      data: membership,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update basic membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership updated successfully',
    type: BasicMembershipResponseDto,
  })
  async updateMembership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBasicMembershipDto,
  ) {
    const membership = await this.membershipService.updateMembership(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Basic membership updated successfully',
      data: membership,
    };
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve a basic membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership approved successfully',
  })
  async approveMembership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const membership = await this.membershipService.approveMembership(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Basic membership approved successfully',
      data: membership,
    };
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reject a basic membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership rejected successfully',
  })
  async rejectMembership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const membership = await this.membershipService.rejectMembership(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Basic membership rejected successfully',
      data: membership,
    };
  }

  @Patch(':id/activate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Activate a basic membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership activated successfully',
  })
  async activateMembership(@Param('id', ParseUUIDPipe) id: string) {
    const membership = await this.membershipService.activateMembership(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Basic membership activated successfully',
      data: membership,
    };
  }

  @Patch(':id/deactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Deactivate a basic membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership deactivated successfully',
  })
  async deactivateMembership(@Param('id', ParseUUIDPipe) id: string) {
    const membership = await this.membershipService.deactivateMembership(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Basic membership deactivated successfully',
      data: membership,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a basic membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membership deleted successfully',
  })
  async deleteMembership(@Param('id', ParseUUIDPipe) id: string) {
    await this.membershipService.deleteMembership(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Basic membership deleted successfully',
    };
  }
}