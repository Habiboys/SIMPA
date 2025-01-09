import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Maintenance } from './maintenance.entity';
import { VariablePembersihan } from './variable-pembersihan.entity';

@Entity('hasil_pembersihanan')
export class HasilPembersihan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_maintenance: number;

  @Column({ nullable: true })
  id_variable_pembersihan: number;

  @Column({ type: 'decimal', nullable: true })
  sebelum: number;

  @Column({ type: 'decimal', nullable: true })
  sesudah: number;

  @ManyToOne(() => Maintenance, maintenance => maintenance.hasilPembersihan)
  @JoinColumn({ name: 'id_maintenance' }) 
  maintenance: Maintenance;

  @ManyToOne(() => VariablePembersihan, variablePembersihan => variablePembersihan.hasilPembersihan)
  @JoinColumn({ name: 'id_variable_pembersihan' }) 
  variablePembersihan: VariablePembersihan;
}