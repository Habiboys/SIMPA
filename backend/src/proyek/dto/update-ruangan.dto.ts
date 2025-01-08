import { PartialType } from '@nestjs/mapped-types';
import { CreateRuanganDto } from './create-ruangan.dto';

export class UpdateRuanganDto extends PartialType(CreateRuanganDto) {}
