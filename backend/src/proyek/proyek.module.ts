import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyekController } from './proyek.controller';
import { ProyekService } from './proyek.service';
import { Proyek } from '../entities/proyek.entity';
import { Gedung } from '../entities/gedung.entity';
import { Ruangan } from '../entities/ruangan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proyek, Gedung, Ruangan])],
  controllers: [ProyekController],
  providers: [ProyekService],
  exports: [ProyekService],
})
export class ProyekModule {}
