// ruangan.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Gedung } from './gedung.entity';
import { Unit } from './unit.entity';

@Entity('ruangan')
export class Ruangan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_gedung: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama: string;

  @Column({ type: 'varchar', nullable: true })
  lantai: string;

  @ManyToOne(() => Gedung, (gedung) => gedung.ruangan)
  @JoinColumn({ name: 'id_gedung' })
  gedung: Gedung;

  @OneToMany(() => Unit, (unit) => unit.ruangan)
  unit: Unit[];
}
