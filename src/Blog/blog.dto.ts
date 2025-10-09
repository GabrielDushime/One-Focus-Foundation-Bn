import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
  IsArray,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { BlogStatus } from './blog.entity';

export class CreateBlogDto {
  @ApiProperty({
    description: 'Blog title',
    example: 'Empowering Youth Through Education',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  blogTitle: string;

  @ApiPropertyOptional({
    description: 'Blog subtitle',
    example: 'How education transforms communities in Rwanda',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  blogSubtitle?: string;

  @ApiProperty({
    description: 'Detailed blog content/description',
    example: 'In this article, we explore the transformative power of education...',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  blogDescription: string;

  @ApiPropertyOptional({
    description: 'Blog photo (will be set from file upload)',
  })
  @IsString()
  @IsOptional()
  blogPhoto?: string;

  @ApiPropertyOptional({
    description: 'Blog status',
    enum: BlogStatus,
    example: BlogStatus.DRAFT,
    default: BlogStatus.DRAFT,
  })
  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus;

  @ApiPropertyOptional({
    description: 'Author name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  authorName?: string;

  @ApiPropertyOptional({
    description: 'Author email',
    example: 'john.doe@onefocus.org.rw',
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  authorEmail?: string;

  @ApiPropertyOptional({
    description: 'Blog tags for categorization',
    example: ['education', 'youth', 'empowerment'],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Handle comma-separated string from multipart form
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return value;
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Estimated reading time in minutes',
    example: 5,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  readingTime?: number;

  @ApiPropertyOptional({
    description: 'Is this blog featured?',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    // Handle string boolean from multipart form
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Published date (auto-set when status changes to published)',
    example: '2025-10-09T12:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  publishedAt?: Date;
}

// DTO for Swagger documentation to show file upload field
export class CreateBlogWithFileDto {
  @ApiProperty({
    description: 'Blog title',
    example: 'Empowering Youth Through Education',
  })
  blogTitle: string;

  @ApiPropertyOptional({
    description: 'Blog subtitle',
    example: 'How education transforms communities in Rwanda',
  })
  blogSubtitle?: string;

  @ApiProperty({
    description: 'Detailed blog content/description',
    example: 'In this article, we explore the transformative power of education...',
  })
  blogDescription: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Upload blog photo directly from your computer (jpg, jpeg, png, gif, webp - max 5MB)',
  })
  blogPhoto?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Blog status',
    enum: BlogStatus,
    example: BlogStatus.DRAFT,
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Author name',
    example: 'John Doe',
  })
  authorName?: string;

  @ApiPropertyOptional({
    description: 'Author email',
    example: 'john.doe@onefocus.org.rw',
  })
  authorEmail?: string;

  @ApiPropertyOptional({
    description: 'Blog tags (comma-separated, e.g., "education,youth,empowerment")',
    example: 'education,youth,empowerment',
  })
  tags?: string;

  @ApiPropertyOptional({
    description: 'Estimated reading time in minutes',
    example: '5',
  })
  readingTime?: string;

  @ApiPropertyOptional({
    description: 'Is this blog featured? (true or false)',
    example: 'false',
  })
  isFeatured?: string;

  @ApiPropertyOptional({
    description: 'Published date',
    example: '2025-10-09T12:00:00.000Z',
  })
  publishedAt?: string;
}

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}

export class BlogResponseDto {
  @ApiProperty({ description: 'Blog unique identifier' })
  id: string;

  @ApiProperty({ description: 'Blog title' })
  blogTitle: string;

  @ApiProperty({ description: 'Blog subtitle', required: false })
  blogSubtitle?: string;

  @ApiProperty({ description: 'Blog description/content' })
  blogDescription: string;

  @ApiProperty({ description: 'Blog photo (base64 or URL)', required: false })
  blogPhoto?: string;

  @ApiProperty({ description: 'Blog status', enum: BlogStatus })
  status: BlogStatus;

  @ApiProperty({ description: 'Author name', required: false })
  authorName?: string;

  @ApiProperty({ description: 'Author email', required: false })
  authorEmail?: string;

  @ApiProperty({ description: 'Blog tags', required: false, isArray: true })
  tags?: string[];

  @ApiProperty({ description: 'Views count' })
  viewsCount: number;

  @ApiProperty({ description: 'Reading time in minutes', required: false })
  readingTime?: number;

  @ApiProperty({ description: 'Is featured blog' })
  isFeatured: boolean;

  @ApiProperty({ description: 'Published date', required: false })
  publishedAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class BlogStatsDto {
  @ApiProperty({ description: 'Total number of blogs' })
  totalBlogs: number;

  @ApiProperty({ description: 'Number of published blogs' })
  publishedBlogs: number;

  @ApiProperty({ description: 'Number of draft blogs' })
  draftBlogs: number;

  @ApiProperty({ description: 'Number of featured blogs' })
  featuredBlogs: number;

  @ApiProperty({ description: 'Total views across all blogs' })
  totalViews: number;

  @ApiProperty({ description: 'Blogs count by tags' })
  byTags: Record<string, number>;

  @ApiProperty({ description: 'Most viewed blogs' })
  mostViewed: Array<{ id: string; title: string; views: number }>;
}