import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Merek } from './merek.entity';
import { DetailModel } from './detail-model.entity';
import { Unit } from './unit.entity';

@Entity('jenis_model')
export class JenisModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_merek: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_model: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  kapasitas: string;

  @ManyToOne(() => Merek, (merek) => merek.jenisModel)
  merek: Merek;

  @OneToMany(() => DetailModel, (detailModel) => detailModel.jenisModel)
  detailModel: DetailModel[];

  @OneToMany(() => Unit, (unit) => unit.jenisModel)
  unit: Unit[];
}
