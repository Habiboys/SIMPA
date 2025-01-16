import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRuanganDto {
  @ApiProperty({
    example: 1,
    description: 'ID dari gedung',
  })
  @IsNotEmpty()
  @IsNumber()
  id_gedung: number;

  @ApiProperty({
    example: 'Meeting Room 101',
    description: 'Nama ruangan',
  })
  @IsNotEmpty()
  @IsString()
  nama: string;

  @ApiProperty({
    example: 5,
    description: 'Nomor lantai',
    required: false,
  })
  @IsOptional()
  lantai: string;
}
