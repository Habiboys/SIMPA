import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { JenisModel } from './jenis-model.entity';
import { Ruangan } from './ruangan.entity';
import { HasilPemeriksaan } from './hasil-pemeriksaan.entity';

import { Kategori } from '../enums/kategori.enum';

@Entity('unit')
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_model: number;

  @Column({ nullable: true })
  id_ruangan: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomor_seri: string;

  @Column({ type: 'enum', enum: Kategori, nullable: true })
  kategori: Kategori;

  @ManyToOne(() => JenisModel, (jenisModel) => jenisModel.unit)
  jenisModel: JenisModel;

  @ManyToOne(() => Ruangan, (ruangan) => ruangan.unit)
  ruangan: Ruangan;

  @OneToMany(
    () => HasilPemeriksaan,
    (hasilPemeriksaan) => hasilPemeriksaan.unit,
  )
  hasilPemeriksaan: HasilPemeriksaan[];
}
