import { PartialType } from '@nestjs/mapped-types';
import { CreateGedungDto } from './create-gedung.dto';

export class UpdateGedungDto extends PartialType(CreateGedungDto) {}
