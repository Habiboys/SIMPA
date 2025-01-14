import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { VariablePemeriksaanJenis } from '../../entities/variable-pemeriksaan.entity';

export class CreateVariablePemeriksaanDto {
  @IsString()
  @IsNotEmpty()
  nama_variable: string;

  @IsEnum(VariablePemeriksaanJenis)
  @IsNotEmpty()
  jenis: VariablePemeriksaanJenis;
}