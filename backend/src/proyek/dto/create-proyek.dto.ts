import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateProyekDto {
  @ApiProperty({
    example: 'Gedung Perkantoran ABC',
    description: 'Nama proyek',
  })
  @IsNotEmpty()
  @IsString()
  nama: string;

  @ApiProperty({
    example: 'PT. XYZ Indonesia',
    description: 'Nama pelanggan/client',
  })
  @IsNotEmpty()
  @IsString()
  pelanggan: string;

  @ApiProperty({
    example: '2025-01-08',
    description: 'Tanggal proyek (format: YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  tanggal: string;

  @ApiProperty({
    example: 'Jl. Sudirman No. 123, Jakarta',
    description: 'Lokasi proyek',
  })
  @IsNotEmpty()
  @IsString()
  lokasi: string;
}
