import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController } from './maintenance.controller';
import { Maintenance } from '../entities/maintenance.entity';
import { HasilPemeriksaan } from '../entities/hasil-pemeriksaan.entity';
import { HasilPembersihan } from '../entities/hasil-pembersihan.entity';
import { VariablePembersihan } from '../entities/variable-pembersihan.entity';
import { VariablePemeriksaan } from '../entities/variable-pemeriksaan.entity';
import { VariablePembersihanController, VariablePemeriksaanController } from './variable.controller';
import { Foto } from '../entities/foto.entity';
import { Unit } from '../entities/unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Maintenance,
      HasilPemeriksaan,
      HasilPembersihan,
      Foto,
      Unit,
      VariablePemeriksaan,
      VariablePembersihan,
    ])
  ],
  controllers: [
    MaintenanceController,   
    VariablePemeriksaanController,
    VariablePembersihanController
  ],
})
export class MaintenanceModule {}