import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { HasilPemeriksaan } from './hasil-pemeriksaan.entity';

export enum VariablePemeriksaanJenis {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor'
}

@Entity('variable_pemeriksaaan')
export class VariablePemeriksaan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_variable: string;

  @Column({ type: 'enum', enum: VariablePemeriksaanJenis, nullable: true })
  jenis: VariablePemeriksaanJenis;

  @OneToMany(() => HasilPemeriksaan, hasilPemeriksaan => hasilPemeriksaan.variablePemeriksaan)
  hasilPemeriksaan: HasilPemeriksaan[];
}