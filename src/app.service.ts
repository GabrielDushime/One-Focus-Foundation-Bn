import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Welcome to One Focus Foundation Backend API!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getHealth() {
    return {
      status: 'OK',
      message: 'One Focus Foundation Backend is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: {
        status: 'connected', 
      },
    };
  }
}