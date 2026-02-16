import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CadencesController } from './cadences.controller';
import { CadencesService } from './cadences.service';
import { CadenceEntity } from './entities/cadence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CadenceEntity])],
  controllers: [CadencesController],
  providers: [CadencesService],
  exports: [CadencesService],
})
export class CadencesModule {}
