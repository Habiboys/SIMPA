// src/ac/controllers/detail-model.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetailModel } from '../../entities/detail-model.entity';
import { JenisModel } from '../../entities/jenis-model.entity';
import { CreateDetailModelDto, UpdateDetailModelDto } from '../dto/detail-model.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';  // Import the RolesGuard
import { Roles } from '../../auth/decorators/role.decorator';  // Import the Roles decorator
import { Role } from '../../enums/role.enum';  


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) 
@Controller('detail-model')
export class DetailModelController {
  constructor(
    @InjectRepository(DetailModel)
    private detailModelRepo: Repository<DetailModel>,
    @InjectRepository(JenisModel)
    private jenisModelRepo: Repository<JenisModel>,
  ) {}

  @Get()
  async findAll() {
    return await this.detailModelRepo.find({
      relations: ['jenisModel', 'jenisModel.merek'],
      order: {
        jenisModel: {
          merek: { nama: 'ASC' },
          nama_model: 'ASC'
        },
        nama_model: 'ASC'
      }
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const detailModel = await this.detailModelRepo.findOne({
      where: { id },
      relations: ['jenisModel']
    });
    if (!detailModel) throw new NotFoundException('DetailModel not found');
    return detailModel;
  }

  @Post()
  async create(@Body() dto: CreateDetailModelDto) {
    const jenisModel = await this.jenisModelRepo.findOne({
      where: { id: dto.id_model }
    });
    if (!jenisModel) throw new NotFoundException('JenisModel not found');

    const detailModel = this.detailModelRepo.create({
      ...dto,
      jenisModel: jenisModel
    });
    return await this.detailModelRepo.save(detailModel);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateDetailModelDto) {
    const detailModel = await this.detailModelRepo.findOne({ where: { id } });
    if (!detailModel) throw new NotFoundException('DetailModel not found');

    const jenisModel = await this.jenisModelRepo.findOne({
      where: { id: dto.id_model }
    });
    if (!jenisModel) throw new NotFoundException('JenisModel not found');
    
    Object.assign(detailModel, { ...dto, jenisModel });
    return await this.detailModelRepo.save(detailModel);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const detailModel = await this.detailModelRepo.findOne({ where: { id } });
    if (!detailModel) throw new NotFoundException('DetailModel not found');
    
    await this.detailModelRepo.remove(detailModel);
    return { message: 'DetailModel deleted successfully' };
  }
}