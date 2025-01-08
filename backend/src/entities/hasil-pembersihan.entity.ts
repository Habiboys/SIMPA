import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { HasilPemeriksaan } from './hasil-pemeriksaan.entity';

@Entity('hasil_pembersihanan')
export class HasilPembersihan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_pemeriksaan: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jenis: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sebelum: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sesudah: number;

  @Column({ type: 'date', nullable: true })
  tanggal: Date;

  @ManyToOne(
    () => HasilPemeriksaan,
    (hasilPemeriksaan) => hasilPemeriksaan.hasilPembersihan,
  )
  hasilPemeriksaan: HasilPemeriksaan;
}
