// maintenance.dto.ts
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaintenanceKategori } from '../../entities/maintenance.entity';
import { FotoStatus } from '../../entities/foto.entity';

class HasilPemeriksaanDto {
  @IsNumber()
  id_variable_pemeriksaan: number;

  @IsString()
  nilai: string;
}

class HasilPembersihanDto {
  @IsNumber()
  id_variable_pembersihan: number;

  @IsNumber()
  sebelum: number;

  @IsNumber()
  sesudah: number;
}

class FotoDto {
  @IsString()
  nama: string;
  
  @IsString()
  foto: string;

  @IsEnum(FotoStatus)
  status: FotoStatus;
}

export class CreateMaintenanceDto {
  @IsNumber()
  id_unit: number;

  @IsDate()
  @Type(() => Date)
  tanggal: Date;

  @IsString()
  nama_pemeriksaan: string;

  @IsString()
  palet_indoor: string;

  @IsString()
  palet_outdoor: string;

  @IsEnum(MaintenanceKategori)
  kategori: MaintenanceKategori;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HasilPemeriksaanDto)
  hasil_pemeriksaan: HasilPemeriksaanDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HasilPembersihanDto)
  hasil_pembersihan: HasilPembersihanDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FotoDto)
  foto: FotoDto[];
}
