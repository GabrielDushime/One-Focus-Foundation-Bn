import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsNumber,
  Min,
  MaxLength,
  IsNotEmpty
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { DonationType, Currency, PaymentMethod, DonationPurpose, DonationStatus } from './donation.entity';

export class CreateDonationDto {
  @ApiProperty({ 
    description: 'Full name of the donor',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ 
    description: 'Email address of the donor',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiPropertyOptional({ 
    description: 'Phone number (WhatsApp preferred)',
    example: '+250788123456'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  phoneNumber?: string;

  @ApiProperty({ 
    description: 'Country and city of the donor',
    example: 'Kigali, Rwanda'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  countryCity: string;

  @ApiProperty({ 
    description: 'Type of donation',
    enum: DonationType,
    example: DonationType.ONE_TIME
  })
  @IsEnum(DonationType)
  @IsNotEmpty()
  donationType: DonationType;

  @ApiProperty({ 
    description: 'Donation amount',
    example: 50.00,
    minimum: 1
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1, { message: 'Donation amount must be at least $1' })
  @Type(() => Number)
  donationAmount: number;

  @ApiProperty({ 
    description: 'Currency for the donation',
    enum: Currency,
    example: Currency.USD
  })
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  @ApiProperty({ 
    description: 'Preferred payment method',
    enum: PaymentMethod,
    example: PaymentMethod.MOBILE_MONEY
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ 
    description: 'Purpose of the donation',
    enum: DonationPurpose,
    example: DonationPurpose.YOUTH_WORKSHOPS
  })
  @IsOptional()
  @IsEnum(DonationPurpose)
  purposeOfDonation?: DonationPurpose;

  @ApiPropertyOptional({ 
    description: 'Message to ONEFOCUS Foundation',
    example: 'Keep up the great work empowering youth!',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  messageToOnefocus?: string;

  @ApiProperty({ 
    description: 'I agree to allow ONEFOCUS to use my contribution for youth empowerment programs',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Consent to contribution use is required' })
  agreeToContributionUse: boolean;

  @ApiProperty({ 
    description: 'I would like to receive updates and impact reports about ONEFOCUS projects',
    example: true 
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Agreement to receive updates is required' })
  agreeToReceiveUpdates: boolean;
}

export class UpdateDonationDto {
  @ApiPropertyOptional({ 
    description: 'Donation status',
    enum: DonationStatus,
    example: DonationStatus.COMPLETED
  })
  @IsOptional()
  @IsEnum(DonationStatus)
  donationStatus?: DonationStatus;

  @ApiPropertyOptional({ 
    description: 'Transaction reference from payment provider',
    example: 'TXN-123456789'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  transactionReference?: string;

  @ApiPropertyOptional({ 
    description: 'Admin notes about the donation',
    example: 'Payment confirmed via MTN Mobile Money'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  adminNotes?: string;
}

export class DonationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  phoneNumber?: string;

  @ApiProperty()
  countryCity: string;

  @ApiProperty({ enum: DonationType })
  donationType: DonationType;

  @ApiProperty()
  donationAmount: number;

  @ApiProperty({ enum: Currency })
  currency: Currency;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: DonationPurpose, required: false })
  purposeOfDonation?: DonationPurpose;

  @ApiProperty({ required: false })
  messageToOnefocus?: string;

  @ApiProperty()
  agreeToContributionUse: boolean;

  @ApiProperty()
  agreeToReceiveUpdates: boolean;

  @ApiProperty({ enum: DonationStatus })
  donationStatus: DonationStatus;

  @ApiProperty({ required: false })
  transactionReference?: string;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class DonationStatsResponseDto {
  @ApiProperty()
  totalDonations: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  pendingDonations: number;

  @ApiProperty()
  completedDonations: number;

  @ApiProperty()
  failedDonations: number;

  @ApiProperty()
  byDonationType: Record<string, number>;

  @ApiProperty()
  byPaymentMethod: Record<string, number>;

  @ApiProperty()
  byPurpose: Record<string, number>;

  @ApiProperty()
  byCurrency: Record<string, { count: number; totalAmount: number }>;

  @ApiProperty()
  monthlyTrend: Array<{ month: string; count: number; amount: number }>;
}