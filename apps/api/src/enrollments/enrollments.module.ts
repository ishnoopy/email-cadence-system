import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { CadencesModule } from '../cadences/cadences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentEntity]),
    CadencesModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
