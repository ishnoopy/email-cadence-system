import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CadencesModule } from './cadences/cadences.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { TemporalModule } from './temporal/temporal.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || './data/cadence.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    CadencesModule,
    EnrollmentsModule,
    TemporalModule,
  ],
})
export class AppModule { }
