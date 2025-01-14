import { IsString, IsNumber } from 'class-validator';

export class CreateJenisModelDto {
  @IsNumber()
  id_merek: number;

  @IsString()
  nama_model: string;

  // @IsString()
  // kapasitas: string;
}

export class UpdateJenisModelDto extends CreateJenisModelDto {}