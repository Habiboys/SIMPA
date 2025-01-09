import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Maintenance } from './maintenance.entity';
import { VariablePemeriksaan } from './variable-pemeriksaan.entity';

@Entity('hasil_pemeriksaaan')
export class HasilPemeriksaan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_maintenance: number;

  @Column({ nullable: true })
  id_variable_pemeriksaan: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nilai: string;

  @ManyToOne(() => Maintenance, maintenance => maintenance.hasilPemeriksaan)
  @JoinColumn({ name: 'id_maintenance' }) 
  maintenance: Maintenance;

  @ManyToOne(() => VariablePemeriksaan, variablePemeriksaan => variablePemeriksaan.hasilPemeriksaan)
  @JoinColumn({ name: 'id_variable_pemeriksaan' }) 
  variablePemeriksaan: VariablePemeriksaan;
}