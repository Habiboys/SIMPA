import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merek } from '../../entities/merek.entity';
import { CreateMerekDto, UpdateMerekDto } from '../dto/merek.dto';

@Controller('merek')
export class MerekController {
  constructor(
    @InjectRepository(Merek)
    private merekRepo: Repository<Merek>,
  ) {}

  @Get()
  async findAll() {
    return await this.merekRepo.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const merek = await this.merekRepo.findOne({ where: { id } });
    if (!merek) throw new NotFoundException('Merek not found');
    return merek;
  }

  @Post()
  async create(@Body() dto: CreateMerekDto) {
    const merek = this.merekRepo.create(dto);
    return await this.merekRepo.save(merek);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateMerekDto) {
    const merek = await this.merekRepo.findOne({ where: { id } });
    if (!merek) throw new NotFoundException('Merek not found');
    
    Object.assign(merek, dto);
    return await this.merekRepo.save(merek);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const merek = await this.merekRepo.findOne({ where: { id } });
    if (!merek) throw new NotFoundException('Merek not found');
    
    await this.merekRepo.remove(merek);
    return { message: 'Merek deleted successfully' };
  }
}