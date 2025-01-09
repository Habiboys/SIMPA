import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { Gedung } from './gedung.entity';

@Entity('proyek')
export class Proyek {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nama: string;

  @Column({ type: 'varchar', length: 255 })
  pelanggan: string;

  @Column({ type: 'date' })
  tanggal: Date;

  @Column({ type: 'varchar', length: 255 })
  lokasi: string;

  @OneToMany(() => Gedung, gedung => gedung.proyek)
  gedung: Gedung[];
}