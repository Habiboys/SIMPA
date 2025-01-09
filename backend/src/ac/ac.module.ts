// src/ac/ac.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merek } from '../entities/merek.entity';
import { JenisModel } from '../entities/jenis-model.entity';
import { DetailModel } from '../entities/detail-model.entity';
import { Unit } from '../entities/unit.entity';
import { Ruangan } from '../entities/ruangan.entity';
import { MerekController } from './controllers/merek.controller';
import { JenisModelController } from './controllers/jenis-model.controller';
import { DetailModelController } from './controllers/detail-model.controller';
import { UnitController } from './controllers/unit.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merek,
      JenisModel,
      DetailModel,
      Unit,
      Ruangan
    ])
  ],
  controllers: [
    MerekController,
    JenisModelController,
    DetailModelController,
    UnitController
  ]
})
export class AcModule {}