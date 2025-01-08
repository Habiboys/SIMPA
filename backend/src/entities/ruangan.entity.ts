// ruangan.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
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

  @Column({ type: 'int', nullable: true })
  lantai: number;

  @ManyToOne(() => Gedung, (gedung) => gedung.ruangan)
  gedung: Gedung;

  @OneToMany(() => Unit, (unit) => unit.ruangan)
  unit: Unit[];
}
