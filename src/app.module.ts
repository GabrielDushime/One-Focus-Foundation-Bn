import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JoinUsModule } from './Our-Programs/join-us/join-us.module';
import { BookUsModule } from './Our-Programs/book-now/book-us.module';
import { GetInvolvedModule } from './Our-Programs/get-involved/get-involved.module';
import { RegisterNowModule } from './Events/Online-Empowerment-Conference-Africa/register-now.module';
import { VolunteerModule } from './Get-Involved/Volunteer-With-Us/volunteer.module';
import { PartnershipModule } from './Get-Involved/Partner-With-Us/partnership.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
  
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

  
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }),

  AuthModule,
  JoinUsModule,
  BookUsModule,
  GetInvolvedModule,
  RegisterNowModule,
  VolunteerModule,
  PartnershipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}