import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyek } from '../entities/proyek.entity';
import { Gedung } from '../entities/gedung.entity';
import { Ruangan } from '../entities/ruangan.entity';
import { CreateProyekDto } from './dto/create-proyek.dto';
import { UpdateProyekDto } from './dto/update-proyek.dto';
import { CreateGedungDto } from './dto/create-gedung.dto';
import { UpdateGedungDto } from './dto/update-gedung.dto';
import { CreateRuanganDto } from './dto/create-ruangan.dto';
import { UpdateRuanganDto } from './dto/update-ruangan.dto';

@Injectable()
export class ProyekService {
  constructor(
    @InjectRepository(Proyek)
    private proyekRepository: Repository<Proyek>,
    @InjectRepository(Gedung)
    private gedungRepository: Repository<Gedung>,
    @InjectRepository(Ruangan)
    private ruanganRepository: Repository<Ruangan>,
  ) {}

  // Proyek methods
  async createProyek(createProyekDto: CreateProyekDto) {
    const proyek = this.proyekRepository.create(createProyekDto);
    return await this.proyekRepository.save(proyek);
  }

  async findAllProyek() {
    return await this.proyekRepository.find({
      relations: ['gedung'],
    });
  }

  async findOneProyek(id: number) {
    const proyek = await this.proyekRepository.findOne({
      where: { id },
      relations: ['gedung'],
    });

    if (!proyek) {
      throw new NotFoundException(`Proyek dengan ID ${id} tidak ditemukan`);
    }

    return proyek;
  }

  async updateProyek(id: number, updateProyekDto: UpdateProyekDto) {
    const proyek = await this.findOneProyek(id);
    Object.assign(proyek, updateProyekDto);
    return await this.proyekRepository.save(proyek);
  }

  async removeProyek(id: number) {
    const proyek = await this.findOneProyek(id);
    return await this.proyekRepository.remove(proyek);
  }

  // Gedung methods
  async createGedung(proyekId: number, createGedungDto: CreateGedungDto) {
    const proyek = await this.findOneProyek(proyekId);
    const gedung = this.gedungRepository.create({
      ...createGedungDto,
      id_proyek: proyekId,
      proyek,
    });
    return await this.gedungRepository.save(gedung);
  }

  async findAllGedung(proyekId: number) {
    const proyek = await this.findOneProyek(proyekId);
    return await this.gedungRepository.find({
      where: { proyek: { id: proyek.id } },
      relations: ['ruangan'],
    });
  }

  async findOneGedung(proyekId: number, id: number) {
    const gedung = await this.gedungRepository.findOne({
      where: { id, proyek: { id: proyekId } },
      relations: ['ruangan'],
    });

    if (!gedung) {
      throw new NotFoundException(`Gedung dengan ID ${id} tidak ditemukan`);
    }

    return gedung;
  }

  async updateGedung(
    proyekId: number,
    id: number,
    updateGedungDto: UpdateGedungDto,
  ) {
    const gedung = await this.findOneGedung(proyekId, id);
    Object.assign(gedung, updateGedungDto);
    return await this.gedungRepository.save(gedung);
  }

  async removeGedung(proyekId: number, id: number) {
    const gedung = await this.findOneGedung(proyekId, id);
    return await this.gedungRepository.remove(gedung);
  }

  // Ruangan methods
  async createRuangan(gedungId: number, createRuanganDto: CreateRuanganDto) {
    const gedung = await this.gedungRepository.findOne({
      where: { id: gedungId },
    });

    if (!gedung) {
      throw new NotFoundException(
        `Gedung dengan ID ${gedungId} tidak ditemukan`,
      );
    }

    const ruangan = this.ruanganRepository.create({
      ...createRuanganDto,
      gedung,
    });
    return await this.ruanganRepository.save(ruangan);
  }

  async findAllRuangan(gedungId: number) {
    return await this.ruanganRepository.find({
      where: { gedung: { id: gedungId } },
      relations: ['unit', 'unit.detailModel'], // Tambahkan relasi ke unit dan detailModel
    });
  }

  async findOneRuangan(gedungId: number, id: number) {
    const ruangan = await this.ruanganRepository.findOne({
      where: { id, gedung: { id: gedungId } },
      relations: ['unit'],
    });

    if (!ruangan) {
      throw new NotFoundException(`Ruangan dengan ID ${id} tidak ditemukan`);
    }

    return ruangan;
  }

  async updateRuangan(
    gedungId: number,
    id: number,
    updateRuanganDto: UpdateRuanganDto,
  ) {
    const ruangan = await this.findOneRuangan(gedungId, id);
    Object.assign(ruangan, updateRuanganDto);
    return await this.ruanganRepository.save(ruangan);
  }

  async removeRuangan(gedungId: number, id: number) {
    const ruangan = await this.findOneRuangan(gedungId, id);
    return await this.ruanganRepository.remove(ruangan);
  }

 async countProyek(): Promise<number> {
    return await this.proyekRepository.count();
  }

  async countGedung(proyekId: number): Promise<number> {
  const proyek = await this.findOneProyek(proyekId);
  return await this.gedungRepository.count({
    where: { proyek: { id: proyek.id } },
  });
}
}
