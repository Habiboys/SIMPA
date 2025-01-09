import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { JenisModel } from './jenis-model.entity';
import { Unit } from './unit.entity';

export enum DetailModelKategori {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor'
}

@Entity('detail_model')
export class DetailModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_model: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_model: string;

  @Column({ type: 'enum', enum: DetailModelKategori, nullable: true })
  kategori: DetailModelKategori;

  @ManyToOne(() => JenisModel, jenisModel => jenisModel.detailModel)
  jenisModel: JenisModel;

  
  @OneToMany(() => Unit, (unit) => unit.detailModel)
  unit: Unit[];
}