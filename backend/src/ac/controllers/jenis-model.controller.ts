// src/ac/controllers/jenis-model.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JenisModel } from '../../entities/jenis-model.entity';
import { Merek } from '../../entities/merek.entity';
import { CreateJenisModelDto, UpdateJenisModelDto } from '../dto/jenis-model.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';  // Import the RolesGuard
import { Roles } from '../../auth/decorators/role.decorator';  // Import the Roles decorator
import { Role } from '../../enums/role.enum';  

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) 
@Controller('jenis-model')
export class JenisModelController {
  constructor(
    @InjectRepository(JenisModel)
    private jenisModelRepo: Repository<JenisModel>,
    @InjectRepository(Merek)
    private merekRepo: Repository<Merek>,
  ) {}

  @Get()
  async findAll() {
    return await this.jenisModelRepo.find({
      relations: ['merek', 'detailModel'],
      order: {
        merek: { nama: 'ASC' },
        nama_model: 'ASC'
      }
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const jenisModel = await this.jenisModelRepo.findOne({
      where: { id },
      relations: ['merek', 'detailModel']
    });
    if (!jenisModel) throw new NotFoundException('JenisModel not found');
    return jenisModel;
  }

  @Post()
  async create(@Body() dto: CreateJenisModelDto) {
    const merek = await this.merekRepo.findOne({ where: { id: dto.id_merek } });
    if (!merek) throw new NotFoundException('Merek not found');

    const jenisModel = this.jenisModelRepo.create({
      ...dto,
      merek: merek
    });
    return await this.jenisModelRepo.save(jenisModel);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateJenisModelDto) {
    const jenisModel = await this.jenisModelRepo.findOne({ where: { id } });
    if (!jenisModel) throw new NotFoundException('JenisModel not found');

    const merek = await this.merekRepo.findOne({ where: { id: dto.id_merek } });
    if (!merek) throw new NotFoundException('Merek not found');
    
    Object.assign(jenisModel, { ...dto, merek });
    return await this.jenisModelRepo.save(jenisModel);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const jenisModel = await this.jenisModelRepo.findOne({ where: { id } });
    if (!jenisModel) throw new NotFoundException('JenisModel not found');
    
    await this.jenisModelRepo.remove(jenisModel);
    return { message: 'JenisModel deleted successfully' };
  }
}