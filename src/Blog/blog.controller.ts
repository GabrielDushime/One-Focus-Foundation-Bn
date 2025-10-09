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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { BlogService } from './blog.service';
import {
  CreateBlogDto,
  UpdateBlogDto,
  BlogResponseDto,
  BlogStatsDto,
  CreateBlogWithFileDto,
} from './blog.dto';
import { BlogStatus } from './blog.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('blogPhoto'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new blog with photo upload (Admin only)' })
  @ApiBody({
    description: 'Create blog with image file upload',
    type: CreateBlogWithFileDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Blog created successfully',
    type: BlogResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createBlog(
    @Body() createDto: CreateBlogDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false, // Make file optional
      }),
    )
    file?: Express.Multer.File,
  ) {
    // Save file to disk and get file path
    if (file) {
      createDto.blogPhoto = await this.blogService.saveFile(file);
    }

    const blog = await this.blogService.createBlog(createDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Blog created successfully',
      data: blog,
    };
  }

  @Post('upload-photo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload blog photo (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Photo uploaded successfully',
  })
  async uploadBlogPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const filePath = await this.blogService.saveFile(file);
    return {
      statusCode: HttpStatus.OK,
      message: 'Photo uploaded successfully',
      data: { blogPhoto: filePath },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all blogs (Public - with filters)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: BlogStatus })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blogs retrieved successfully',
  })
  async findAllBlogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: BlogStatus,
    @Query('featured') featured?: boolean,
  ) {
    const result = await this.blogService.findAllBlogs(
      page,
      limit,
      status,
      featured,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Blogs retrieved successfully',
      data: {
        ...result,
        currentPage: page,
        limit,
      },
    };
  }

  @Get('published')
  @ApiOperation({ summary: 'Get all published blogs (Public)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Published blogs retrieved successfully',
  })
  async findPublishedBlogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.blogService.findPublishedBlogs(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Published blogs retrieved successfully',
      data: {
        ...result,
        currentPage: page,
        limit,
      },
    };
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get all featured blogs (Public)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Featured blogs retrieved successfully',
  })
  async findFeaturedBlogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.blogService.findFeaturedBlogs(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Featured blogs retrieved successfully',
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
  @ApiOperation({ summary: 'Get blog statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: BlogStatsDto,
  })
  async getBlogStats() {
    const stats = await this.blogService.getBlogStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Blog statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search blogs (Public)' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search term',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results retrieved successfully',
  })
  async searchBlogs(@Query('q') searchTerm: string) {
    const blogs = await this.blogService.searchBlogs(searchTerm);
    return {
      statusCode: HttpStatus.OK,
      message: 'Search completed successfully',
      data: {
        blogs,
        total: blogs.length,
        searchTerm,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific blog by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Blog UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog retrieved successfully',
    type: BlogResponseDto,
  })
  async findBlogById(@Param('id', ParseUUIDPipe) id: string) {
    const blog = await this.blogService.findBlogById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Blog retrieved successfully',
      data: blog,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('blogPhoto'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a blog with optional photo upload (Admin only)' })
  @ApiParam({ name: 'id', description: 'Blog UUID' })
  @ApiBody({
    description: 'Update blog with optional image file upload',
    type: CreateBlogWithFileDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog updated successfully',
    type: BlogResponseDto,
  })
  async updateBlog(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBlogDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    // Save file to disk and get file path
    if (file) {
      updateDto.blogPhoto = await this.blogService.saveFile(file);
    }

    const blog = await this.blogService.updateBlog(id, updateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Blog updated successfully',
      data: blog,
    };
  }

  @Patch(':id/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Publish a blog (Admin only)' })
  @ApiParam({ name: 'id', description: 'Blog UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog published successfully',
  })
  async publishBlog(@Param('id', ParseUUIDPipe) id: string) {
    const blog = await this.blogService.publishBlog(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Blog published successfully',
      data: blog,
    };
  }

  @Patch(':id/feature')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle blog featured status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Blog UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog featured status updated successfully',
  })
  async toggleFeatured(@Param('id', ParseUUIDPipe) id: string) {
    const blog = await this.blogService.toggleFeatured(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Blog featured status updated successfully',
      data: blog,
    };
  }

  @Patch(':id/increment-views')
  @ApiOperation({ summary: 'Increment blog views (Public)' })
  @ApiParam({ name: 'id', description: 'Blog UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog views incremented successfully',
  })
  async incrementViews(@Param('id', ParseUUIDPipe) id: string) {
    const blog = await this.blogService.incrementViews(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Blog views incremented successfully',
      data: blog,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a blog (Admin only)' })
  @ApiParam({ name: 'id', description: 'Blog UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog deleted successfully',
  })
  async deleteBlog(@Param('id', ParseUUIDPipe) id: string) {
    await this.blogService.deleteBlog(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Blog deleted successfully',
    };
  }
}