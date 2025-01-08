import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { JenisModel } from './jenis-model.entity';

import { Kategori } from '../enums/kategori.enum';

@Entity('detail_model')
export class DetailModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_model: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_model: string;

  @Column({ type: 'enum', enum: Kategori, nullable: true })
  kategori: Kategori;

  @ManyToOne(() => JenisModel, (jenisModel) => jenisModel.detailModel)
  jenisModel: JenisModel;
}
