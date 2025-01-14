import { PartialType } from '@nestjs/mapped-types';
import { CreateVariablePembersihanDto } from './create-variable-pembersihan.dto';

export class UpdateVariablePembersihanDto extends PartialType(CreateVariablePembersihanDto) {}
