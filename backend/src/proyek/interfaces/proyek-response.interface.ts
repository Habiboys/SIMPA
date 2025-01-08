// src/proyek/interfaces/proyek-response.interface.ts
import { Gedung } from '../../entities/gedung.entity';
import { Maintenance } from '../../entities/maintenance.entity';

export interface ProyekResponse {
  id: number;
  nama: string;
  pelanggan: string;
  tanggal: Date;
  lokasi: string;
  gedung?: Gedung[];
  maintenance?: Maintenance[];
}
