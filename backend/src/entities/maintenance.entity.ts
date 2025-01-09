import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Unit } from './unit.entity';
import { HasilPembersihan } from './hasil-pembersihan.entity';
import { HasilPemeriksaan } from './hasil-pemeriksaan.entity';
import { Foto } from './foto.entity';

export enum MaintenanceKategori {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor'
}

@Entity('maintenance')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_unit: number;

  @Column({ type: 'date', nullable: true })
  tanggal: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_pemeriksaan: string;

  @Column({ type: 'enum', enum: MaintenanceKategori, nullable: true })
  kategori: MaintenanceKategori;

  @ManyToOne(() => Unit, unit => unit.maintenance)
  @JoinColumn({ name: 'id_unit' }) 
  unit: Unit;

  @OneToMany(() => HasilPembersihan, hasilPembersihan => hasilPembersihan.maintenance)
  hasilPembersihan: HasilPembersihan[];

  @OneToMany(() => HasilPemeriksaan, hasilPemeriksaan => hasilPemeriksaan.maintenance)
  hasilPemeriksaan: HasilPemeriksaan[];

  @OneToMany(() => Foto, foto => foto.maintenance)
  foto: Foto[];
}