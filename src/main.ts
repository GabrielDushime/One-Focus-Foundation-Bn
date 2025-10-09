import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // ✅ Important: Add <NestExpressApplication> type here
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:5000', 
      'https://onefocus-fou.onrender.com',
      'https://onefocusfou.netlify.app',
      'https://api.onefocus.org.rw',
      'https://onefocus.org.rw'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ✅ Now this will work without TypeScript errors
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  const config = new DocumentBuilder()
    .setTitle('One Focus Foundation API')
    .setDescription('Backend API for One Focus Foundation application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on port: ${port}`);
  console.log(`Swagger documentation available at: /api/docs`);
}

bootstrap().catch(err => {
  console.error('Error starting application:', err);
  process.exit(1);
});