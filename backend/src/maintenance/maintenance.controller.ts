// maintenance.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  NotFoundException, 
  Get, 
  Param,
  ParseIntPipe,
  Res,
  Query
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';

import { Maintenance } from '../entities/maintenance.entity';
import { HasilPemeriksaan } from '../entities/hasil-pemeriksaan.entity';
import { HasilPembersihan } from '../entities/hasil-pembersihan.entity';
import { Foto } from '../entities/foto.entity';
import { Unit } from '../entities/unit.entity';
import { CreateMaintenanceDto } from './dto/maintenance.dto';

@Controller('maintenance')
export class MaintenanceController {
  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepo: Repository<Maintenance>,
    @InjectRepository(HasilPemeriksaan)
    private hasilPemeriksaanRepo: Repository<HasilPemeriksaan>,
    @InjectRepository(HasilPembersihan)
    private hasilPembersihanRepo: Repository<HasilPembersihan>,
    @InjectRepository(Foto)
    private fotoRepo: Repository<Foto>,
    @InjectRepository(Unit)
    private unitRepo: Repository<Unit>,
  ) {}

  @Post()
  async create(@Body() dto: CreateMaintenanceDto) {
    const queryRunner = this.maintenanceRepo.manager.connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the unit first
      const unit = await this.unitRepo.findOne({ where: { id: dto.id_unit } });
      if (!unit) {
        throw new NotFoundException(`Unit with ID ${dto.id_unit} not found`);
      }

      // Create maintenance record
      const maintenance = this.maintenanceRepo.create({
        id_unit: dto.id_unit,
        unit: unit,  
        tanggal: dto.tanggal,
        nama_pemeriksaan: dto.nama_pemeriksaan,
        kategori: dto.kategori,
      });
      
      const savedMaintenance = await queryRunner.manager.save(maintenance);

      // Create hasil pemeriksaan records
      const hasilPemeriksaanPromises = dto.hasil_pemeriksaan.map(hp => {
        const hasilPemeriksaan = this.hasilPemeriksaanRepo.create({
          id_maintenance: savedMaintenance.id,
          maintenance: savedMaintenance,
          id_variable_pemeriksaan: hp.id_variable_pemeriksaan,
          nilai: hp.nilai,
        });
        return queryRunner.manager.save(hasilPemeriksaan);
      });

      // Create hasil pembersihan records
      const hasilPembersihanPromises = dto.hasil_pembersihan.map(hp => {
        const hasilPembersihan = this.hasilPembersihanRepo.create({
          id_maintenance: savedMaintenance.id,
          maintenance: savedMaintenance,
          id_variable_pembersihan: hp.id_variable_pembersihan,
          sebelum: hp.sebelum,
          sesudah: hp.sesudah,
        });
        return queryRunner.manager.save(hasilPembersihan);
      });

      // Handle foto uploads
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fotoPromises = dto.foto.map(async (f) => {
        const buffer = Buffer.from(f.foto, 'base64');
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filepath = path.join(uploadDir, filename);
        
        await fs.promises.writeFile(filepath, buffer);

        const foto = this.fotoRepo.create({
          id_maintenance: savedMaintenance.id,
          maintenance: savedMaintenance,
          foto: filename,
          status: f.status,
        });
        return queryRunner.manager.save(foto);
      });

      await Promise.all([
        ...hasilPemeriksaanPromises,
        ...hasilPembersihanPromises,
        ...fotoPromises,
      ]);

      await queryRunner.commitTransaction();

      return {
        message: 'Maintenance data created successfully',
        maintenance_id: savedMaintenance.id,
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  @Get()
  async findAll() {
    return await this.maintenanceRepo.find({
      relations: [
        'unit',
        'unit.ruangan',
        'unit.ruangan.gedung',
        'hasilPemeriksaan',
        'hasilPemeriksaan.variablePemeriksaan',
        'hasilPembersihan',
        'hasilPembersihan.variablePembersihan',
        'foto'
      ],
      order: {
        tanggal: 'DESC'
      }
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const maintenance = await this.maintenanceRepo.findOne({
      where: { id },
      relations: [
        'unit',
        'unit.ruangan',
        'unit.ruangan.gedung',
        'hasilPemeriksaan',
        'hasilPemeriksaan.variablePemeriksaan',
        'hasilPembersihan',
        'hasilPembersihan.variablePembersihan',
        'foto'
      ]
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance with ID ${id} not found`);
    }

    return maintenance;
  }

  @Get('project/:projectId')
  async findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    // Buat base query condition
  const where: any = {
    unit: { 
      ruangan: { 
        gedung: { 
          id_proyek: projectId 
        } 
      } 
    }
  };

  // Tambahkan filter tanggal jika ada
  if (startDate && endDate) {
    where.tanggal = Between(new Date(startDate), new Date(endDate));
  }

    return await this.maintenanceRepo.find({
      where: {
        ...where,
        unit: { 
          ruangan: { 
            gedung: { 
              id_proyek: projectId 
            } 
          } 
        }
      },
      relations: [
        'unit',
        'unit.ruangan',
        'unit.ruangan.gedung',
        'unit.ruangan.gedung.proyek',
        'hasilPemeriksaan',
        'hasilPemeriksaan.variablePemeriksaan',
        'unit.detailModel',
        'unit.detailModel.jenisModel',
        'unit.detailModel.jenisModel.merek',
        'hasilPembersihan',
        'hasilPembersihan.variablePembersihan',
        'foto'
      ],
      order: {
        tanggal: 'DESC'
      }
    });
  }

  @Get('export/project/:projectId')
  async exportProjectData(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const maintenances = await this.findByProject(projectId, startDate, endDate);
    
    const workbook = new ExcelJS.Workbook();
  
    // Create main sheet
    const mainSheet = workbook.addWorksheet('Maintenance Report');
    
    // Styling for headers
    const headerStyle = {
      font: { bold: true, size: 12 },
      fill: {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FFD3D3D3' }
      },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const }
    };
  
    // Add title
    mainSheet.mergeCells('A1:K1');
    const titleCell = mainSheet.getCell('A1');
    titleCell.value = 'Maintenance Report';
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' as const };
  
    // Add date range if provided
    if (startDate && endDate) {
      mainSheet.mergeCells('A2:K2');
      const dateCell = mainSheet.getCell('A2');
      dateCell.value = `Period: ${startDate} to ${endDate}`;
      dateCell.alignment = { horizontal: 'center' as const };
    }
  
    // Add headers for main sheet
    const headers = [
      'No',
      'Tanggal',
      'Gedung',
      'Ruangan',
      'Merek',
      'Model',
      'Detail Model',
      'Seri Unit',
      'Nama Pemeriksaan',
      'Kategori'
    ];
    
    const headerRow = mainSheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });
  
    // Add data rows with expanded information and null checks
    maintenances.forEach((maintenance, index) => {
      const merekNama = maintenance.unit?.detailModel?.jenisModel?.merek?.nama || 'N/A';
      const modelNama = maintenance.unit?.detailModel?.jenisModel?.nama_model || 'N/A';
      const detailModelNama = maintenance.unit?.detailModel?.nama_model || 'N/A';
      const kategoriUnit = maintenance.unit?.detailModel?.kategori || 'N/A';
      
      mainSheet.addRow([
        index + 1,
        new Date(maintenance.tanggal).toLocaleDateString('id-ID'),
        maintenance.unit?.ruangan?.gedung?.nama || 'N/A',
        maintenance.unit?.ruangan?.nama || 'N/A',
        merekNama,
        modelNama,
        detailModelNama,
        maintenance.unit?.nomor_seri || 'N/A',
        maintenance.nama_pemeriksaan || 'N/A',
        kategoriUnit
      ]);
    });
  
    // Auto-fit columns
    mainSheet.columns.forEach(column => {
      column.width = 15;
    });
  
    // Group maintenances by building
    const maintenancesByBuilding = maintenances.reduce((acc, maintenance) => {
      const gedungId = maintenance.unit?.ruangan?.gedung?.id;
      if (!gedungId) return acc;
      
      if (!acc[gedungId]) {
        acc[gedungId] = {
          nama: maintenance.unit?.ruangan?.gedung?.nama,
          maintenances: []
        };
      }
      acc[gedungId].maintenances.push(maintenance);
      return acc;
    }, {});
  
    // Create detail sheets for each building
    for (const gedungId in maintenancesByBuilding) {
      const building = maintenancesByBuilding[gedungId];
      const detailSheet = workbook.addWorksheet(`Detail - ${building.nama}`);
      
      // Set column widths for detail sheet
      detailSheet.columns = [
        { width: 5 },   // No
        { width: 30 },  // Jenis Pemeriksaan/Pembersihan
        { width: 15 },  // Nilai/Sebelum
        { width: 15 },  // Sesudah (untuk pembersihan)
      ];
  
      let currentRow = 1;
  
      // Process each maintenance in the building
      building.maintenances.forEach((maintenance) => {
        // Add maintenance header
        detailSheet.mergeCells(`A${currentRow}:E${currentRow}`);
        detailSheet.getCell(`A${currentRow}`).value = 'Detail Pemeriksaan';
        detailSheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
        currentRow++;
  
        // Add unit information header
        const unitInfo = [
          `Tanggal: ${new Date(maintenance.tanggal).toLocaleDateString('id-ID')}`,
          `Ruangan: ${maintenance.unit?.ruangan?.nama || 'N/A'}`,
          `Model: ${maintenance.unit?.detailModel?.nama_model || 'N/A'} - ${maintenance.unit?.nomor_seri || 'N/A'}`,
          `Kategori: ${maintenance.unit?.detailModel?.kategori || 'N/A'}`
        ].join(' | ');
  
        detailSheet.mergeCells(`A${currentRow}:E${currentRow}`);
        detailSheet.getCell(`A${currentRow}`).value = unitInfo;
        currentRow += 2;
  
        // Inspection Results Section
        if (maintenance.hasilPemeriksaan?.length) {
          detailSheet.mergeCells(`A${currentRow}:E${currentRow}`);
          detailSheet.getCell(`A${currentRow}`).value = 'Hasil Pemeriksaan';
          detailSheet.getCell(`A${currentRow}`).font = { bold: true };
          currentRow++;
  
          // Add headers for inspection
          const inspectionHeaders = ['No', 'Jenis Pemeriksaan', 'Nilai'];
          const headerRow = detailSheet.addRow(inspectionHeaders);
          headerRow.eachCell((cell) => { cell.style = headerStyle; });
          currentRow++;
  
          // Add inspection results
          maintenance.hasilPemeriksaan.forEach((hp, idx) => {
            detailSheet.addRow([
              idx + 1,
              hp.variablePemeriksaan?.nama_variable || 'N/A',
              hp.nilai || 'N/A'
            ]);
            currentRow++;
          });
          currentRow++;
        }
  
        // Cleaning Results Section
        if (maintenance.hasilPembersihan?.length) {
          detailSheet.mergeCells(`A${currentRow}:E${currentRow}`);
          detailSheet.getCell(`A${currentRow}`).value = 'Hasil Pembersihan';
          detailSheet.getCell(`A${currentRow}`).font = { bold: true };
          currentRow++;
  
          // Add headers for cleaning
          const cleaningHeaders = ['No', 'Jenis Pembersihan', 'Sebelum', 'Sesudah'];
          const headerRow = detailSheet.addRow(cleaningHeaders);
          headerRow.eachCell((cell) => { cell.style = headerStyle; });
          currentRow++;
  
          // Add cleaning results
          maintenance.hasilPembersihan.forEach((hp, idx) => {
            detailSheet.addRow([
              idx + 1,
              hp.variablePembersihan?.nama_variable || 'N/A',
              hp.sebelum?.toString() || 'N/A',
              hp.sesudah?.toString() || 'N/A'
            ]);
            currentRow++;
          });
          currentRow++;
        }
  
        // Photos Section (Separate table)
        if (maintenance.foto?.length) {
          detailSheet.mergeCells(`A${currentRow}:C${currentRow}`);
          detailSheet.getCell(`A${currentRow}`).value = 'Dokumentasi Foto';
          detailSheet.getCell(`A${currentRow}`).font = { bold: true };
          currentRow++;
  
          // Add headers for photos
          const photoHeaders = ['No', 'Foto Sebelum', 'Foto Sesudah'];
          const headerRow = detailSheet.addRow(photoHeaders);
          headerRow.eachCell((cell) => { cell.style = headerStyle; });
          currentRow++;
  
          // Adjust column widths specifically for photos
          detailSheet.getColumn(1).width = 5;  // No
          detailSheet.getColumn(2).width = 40; // Foto Sebelum
          detailSheet.getColumn(3).width = 40; // Foto Sesudah
  
          // Group photos by before/after
          const sebelumFotos = maintenance.foto.filter(f => f?.status === 'sebelum');
          const sesudahFotos = maintenance.foto.filter(f => f?.status === 'sesudah');
          const maxFotos = Math.max(sebelumFotos.length, sesudahFotos.length);
  
          for (let i = 0; i < maxFotos; i++) {
            detailSheet.addRow([i + 1, '', '']);
            
            try {
              if (sebelumFotos[i]?.foto) {
                const imagePath = path.join(process.cwd(), 'uploads', sebelumFotos[i].foto);
                if (fs.existsSync(imagePath)) {
                  const imageId = workbook.addImage({
                    filename: imagePath,
                    extension: 'jpeg',
                  });
                  detailSheet.addImage(imageId, {
                    tl: { 
                      col: 1, 
                      row: currentRow - 1,
                      colWidth: 1,
                      rowHeight: 1,
                      worksheet: detailSheet
                    },
                    ext: { width: 150, height: 100 }
                  });
                }
              }
  
              if (sesudahFotos[i]?.foto) {
                const imagePath = path.join(process.cwd(), 'uploads', sesudahFotos[i].foto);
                if (fs.existsSync(imagePath)) {
                  const imageId = workbook.addImage({
                    filename: imagePath,
                    extension: 'jpeg',
                  });
                  detailSheet.addImage(imageId, {
                    tl: { 
                      col: 2,
                      row: currentRow - 1,
                      colWidth: 1,
                      rowHeight: 1,
                      worksheet: detailSheet
                    },
                    ext: { width: 150, height: 100 }
                  });
                }
              }
            } catch (error) {
              console.error(`Error adding images for maintenance ${maintenance.id}:`, error);
            }
  
            currentRow += 8; // Space for images
          }
        }
  
        currentRow += 2; // Add space between maintenance records
      });
    }
  
    // Set response headers
    const proyek = maintenances[0]?.unit?.ruangan?.gedung?.proyek;
    const projectName = proyek?.nama || 'unknown';
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=maintenance-report-${projectName}-${startDate}-to-${endDate}.xlsx`
    );
  
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('foto/:filename')
  async getFoto(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = path.join(process.cwd(), 'uploads', filename);
    
    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Image not found');
    }

    const file = fs.createReadStream(filepath);
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `inline; filename="${filename}"`
    });
    file.pipe(res);
  }
}