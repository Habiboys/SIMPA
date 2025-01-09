import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { HasilPembersihan } from './hasil-pembersihan.entity';

export enum VariablePembersihanJenis {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor'
}

@Entity('variable_pembersihan')
export class VariablePembersihan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_variabel: string;

  @Column({ type: 'enum', enum: VariablePembersihanJenis, nullable: true })
  jenis: VariablePembersihanJenis;

  @OneToMany(() => HasilPembersihan, hasilPembersihan => hasilPembersihan.variablePembersihan)
  hasilPembersihan: HasilPembersihan[];
}