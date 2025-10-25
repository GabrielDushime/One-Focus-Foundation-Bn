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
import { DonationModule } from './Donation/donation.module';
import { MentorModule } from './Mentor/mentor.module';
import { BasicMembershipModule } from './Membership/Basic/basic-membership.module';
import { PremiumMembershipModule } from './Membership/Premium/premium-membership.module';
import { CorporateSponsorModule } from './Membership/Corporate/corporate-sponsor.module';
import { WorkshopModule } from './Workshop/workshop.module';
import { ContactModule } from './Contact/contact.module';
import { SubscribeModule } from './Subscription/subscribe.module';
import { EventModule } from './Event-creation/event.module';
import { EventRegistrationModule } from './Event-Registration/event-registration.module';
import { BlogModule } from './Blog/blog.module';
import { GetInvolvedActionsModule } from './Get-Involved-Actions/get-involved-actions.module';
import { BeGuestModule } from './Be-Guest/be-guest.module';
import { InternshipApplicationModule } from './Internship/internship.module';
import { SocialMediaSupportModule } from './Social-Media/media.module';
import { TrainingEnrollmentModule } from './Training/training.module';
import { BookShootModule } from './Book-Shoot/bookshoot.module';
import { StartCodingModule } from './Start-Coding/startcoding.module';
import { CertificateRequestModule } from './Certificate/certificate.module';

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
    DonationModule,
    MentorModule,
    SubscribeModule,
    BasicMembershipModule,
    PremiumMembershipModule,
    CorporateSponsorModule,
    WorkshopModule,
    ContactModule,
    EventModule,
    EventRegistrationModule,
    BlogModule,
    GetInvolvedActionsModule,
    BeGuestModule, 
    InternshipApplicationModule,
    SocialMediaSupportModule,
    TrainingEnrollmentModule,
    BookShootModule,
    StartCodingModule,
    CertificateRequestModule


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}