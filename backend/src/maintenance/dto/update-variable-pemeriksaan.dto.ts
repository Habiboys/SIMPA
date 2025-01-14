import { PartialType } from '@nestjs/mapped-types';
import { CreateVariablePemeriksaanDto } from './create-variable-pemeriksaan.dto';

export class UpdateVariablePemeriksaanDto extends PartialType(CreateVariablePemeriksaanDto) {}