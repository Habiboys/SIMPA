// foto-pemeriksaan.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { HasilPemeriksaan } from './hasil-pemeriksaan.entity';

@Entity('foto_pemeriksaan')
export class FotoPemeriksaan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_pemeriksaan: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto_sesudah: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto_sebelum: string;

  @ManyToOne(
    () => HasilPemeriksaan,
    (hasilPemeriksaan) => hasilPemeriksaan.fotoPemeriksaan,
  )
  hasilPemeriksaan: HasilPemeriksaan;
}
