import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog, BlogStatus } from './blog.entity';
import { CreateBlogDto, UpdateBlogDto, BlogStatsDto } from './blog.dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class BlogService {
  private readonly uploadPath = path.join(process.cwd(), 'public', 'blog');

  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {
    // Create upload directory if it doesn't exist
    this.ensureUploadDirectory();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirectory() {
    try {
      await mkdir(this.uploadPath, { recursive: true });
    } catch (error) {
      // Directory already exists or can't be created
      console.log('Upload directory already exists or created');
    }
  }

  /**
   * Save uploaded file to disk and return the file path
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `blog-${timestamp}-${randomString}${extension}`;
    
    const filePath = path.join(this.uploadPath, filename);
    
    // Save file to disk
    await writeFile(filePath, file.buffer);
    
    // Return the public URL path (relative path that will be accessible via web server)
    return `/blog/${filename}`;
  }

  /**
   * Delete file from disk
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      if (filePath && filePath.startsWith('/blog/')) {
        const filename = filePath.replace('/blog/', '');
        const fullPath = path.join(this.uploadPath, filename);
        if (fs.existsSync(fullPath)) {
          await unlink(fullPath);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  /**
   * Create a new blog
   */
  async createBlog(createDto: CreateBlogDto): Promise<Blog> {
    // Calculate reading time if not provided (rough estimate: 200 words per minute)
    if (!createDto.readingTime && createDto.blogDescription) {
      const wordCount = createDto.blogDescription.split(/\s+/).length;
      createDto.readingTime = Math.ceil(wordCount / 200);
    }

    const blog = this.blogRepository.create(createDto);
    return await this.blogRepository.save(blog);
  }

  /**
   * Find all blogs with filtering and pagination
   */
  async findAllBlogs(
    page: number = 1,
    limit: number = 10,
    status?: BlogStatus,
    featured?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.blogRepository.createQueryBuilder('blog');

    if (status) {
      queryBuilder.andWhere('blog.status = :status', { status });
    }

    if (featured !== undefined) {
      queryBuilder.andWhere('blog.isFeatured = :featured', { featured });
    }

    queryBuilder
      .orderBy('blog.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [blogs, total] = await queryBuilder.getManyAndCount();

    return {
      blogs,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all published blogs
   */
  async findPublishedBlogs(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [blogs, total] = await this.blogRepository.findAndCount({
      where: { status: BlogStatus.PUBLISHED },
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      blogs,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all featured blogs
   */
  async findFeaturedBlogs(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [blogs, total] = await this.blogRepository.findAndCount({
      where: {
        status: BlogStatus.PUBLISHED,
        isFeatured: true,
      },
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      blogs,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find blog by ID
   */
  async findBlogById(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id } });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return blog;
  }

  /**
   * Search blogs by title, subtitle, description, or tags
   */
  async searchBlogs(searchTerm: string): Promise<Blog[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new BadRequestException('Search term cannot be empty');
    }

    const term = `%${searchTerm.trim()}%`;

    const blogs = await this.blogRepository
      .createQueryBuilder('blog')
      .where('blog.blogTitle ILIKE :term', { term })
      .orWhere('blog.blogSubtitle ILIKE :term', { term })
      .orWhere('blog.blogDescription ILIKE :term', { term })
      .orWhere('blog.tags::text ILIKE :term', { term })
      .orderBy('blog.createdAt', 'DESC')
      .getMany();

    return blogs;
  }

  /**
   * Update a blog
   */
  async updateBlog(id: string, updateDto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.findBlogById(id);

    // If updating photo, delete old photo from disk
    if (updateDto.blogPhoto && blog.blogPhoto && blog.blogPhoto !== updateDto.blogPhoto) {
      await this.deleteFile(blog.blogPhoto);
    }

    // Recalculate reading time if description is updated
    if (updateDto.blogDescription && !updateDto.readingTime) {
      const wordCount = updateDto.blogDescription.split(/\s+/).length;
      updateDto.readingTime = Math.ceil(wordCount / 200);
    }

    Object.assign(blog, updateDto);
    return await this.blogRepository.save(blog);
  }

  /**
   * Publish a blog
   */
  async publishBlog(id: string): Promise<Blog> {
    const blog = await this.findBlogById(id);

    if (blog.status === BlogStatus.PUBLISHED) {
      throw new BadRequestException('Blog is already published');
    }

    blog.status = BlogStatus.PUBLISHED;
    blog.publishedAt = new Date();

    return await this.blogRepository.save(blog);
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string): Promise<Blog> {
    const blog = await this.findBlogById(id);
    blog.isFeatured = !blog.isFeatured;
    return await this.blogRepository.save(blog);
  }

  /**
   * Increment blog views
   */
  async incrementViews(id: string): Promise<Blog> {
    const blog = await this.findBlogById(id);
    blog.viewsCount += 1;
    return await this.blogRepository.save(blog);
  }

  /**
   * Delete a blog
   */
  async deleteBlog(id: string): Promise<void> {
    const blog = await this.findBlogById(id);
    
    // Delete associated photo file if exists
    if (blog.blogPhoto) {
      await this.deleteFile(blog.blogPhoto);
    }
    
    await this.blogRepository.remove(blog);
  }

  /**
   * Get blog statistics
   */
  async getBlogStats(): Promise<BlogStatsDto> {
    const totalBlogs = await this.blogRepository.count();

    const publishedBlogs = await this.blogRepository.count({
      where: { status: BlogStatus.PUBLISHED },
    });

    const draftBlogs = await this.blogRepository.count({
      where: { status: BlogStatus.DRAFT },
    });

    const featuredBlogs = await this.blogRepository.count({
      where: { isFeatured: true },
    });

    // Calculate total views
    const viewsResult = await this.blogRepository
      .createQueryBuilder('blog')
      .select('SUM(blog.viewsCount)', 'total')
      .getRawOne();

    const totalViews = parseInt(viewsResult?.total || '0');

    // Get blogs by tags
    const allBlogs = await this.blogRepository.find({
      select: ['tags'],
    });

    const byTags: Record<string, number> = {};
    allBlogs.forEach((blog) => {
      if (blog.tags) {
        blog.tags.forEach((tag) => {
          byTags[tag] = (byTags[tag] || 0) + 1;
        });
      }
    });

    // Get most viewed blogs
    const mostViewedBlogs = await this.blogRepository.find({
      order: { viewsCount: 'DESC' },
      take: 5,
      select: ['id', 'blogTitle', 'viewsCount'],
    });

    const mostViewed = mostViewedBlogs.map((blog) => ({
      id: blog.id,
      title: blog.blogTitle,
      views: blog.viewsCount,
    }));

    return {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      featuredBlogs,
      totalViews,
      byTags,
      mostViewed,
    };
  }
}