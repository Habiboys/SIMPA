// maintenance.controller.ts
import { Controller, Post, Body, NotFoundException, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from '../entities/maintenance.entity';
import { HasilPemeriksaan } from '../entities/hasil-pemeriksaan.entity';
import { HasilPembersihan } from '../entities/hasil-pembersihan.entity';

import { Foto } from '../entities/foto.entity';
import { Unit } from '../entities/unit.entity';
import { CreateMaintenanceDto } from './dto/maintenance.dto';
import * as fs from 'fs';
import * as path from 'path';

@Controller('maintenance')
export class MaintenanceController {
  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepo: Repository<Maintenance>,
    @InjectRepository(HasilPemeriksaan)
    private hasilPemeriksaanRepo: Repository<HasilPemeriksaan>,
    @InjectRepository(HasilPembersihan)
    private hasilPembersihanRepo: Repository<HasilPembersihan>,
    @InjectRepository(Foto)
    private fotoRepo: Repository<Foto>,
    @InjectRepository(Unit)
    private unitRepo: Repository<Unit>,
  ) {}

  @Post()
  async create(@Body() dto: CreateMaintenanceDto) {
    const queryRunner = this.maintenanceRepo.manager.connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the unit first
      const unit = await this.unitRepo.findOne({ where: { id: dto.id_unit } });
      if (!unit) {
        throw new NotFoundException(`Unit with ID ${dto.id_unit} not found`);
      }

      // Create maintenance record
      const maintenance = this.maintenanceRepo.create({
        id_unit: dto.id_unit,
        unit: unit,  // Set both id_unit and unit relation
        tanggal: dto.tanggal,
        nama_pemeriksaan: dto.nama_pemeriksaan,
        kategori: dto.kategori,
      });
      
      const savedMaintenance = await queryRunner.manager.save(maintenance);

      // Create hasil pemeriksaan records
      const hasilPemeriksaanPromises = dto.hasil_pemeriksaan.map(hp => {
        const hasilPemeriksaan = this.hasilPemeriksaanRepo.create({
          id_maintenance: savedMaintenance.id,
          maintenance: savedMaintenance,
          id_variable_pemeriksaan: hp.id_variable_pemeriksaan,
          nilai: hp.nilai,
        });
        return queryRunner.manager.save(hasilPemeriksaan);
      });

      // Create hasil pembersihan records
      const hasilPembersihanPromises = dto.hasil_pembersihan.map(hp => {
        const hasilPembersihan = this.hasilPembersihanRepo.create({
          id_maintenance: savedMaintenance.id,
          maintenance: savedMaintenance,
          id_variable_pembersihan: hp.id_variable_pembersihan,
          sebelum: hp.sebelum,
          sesudah: hp.sesudah,
        });
        return queryRunner.manager.save(hasilPembersihan);
      });

      // Handle foto uploads
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fotoPromises = dto.foto.map(async (f) => {
        const buffer = Buffer.from(f.foto, 'base64');
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filepath = path.join(uploadDir, filename);
        
        await fs.promises.writeFile(filepath, buffer);

        const foto = this.fotoRepo.create({
          id_maintenance: savedMaintenance.id,
          maintenance: savedMaintenance,
          foto: filename,
          status: f.status,
        });
        return queryRunner.manager.save(foto);
      });

      await Promise.all([
        ...hasilPemeriksaanPromises,
        ...hasilPembersihanPromises,
        ...fotoPromises,
      ]);

      await queryRunner.commitTransaction();

      return {
        message: 'Maintenance data created successfully',
        maintenance_id: savedMaintenance.id,
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

