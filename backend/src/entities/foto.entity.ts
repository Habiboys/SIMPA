import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Maintenance } from './maintenance.entity';

export enum FotoStatus {
  SEBELUM = 'sebelum',
  SESUDAH = 'sesudah'
}

@Entity('foto')
export class Foto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_maintenance: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto: string;

  @Column({ type: 'enum', enum: FotoStatus, nullable: true })
  status: FotoStatus;

  @ManyToOne(() => Maintenance, maintenance => maintenance.foto)
  maintenance: Maintenance;
}