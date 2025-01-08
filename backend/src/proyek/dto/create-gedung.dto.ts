import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateGedungDto {
  //   @ApiProperty({
  //     example: 1,
  //     description: 'ID dari proyek'
  //   })
  //   @IsNotEmpty()
  //   @IsNumber()
  //   id_proyek: number;

  @ApiProperty({
    example: 'Tower A',
    description: 'Nama gedung',
  })
  @IsNotEmpty()
  @IsString()
  nama: string;
}
