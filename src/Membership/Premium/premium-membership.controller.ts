// src/Membership/Premium/premium-membership.controller.ts

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
import { PremiumMembershipService } from './premium-membership.service';
import {
  CreatePremiumMembershipDto,
  UpdatePremiumMembershipDto,
  PremiumMembershipResponseDto,
  PremiumMembershipStatsDto,
} from './premium-membership.dto';
import { PremiumMembershipStatus } from './premium-membership.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Premium Membership')
@Controller('memberships/premium')
export class PremiumMembershipController {
  constructor(private readonly membershipService: PremiumMembershipService) {}

  @Post()
  @ApiOperation({ summary: 'Register for Premium Membership with ONEFOCUS Foundation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Premium membership registration submitted successfully',
    type: PremiumMembershipResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Premium member with this email already exists',
  })
  async createMembership(@Body() createDto: CreatePremiumMembershipDto) {
    const membership = await this.membershipService.createMembership(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for choosing Premium Membership with ONEFOCUS Foundation! Your application has been submitted and is pending approval. You can download your membership form as a PDF. Our team will contact you shortly to discuss payment details.',
      data: membership,
    };
  }

  @Get('download-pdf/:id')
  @ApiOperation({ summary: 'Download Premium Membership form as PDF' })
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
    
    // Generate PDF content
    const pdfContent = this.generatePDFContent(membership);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=premium-membership-${membership.id}.pdf`);
    res.send(pdfContent);
  }

  private generatePDFContent(membership: any): string {
    // Placeholder - use pdfkit or puppeteer in production
    return `
      ONEFOCUS FOUNDATION - PREMIUM MEMBERSHIP FORM
      
      Personal Information:
      Name: ${membership.firstName} ${membership.secondName}
      Email: ${membership.email}
      Phone: ${membership.phoneNumber}
      Location: ${membership.countryCity}
      Occupation: ${membership.occupationRole}
      Website/Social: ${membership.websiteSocialMedia || 'N/A'}
      
      Career Development:
      Career Growth Area: ${membership.careerGrowthArea}
      
      Contribution Details:
      Monthly Contribution: ${membership.monthlyContribution} RWF
      Payment Method: ${membership.paymentMethod}
      Contribution Frequency: ${membership.contributionFrequency}
      
      Agreement:
      Confirmed Accuracy: ${membership.confirmAccuracy ? 'Yes' : 'No'}
      Agreed to Terms: ${membership.agreeToTerms ? 'Yes' : 'No'}
      
      Signature: ${membership.signature}
      Date: ${membership.signatureDate}
      
      Status: ${membership.membershipStatus}
      Submitted: ${membership.createdAt}
      
      Note: This membership requires approval and payment verification.
    `;
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all premium memberships (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: PremiumMembershipStatus })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium memberships retrieved successfully',
  })
  async findAllMemberships(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: PremiumMembershipStatus,
  ) {
    const result = await this.membershipService.findAllMemberships(page, limit, status);
    return {
      statusCode: HttpStatus.OK,
      message: 'Premium memberships retrieved successfully',
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
  @ApiOperation({ summary: 'Get premium membership statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: PremiumMembershipStatsDto,
  })
  async getMembershipStats() {
    const stats = await this.membershipService.getMembershipStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Premium membership statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific premium membership by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium membership retrieved successfully',
    type: PremiumMembershipResponseDto,
  })
  async findMembershipById(@Param('id', ParseUUIDPipe) id: string) {
    const membership = await this.membershipService.findMembershipById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Premium membership retrieved successfully',
      data: membership,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update premium membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium membership updated successfully',
    type: PremiumMembershipResponseDto,
  })
  async updateMembership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePremiumMembershipDto,
  ) {
    const membership = await this.membershipService.updateMembership(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Premium membership updated successfully',
      data: membership,
    };
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve a premium membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium membership approved successfully',
  })
  async approveMembership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const membership = await this.membershipService.approveMembership(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Premium membership approved successfully',
      data: membership,
    };
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reject a premium membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium membership rejected successfully',
  })
  async rejectMembership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const membership = await this.membershipService.rejectMembership(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Premium membership rejected successfully',
      data: membership,
    };
  }

  @Patch(':id/activate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Activate a premium membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium membership activated successfully',
  })
  async activateMembership(@Param('id', ParseUUIDPipe) id: string) {
    const membership = await this.membershipService.activateMembership(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Premium membership activated successfully',
      data: membership,
    };
  }

  @Patch(':id/deactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Deactivate a premium membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium membership deactivated successfully',
  })
  async deactivateMembership(@Param('id', ParseUUIDPipe) id: string) {
    const membership = await this.membershipService.deactivateMembership(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Premium membership deactivated successfully',
      data: membership,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a premium membership (Admin only)' })
  @ApiParam({ name: 'id', description: 'Membership UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium membership deleted successfully',
  })
  async deleteMembership(@Param('id', ParseUUIDPipe) id: string) {
    await this.membershipService.deleteMembership(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Premium membership deleted successfully',
    };
  }
}