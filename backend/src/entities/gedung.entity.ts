import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Proyek } from './proyek.entity';
import { Ruangan } from './ruangan.entity';

@Entity('gedung')
export class Gedung {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_proyek: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama: string;

  @ManyToOne(() => Proyek, (proyek) => proyek.gedung)
  proyek: Proyek;

  @OneToMany(() => Ruangan, (ruangan) => ruangan.gedung)
  ruangan: Ruangan[];
}
