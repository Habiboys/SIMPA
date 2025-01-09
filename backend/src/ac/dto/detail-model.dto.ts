import { IsString, IsNumber, IsEnum } from 'class-validator';
import { DetailModelKategori } from '../../entities/detail-model.entity';

export class CreateDetailModelDto {
  @IsNumber()
  id_model: number;

  @IsString()
  nama_model: string;

  @IsEnum(DetailModelKategori)
  kategori: DetailModelKategori;
}

export class UpdateDetailModelDto extends CreateDetailModelDto {}