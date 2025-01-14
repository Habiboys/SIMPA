import { IsString, IsNumber, IsEnum } from 'class-validator';
import { UnitKategori } from '../../entities/unit.entity';

export class CreateUnitDto {
  @IsNumber()
  id_jenis_model: number;

  @IsNumber()
  id_ruangan: number;

  // @IsString()
  // nama: string;

  @IsString()
  nomor_seri: string;

  // @IsEnum(UnitKategori)
  // kategori: UnitKategori;
}

export class UpdateUnitDto extends CreateUnitDto {}