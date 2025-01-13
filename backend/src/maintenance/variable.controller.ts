import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VariablePemeriksaan, VariablePemeriksaanJenis } from '../entities/variable-pemeriksaan.entity';
import { VariablePembersihan, VariablePembersihanJenis } from '../entities/variable-pembersihan.entity';

@Controller('variable-pemeriksaan')
export class VariablePemeriksaanController {
  constructor(
    @InjectRepository(VariablePemeriksaan)
    private variablePemeriksaanRepo: Repository<VariablePemeriksaan>
  ) {}

  @Get('kategori/:kategori')
  async getByKategori(@Param('kategori') kategori: string) {
    return await this.variablePemeriksaanRepo.findBy({ 
      jenis: kategori as VariablePemeriksaanJenis 
    });
  }
}

@Controller('variable-pembersihan')
export class VariablePembersihanController {
  constructor(
    @InjectRepository(VariablePembersihan)
    private variablePembersihanRepo: Repository<VariablePembersihan>
  ) {}

  @Get('kategori/:kategori')
  async getByKategori(@Param('kategori') kategori: string) {
    return await this.variablePembersihanRepo.findBy({ 
      jenis: kategori as VariablePembersihanJenis 
    });
  }
}