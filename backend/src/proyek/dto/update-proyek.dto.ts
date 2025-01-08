import { PartialType } from '@nestjs/mapped-types';
import { CreateProyekDto } from './create-proyek.dto';

export class UpdateProyekDto extends PartialType(CreateProyekDto) {}
