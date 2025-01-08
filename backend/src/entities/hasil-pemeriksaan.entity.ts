import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Maintenance } from './maintenance.entity';
import { Unit } from './unit.entity';
import { HasilPembersihan } from './hasil-pembersihan.entity';
import { FotoPemeriksaan } from './foto-pemeriksaan.entity';

import { Kategori } from '../enums/kategori.enum';

@Entity('hasil_pemeriksaan')
export class HasilPemeriksaan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_maintenance: number;

  @Column({ nullable: true })
  id_unit: number;

  @Column({ type: 'date', nullable: true })
  tanggal: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_pemeriksaan: string;

  @Column({ type: 'enum', enum: Kategori, nullable: true })
  kategori: Kategori;

  @ManyToOne(() => Maintenance, (maintenance) => maintenance.hasilPemeriksaan)
  maintenance: Maintenance;

  @ManyToOne(() => Unit, (unit) => unit.hasilPemeriksaan)
  unit: Unit;

  @OneToMany(
    () => HasilPembersihan,
    (hasilPembersihan) => hasilPembersihan.hasilPemeriksaan,
  )
  hasilPembersihan: HasilPembersihan[];

  @OneToMany(
    () => FotoPemeriksaan,
    (fotoPemeriksaan) => fotoPemeriksaan.hasilPemeriksaan,
  )
  fotoPemeriksaan: FotoPemeriksaan[];
}
