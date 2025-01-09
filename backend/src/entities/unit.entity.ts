import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { JenisModel } from './jenis-model.entity';
import { DetailModel } from './detail-model.entity';
import { Ruangan } from './ruangan.entity';
import { Maintenance } from './maintenance.entity';

export enum UnitKategori {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor'
}

@Entity('unit')
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_ruangan: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomor_seri: string;

  @Column({ type: 'enum', enum: UnitKategori, nullable: true })
  kategori: UnitKategori;

  @ManyToOne(() => DetailModel, detailModel => detailModel.unit)
  @JoinColumn({ name: 'id_detail_model' }) // Sesuaikan dengan nama kolom di database
  detailModel: DetailModel;

  @ManyToOne(() => Ruangan, ruangan => ruangan.unit)
  @JoinColumn({ name: 'id_ruangan' }) // Ini sudah sesuai, tapi tambahkan untuk kejelasan
  ruangan: Ruangan;

  @OneToMany(() => Maintenance, maintenance => maintenance.unit)
  maintenance: Maintenance[];
}