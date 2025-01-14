import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../../entities/unit.entity';
import { DetailModel } from '../../entities/detail-model.entity';
import { Ruangan } from '../../entities/ruangan.entity';
import { CreateUnitDto, UpdateUnitDto } from '../dto/unit.dto';

@Controller('unit')
export class UnitController {
  constructor(
    @InjectRepository(Unit)
    private unitRepo: Repository<Unit>,
    @InjectRepository(DetailModel)
    private detailModelRepo: Repository<DetailModel>,
    @InjectRepository(Ruangan)
    private ruanganRepo: Repository<Ruangan>,
  ) {}
  @Get(':proyekId')
  async findAll(@Param('proyekId') proyekId: number) {
    return await this.unitRepo.find({
      where: { 
        ruangan: { 
          gedung: { 
            proyek: { id: proyekId } 
          } 
        }
      },
      relations: ['detailModel', 'ruangan', 'ruangan.gedung', 'ruangan.gedung.proyek', 'detailModel.jenisModel', 'detailModel.jenisModel.merek']
    });
  }

  @Get('ruangan/:ruanganId')
  async findByRuangan(@Param('ruanganId') ruanganId: number) {
    return await this.unitRepo.find({
      where: { 
        ruangan: { id: ruanganId },
      },
      relations: ['detailModel', 'ruangan',  'detailModel', 'detailModel.jenisModel', 'detailModel.jenisModel.merek' ]
    });
  }
  

  // @Get()
  // async findAll() {
  //   return await this.unitRepo.find({
  //     relations: ['detailModel', 'ruangan']
  //   });
  // }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const unit = await this.unitRepo.findOne({
      where: { id },
      relations: ['detailModel', 'ruangan']
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  @Post()
  async create(@Body() dto: CreateUnitDto) {
    const detailModel = await this.detailModelRepo.findOne({
      where: { id: dto.id_jenis_model }
    });
    if (!detailModel) throw new NotFoundException('DetailModel not found');

    const ruangan = await this.ruanganRepo.findOne({
      where: { id: dto.id_ruangan }
    });
    if (!ruangan) throw new NotFoundException('Ruangan not found');

    const unit = this.unitRepo.create({
      ...dto,
      detailModel: detailModel,
      ruangan: ruangan
    });
    return await this.unitRepo.save(unit);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateUnitDto) {
    const unit = await this.unitRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException('Unit not found');

    const detailModel = await this.detailModelRepo.findOne({
      where: { id: dto.id_jenis_model }
    });
    if (!detailModel) throw new NotFoundException('DetailModel not found');

    const ruangan = await this.ruanganRepo.findOne({
      where: { id: dto.id_ruangan }
    });
    if (!ruangan) throw new NotFoundException('Ruangan not found');
    
    Object.assign(unit, { ...dto, detailModel, ruangan });
    return await this.unitRepo.save(unit);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const unit = await this.unitRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException('Unit not found');
    
    await this.unitRepo.remove(unit);
    return { message: 'Unit deleted successfully' };
  }
}