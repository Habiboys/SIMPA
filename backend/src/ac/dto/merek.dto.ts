import { IsString } from 'class-validator';

export class CreateMerekDto {
  @IsString()
  nama: string;
}

export class UpdateMerekDto extends CreateMerekDto {}