// maintenance.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Proyek } from './proyek.entity';
import { HasilPemeriksaan } from './hasil-pemeriksaan.entity';

@Entity('maintenance')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_proyek: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama: string;

  @Column({ type: 'date', nullable: true })
  tanggal: Date;

  @ManyToOne(() => Proyek, (proyek) => proyek.maintenance)
  proyek: Proyek;

  @OneToMany(
    () => HasilPemeriksaan,
    (hasilPemeriksaan) => hasilPemeriksaan.maintenance,
  )
  hasilPemeriksaan: HasilPemeriksaan[];
}
