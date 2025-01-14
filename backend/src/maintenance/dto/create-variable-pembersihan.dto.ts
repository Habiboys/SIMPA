import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { VariablePembersihanJenis } from '../../entities/variable-pembersihan.entity';

export class CreateVariablePembersihanDto {
  @IsString()
  @IsNotEmpty()
  nama_variable: string;

  @IsEnum(VariablePembersihanJenis)
  @IsNotEmpty()
  jenis: VariablePembersihanJenis;
}