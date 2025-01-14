import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VariablePemeriksaan, VariablePemeriksaanJenis } from '../entities/variable-pemeriksaan.entity';
import { VariablePembersihan, VariablePembersihanJenis } from '../entities/variable-pembersihan.entity';
import { CreateVariablePembersihanDto } from './dto/create-variable-pembersihan.dto';
import { UpdateVariablePembersihanDto } from './dto/update-variable-pembersihan.dto';
import { CreateVariablePemeriksaanDto } from './dto/create-variable-pemeriksaan.dto';
import { UpdateVariablePemeriksaanDto } from './dto/update-variable-pemeriksaan.dto';

@Controller('variable-pemeriksaan')
export class VariablePemeriksaanController {
  constructor(
    @InjectRepository(VariablePemeriksaan)
    private variablePemeriksaanRepo: Repository<VariablePemeriksaan>
  ) {}

  @Post()
  async create(@Body() createDto: CreateVariablePemeriksaanDto) {
    const variable = this.variablePemeriksaanRepo.create({
      nama_variable: createDto.nama_variable,
      jenis: createDto.jenis
    });
    return await this.variablePemeriksaanRepo.save(variable);
  }

  @Get()
  async findAll() {
    return await this.variablePemeriksaanRepo.find({
      relations: ['hasilPemeriksaan']
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const variable = await this.variablePemeriksaanRepo.findOne({
      where: { id },
      relations: ['hasilPemeriksaan']
    });

    if (!variable) {
      throw new NotFoundException(`Variable pemeriksaan with ID ${id} not found`);
    }

    return variable;
  }

  @Get('kategori/:kategori')
  async getByKategori(@Param('kategori') kategori: string) {
    return await this.variablePemeriksaanRepo.findBy({ 
      jenis: kategori as VariablePemeriksaanJenis 
    });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateVariablePemeriksaanDto
  ) {
    const variable = await this.variablePemeriksaanRepo.findOne({
      where: { id }
    });

    if (!variable) {
      throw new NotFoundException(`Variable pemeriksaan with ID ${id} not found`);
    }

    await this.variablePemeriksaanRepo.update(id, {
      nama_variable: updateDto.nama_variable,
      jenis: updateDto.jenis
    });
    
    return await this.variablePemeriksaanRepo.findOne({
      where: { id },
      relations: ['hasilPemeriksaan']
    });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.variablePemeriksaanRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Variable pemeriksaan with ID ${id} not found`);
    }
    return { message: 'Variable pemeriksaan deleted successfully' };
  }
}

@Controller('variable-pembersihan')
export class VariablePembersihanController {
  constructor(
    @InjectRepository(VariablePembersihan)
    private variablePembersihanRepo: Repository<VariablePembersihan>
  ) {}

  @Post()
  async create(@Body() createDto: CreateVariablePembersihanDto) {
    const variable = this.variablePembersihanRepo.create({
      nama_variable: createDto.nama_variable,
      jenis: createDto.jenis
    });
    return await this.variablePembersihanRepo.save(variable);
  }

  @Get()
  async findAll() {
    return await this.variablePembersihanRepo.find({
      relations: ['hasilPembersihan']
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const variable = await this.variablePembersihanRepo.findOne({
      where: { id },
      relations: ['hasilPembersihan']
    });

    if (!variable) {
      throw new NotFoundException(`Variable pembersihan with ID ${id} not found`);
    }

    return variable;
  }

  @Get('kategori/:kategori')
  async getByKategori(@Param('kategori') kategori: string) {
    return await this.variablePembersihanRepo.findBy({ 
      jenis: kategori as VariablePembersihanJenis 
    });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateVariablePembersihanDto
  ) {
    const variable = await this.variablePembersihanRepo.findOne({
      where: { id }
    });

    if (!variable) {
      throw new NotFoundException(`Variable pembersihan with ID ${id} not found`);
    }

    await this.variablePembersihanRepo.update(id, {
      nama_variable: updateDto.nama_variable,
      jenis: updateDto.jenis
    });
    
    return await this.variablePembersihanRepo.findOne({
      where: { id },
      relations: ['hasilPembersihan']
    });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.variablePembersihanRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Variable pembersihan with ID ${id} not found`);
    }
    return { message: 'Variable pembersihan deleted successfully' };
  }
}