import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { JenisModel } from './jenis-model.entity';

@Entity('merek')
export class Merek {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama: string;

  @OneToMany(() => JenisModel, (jenisModel) => jenisModel.merek)
  jenisModel: JenisModel[];
}
