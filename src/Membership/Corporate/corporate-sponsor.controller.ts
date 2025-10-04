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
import { CorporateSponsorService } from './corporate-sponsor.service';
import {
  CreateCorporateSponsorDto,
  UpdateCorporateSponsorDto,
  CorporateSponsorResponseDto,
  CorporateSponsorStatsDto,
} from './corporate-sponsor.dto';
import { SponsorStatus } from './corporate-sponsor.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Corporate Sponsors')
@Controller('sponsors/corporate')
export class CorporateSponsorController {
  constructor(private readonly sponsorService: CorporateSponsorService) {}

  @Post()
  @ApiOperation({ summary: 'Register as a Corporate Sponsor with ONEFOCUS Foundation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Corporate sponsorship registration submitted successfully',
    type: CorporateSponsorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Corporate sponsor with this email already exists',
  })
  async createSponsor(@Body() createDto: CreateCorporateSponsorDto) {
    const sponsor = await this.sponsorService.createSponsor(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Thank you for your interest in becoming a Corporate Sponsor with ONEFOCUS Foundation! Your sponsorship application has been submitted and is pending approval. You can download your sponsorship form as a PDF. Our team will contact you shortly to discuss partnership details and finalize the agreement.',
      data: sponsor,
    };
  }

  @Get('download-pdf/:id')
  @ApiOperation({ summary: 'Download Corporate Sponsorship form as PDF' })
  @ApiParam({ name: 'id', description: 'Sponsor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF generated successfully',
  })
  async downloadSponsorPDF(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response
  ) {
    const sponsor = await this.sponsorService.findSponsorById(id);
    
    // Generate PDF content
    const pdfContent = this.generatePDFContent(sponsor);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=corporate-sponsor-${sponsor.id}.pdf`);
    res.send(pdfContent);
  }

  private generatePDFContent(sponsor: any): string {
    // Placeholder - use pdfkit or puppeteer in production
    return `
      ONEFOCUS FOUNDATION - CORPORATE SPONSORSHIP FORM
      
      Organization Information:
      Name/Organization: ${sponsor.fullNameOrganization}
      Email: ${sponsor.email}
      Phone: ${sponsor.phoneNumber}
      Location: ${sponsor.countryCity}
      Occupation/Role: ${sponsor.occupationRole}
      Website/Social: ${sponsor.websiteSocialMedia || 'N/A'}
      
      Organization Details:
      Organization Size: ${sponsor.organizationSize}
      
      Sponsorship Details:
      Sponsorship Focus: ${sponsor.sponsorshipFocus.join(', ')}
      Sponsorship Package: ${sponsor.sponsorshipPackage.toUpperCase()}
      ${sponsor.customPackageDetails ? `Custom Details: ${sponsor.customPackageDetails}` : ''}
      
      Payment Information:
      Payment Method: ${sponsor.paymentMethod}
      Contribution Frequency: ${sponsor.contributionFrequency}
      
      Agreement:
      Confirmed Accuracy: ${sponsor.confirmAccuracy ? 'Yes' : 'No'}
      Agreed to Terms: ${sponsor.agreeToTerms ? 'Yes' : 'No'}
      
      Signature: ${sponsor.signature}
      Date: ${sponsor.signatureDate}
      
      Status: ${sponsor.sponsorStatus}
      Submitted: ${sponsor.createdAt}
      
      Note: This sponsorship requires approval and contract finalization.
    `;
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all corporate sponsors (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: SponsorStatus })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Corporate sponsors retrieved successfully',
  })
  async findAllSponsors(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: SponsorStatus,
  ) {
    const result = await this.sponsorService.findAllSponsors(page, limit, status);
    return {
      statusCode: HttpStatus.OK,
      message: 'Corporate sponsors retrieved successfully',
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
  @ApiOperation({ summary: 'Get corporate sponsor statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: CorporateSponsorStatsDto,
  })
  async getSponsorStats() {
    const stats = await this.sponsorService.getSponsorStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Corporate sponsor statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific corporate sponsor by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Sponsor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Corporate sponsor retrieved successfully',
    type: CorporateSponsorResponseDto,
  })
  async findSponsorById(@Param('id', ParseUUIDPipe) id: string) {
    const sponsor = await this.sponsorService.findSponsorById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Corporate sponsor retrieved successfully',
      data: sponsor,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update corporate sponsor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Sponsor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Corporate sponsor updated successfully',
    type: CorporateSponsorResponseDto,
  })
  async updateSponsor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCorporateSponsorDto,
  ) {
    const sponsor = await this.sponsorService.updateSponsor(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Corporate sponsor updated successfully',
      data: sponsor,
    };
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve a corporate sponsor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Sponsor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Corporate sponsor approved successfully',
  })
  async approveSponsor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const sponsor = await this.sponsorService.approveSponsor(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Corporate sponsor approved successfully',
      data: sponsor,
    };
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reject a corporate sponsor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Sponsor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Corporate sponsor rejected successfully',
  })
  async rejectSponsor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: { adminNotes?: string }
  ) {
    const sponsor = await this.sponsorService.rejectSponsor(id, body?.adminNotes);
    return {
      statusCode: HttpStatus.OK,
      message: 'Corporate sponsor rejected successfully',
      data: sponsor,
    };
  }

  @Patch(':id/activate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Activate a corporate sponsor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Sponsor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Corporate sponsor activated successfully',
  })
  async activateSponsor(@Param('id', ParseUUIDPipe) id: string) {
    const sponsor = await this.sponsorService.activateSponsor(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Corporate sponsor activated successfully',
      data: sponsor,
    };
  }

  @Patch(':id/deactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Deactivate a corporate sponsor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Sponsor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Corporate sponsor deactivated successfully',
  })
  async deactivateSponsor(@Param('id', ParseUUIDPipe) id: string) {
    const sponsor = await this.sponsorService.deactivateSponsor(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Corporate sponsor deactivated successfully',
      data: sponsor,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a corporate sponsor (Admin only)' })
  @ApiParam({ name: 'id', description: 'Sponsor UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Corporate sponsor deleted successfully',
  })
  async deleteSponsor(@Param('id', ParseUUIDPipe) id: string) {
    await this.sponsorService.deleteSponsor(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Corporate sponsor deleted successfully',
    };
  }
}