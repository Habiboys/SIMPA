// maintenance.controller.ts
import {
  Controller,
  Post,
  Body,
  NotFoundException,
  BadRequestException,
  Get,
  Param,
  ParseIntPipe,
  Res,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import { MaintenanceKategori } from '../entities/maintenance.entity';
import { Maintenance } from '../entities/maintenance.entity';
import { HasilPemeriksaan } from '../entities/hasil-pemeriksaan.entity';
import { HasilPembersihan } from '../entities/hasil-pembersihan.entity';
import { Foto } from '../entities/foto.entity';
import { Unit } from '../entities/unit.entity';
import { CreateMaintenanceDto } from './dto/maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; // Import the RolesGuard
import { Roles } from '../auth/decorators/role.decorator'; // Import the Roles decorator
import { Role } from '../enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('maintenance')
export class MaintenanceController {
  private readonly logger = new Logger(MaintenanceController.name);
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

  @Roles(Role.LAPANGAN)
  @Post()
  async create(@Body() dto: CreateMaintenanceDto) {
    console.log('Endpoint /maintenance POST diakses'); 
    this.logger.log('Endpoint /maintenance POST diakses');
    this.logger.debug('Payload yang diterima:', dto);
    const queryRunner =
      this.maintenanceRepo.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the unit first
      const unit = await this.unitRepo.findOne({ where: { id: dto.id_unit } });
      if (!unit) {
        throw new NotFoundException(`Unit with ID ${dto.id_unit} not found`);
      }

      // Validate indoor/outdoor category
      if (dto.kategori === MaintenanceKategori.INDOOR && dto.palet_outdoor) {
        throw new BadRequestException(
          'Palet outdoor should not be uploaded for an indoor category',
        );
      }

      if (dto.kategori === MaintenanceKategori.OUTDOOR && dto.palet_indoor) {
        throw new BadRequestException(
          'Palet indoor should not be uploaded for an outdoor category',
        );
      }

      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Handle palet_indoor
     // Modify palet handling
let paletIndoorFilename = null;
if (dto.palet_indoor) {
  const bufferIndoor = Buffer.from(dto.palet_indoor, 'base64');
  paletIndoorFilename = `${Date.now()}-indoor-${Math.random().toString(36).substring(7)}.jpg`;
  const filepathIndoor = path.join(uploadDir, paletIndoorFilename);
  await fs.promises.writeFile(filepathIndoor, bufferIndoor);
}

// Similar changes for palet_outdoor

      // Handle palet_outdoor
      let paletOutdoorFilename = null;
      if (dto.palet_outdoor) {
        const bufferOutdoor = Buffer.from(dto.palet_outdoor, 'base64');
        paletOutdoorFilename = `${Date.now()}-outdoor-${Math.random().toString(36).substring(7)}.jpg`;
        const filepathOutdoor = path.join(uploadDir, paletOutdoorFilename);
        await fs.promises.writeFile(filepathOutdoor, bufferOutdoor);
      }

      // Create maintenance record
      const maintenance = this.maintenanceRepo.create({
        id_unit: dto.id_unit,
        unit: unit,
        tanggal: dto.tanggal,
        nama_pemeriksaan: dto.nama_pemeriksaan,
        palet_indoor: paletIndoorFilename, // Simpan nama file
        palet_outdoor: paletOutdoorFilename, // Simpan nama file
        kategori: dto.kategori,
      });

      const savedMaintenance = await queryRunner.manager.save(maintenance);

      // Create hasil pemeriksaan and pembersihan records
      const hasilPemeriksaanPromises = dto.hasil_pemeriksaan.map((hp) => {
        const hasilPemeriksaan = this.hasilPemeriksaanRepo.create({
          id_maintenance: savedMaintenance.id,
          maintenance: savedMaintenance,
          id_variable_pemeriksaan: hp.id_variable_pemeriksaan,
          nilai: hp.nilai,
        });
        return queryRunner.manager.save(hasilPemeriksaan);
      });

      const hasilPembersihanPromises = dto.hasil_pembersihan.map((hp) => {
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
      // Di dalam create method
      const fotoPromises = dto.foto.map(async (f) => {
        if (!f.nama) {
          throw new BadRequestException('Nama foto harus diisi');
        }

        const buffer = Buffer.from(f.foto, 'base64');
        const filename = `${Date.now()}-${f.nama}.jpg`; // Gunakan nama foto
        const filepath = path.join(uploadDir, filename);

        await fs.promises.writeFile(filepath, buffer);

        const foto = this.fotoRepo.create({
          id_maintenance: savedMaintenance.id,
          maintenance: savedMaintenance,
          foto: filename,
          status: f.status,
          nama: f.nama, // Simpan nama foto
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

  @Roles(Role.ADMIN, Role.LAPANGAN)
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
        'foto',
      ],
      order: {
        tanggal: 'DESC',
      },
    });
  }

  @Roles(Role.ADMIN)
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
        'foto',
      ],
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance with ID ${id} not found`);
    }

    return maintenance;
  }

  @Roles(Role.ADMIN)
  @Get('project/:projectId')
  async findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Buat base query condition
    const where: any = {
      unit: {
        ruangan: {
          gedung: {
            id_proyek: projectId,
          },
        },
      },
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
              id_proyek: projectId,
            },
          },
        },
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
        'foto',
      ],
      order: {
        tanggal: 'DESC',
      },
    });
  }

  @Roles(Role.ADMIN)
  @Get('export/project/:projectId')
  async exportProjectData(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const maintenances = await this.findByProject(
      projectId,
      startDate,
      endDate,
    );

    const workbook = new ExcelJS.Workbook();

    // Create main sheet
    const mainSheet = workbook.addWorksheet('Maintenance Report');

    // Styling for headers
    const headerStyle = {
      font: { bold: true, size: 12 },
      fill: {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FFD3D3D3' },
      },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
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
      'Kategori',
    ];

    const headerRow = mainSheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Add data rows with expanded information and null checks
    maintenances.forEach((maintenance, index) => {
      const merekNama =
        maintenance.unit?.detailModel?.jenisModel?.merek?.nama || 'N/A';
      const modelNama =
        maintenance.unit?.detailModel?.jenisModel?.nama_model || 'N/A';
      const detailModelNama =
        maintenance.unit?.detailModel?.nama_model || 'N/A';
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
        kategoriUnit,
      ]);
    });

    // Auto-fit columns
    mainSheet.columns.forEach((column) => {
      column.width = 15;
    });

    // Group maintenances by building
    const maintenancesByBuilding = maintenances.reduce((acc, maintenance) => {
      const gedungId = maintenance.unit?.ruangan?.gedung?.id;
      if (!gedungId) return acc;

      if (!acc[gedungId]) {
        acc[gedungId] = {
          nama: maintenance.unit?.ruangan?.gedung?.nama,
          maintenances: [],
        };
      }
      acc[gedungId].maintenances.push(maintenance);
      return acc;
    }, {});

    // Create detail sheets for each building
 // Create detail sheets for each building
for (const gedungId in maintenancesByBuilding) {
  const building = maintenancesByBuilding[gedungId];
  const detailSheet = workbook.addWorksheet(`Detail - ${building.nama}`);

  // Set uniform column widths for all tables
  detailSheet.columns = [
    { width: 5 },  // No
    { width: 30 }, // Jenis Pemeriksaan/Pembersihan/Foto Palet
    { width: 15 }, // Nilai/Sebelum/Foto Sebelum
    { width: 15 }, // Sesudah/Foto Sesudah
  ];

  let currentRow = 1;

  // Process each maintenance in the building
  building.maintenances.forEach((maintenance) => {
    const startRow = currentRow; // Start row of the entire detail section

    // Add a main header for the entire maintenance record
    detailSheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const mainHeaderCell = detailSheet.getCell(`A${currentRow}`);
    mainHeaderCell.value = 'Detail Pemeriksaan';
    mainHeaderCell.font = { bold: true, size: 14 };
    mainHeaderCell.alignment = { horizontal: 'center' };
    currentRow++;

    // Add unit information header
    const unitInfo = [
      `Tanggal: ${new Date(maintenance.tanggal).toLocaleDateString('id-ID')}`,
      `Ruangan: ${maintenance.unit?.ruangan?.nama || 'N/A'}`,
      `Model: ${maintenance.unit?.detailModel?.nama_model || 'N/A'} - ${maintenance.unit?.nomor_seri || 'N/A'}`,
      `Kategori: ${maintenance.unit?.detailModel?.kategori || 'N/A'}`,
    ].join(' | ');
    detailSheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const unitInfoCell = detailSheet.getCell(`A${currentRow}`);
    unitInfoCell.value = unitInfo;
    unitInfoCell.alignment = { horizontal: 'center' };
    currentRow += 2;

    // Inspection Results Section
    if (maintenance.hasilPemeriksaan?.length) {
      detailSheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const inspectionHeaderCell = detailSheet.getCell(`A${currentRow}`);
      inspectionHeaderCell.value = 'Hasil Pemeriksaan';
      inspectionHeaderCell.font = { bold: true };
      inspectionHeaderCell.alignment = { horizontal: 'center' };
      currentRow++;

      // Add headers for inspection
      const inspectionHeaders = ['No', 'Jenis Pemeriksaan', 'Nilai', '']; // Empty column to reach D
      const headerRow = detailSheet.addRow(inspectionHeaders);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
        cell.alignment = { horizontal: 'center' };
      });
      currentRow++;

      // Add inspection results
      maintenance.hasilPemeriksaan.forEach((hp, idx) => {
        const row = detailSheet.addRow([
          idx + 1,
          hp.variablePemeriksaan?.nama_variable || 'N/A',
          hp.nilai || 'N/A',
          '', // Empty column to reach D
        ]);
        row.eachCell((cell) => {
          cell.alignment = { horizontal: 'left' };
        });
        currentRow++;
      });
      currentRow++;
    }

    // Cleaning Results Section
    if (maintenance.hasilPembersihan?.length) {
      detailSheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const cleaningHeaderCell = detailSheet.getCell(`A${currentRow}`);
      cleaningHeaderCell.value = 'Hasil Pembersihan';
      cleaningHeaderCell.font = { bold: true };
      cleaningHeaderCell.alignment = { horizontal: 'center' };
      currentRow++;

      // Add headers for cleaning
      const cleaningHeaders = ['No', 'Jenis Pembersihan', 'Sebelum', 'Sesudah'];
      const headerRow = detailSheet.addRow(cleaningHeaders);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
        cell.alignment = { horizontal: 'center' };
      });
      currentRow++;

      // Add cleaning results
      maintenance.hasilPembersihan.forEach((hp, idx) => {
        const row = detailSheet.addRow([
          idx + 1,
          hp.variablePembersihan?.nama_variable || 'N/A',
          hp.sebelum?.toString() || 'N/A',
          hp.sesudah?.toString() || 'N/A',
        ]);
        row.eachCell((cell) => {
          cell.alignment = { horizontal: 'left' };
        });
        currentRow++;
      });
      currentRow++;
    }

    // Palet Photos Section
    if (maintenance.palet_indoor || maintenance.palet_outdoor) {
      detailSheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const paletHeaderCell = detailSheet.getCell(`A${currentRow}`);
      paletHeaderCell.value = 'Foto Palet Unit';
      paletHeaderCell.font = { bold: true };
      paletHeaderCell.alignment = { horizontal: 'center' };
      currentRow++;

      // Add headers for pallet photos
      const palletPhotoHeaders = ['No', maintenance.kategori === MaintenanceKategori.INDOOR ? 'Foto Palet Indoor' : 'Foto Palet Outdoor', '', '']; // Empty columns to reach D
      const headerRow = detailSheet.addRow(palletPhotoHeaders);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
        cell.alignment = { horizontal: 'center' };
      });
      currentRow++;

      // Add row for pallet photos
      detailSheet.addRow([1, '', '', '']); // Empty columns to reach D
      currentRow++;

      try {
        // Add Indoor Pallet Photo (only for indoor units)
        if (maintenance.kategori === MaintenanceKategori.INDOOR && maintenance.palet_indoor) {
          const imagePathIndoor = path.join(process.cwd(), 'uploads', maintenance.palet_indoor);
          if (fs.existsSync(imagePathIndoor)) {
            const imageIdIndoor = workbook.addImage({
              filename: imagePathIndoor,
              extension: 'jpeg',
            });
            detailSheet.addImage(imageIdIndoor, {
              tl: { col: 1, row: currentRow - 1 },
              ext: { width: 150, height: 100 },
            });
          }
        }

        // Add Outdoor Pallet Photo (only for outdoor units)
        if (maintenance.kategori === MaintenanceKategori.OUTDOOR && maintenance.palet_outdoor) {
          const imagePathOutdoor = path.join(process.cwd(), 'uploads', maintenance.palet_outdoor);
          if (fs.existsSync(imagePathOutdoor)) {
            const imageIdOutdoor = workbook.addImage({
              filename: imagePathOutdoor,
              extension: 'jpeg',
            });
            detailSheet.addImage(imageIdOutdoor, {
              tl: { col: 1, row: currentRow - 1 },
              ext: { width: 150, height: 100 },
            });
          }
        }
      } catch (error) {
        console.error(`Error adding pallet images for maintenance ${maintenance.id}:`, error);
      }
      currentRow += 4; // Space for images
      currentRow++; // Additional space after pallet photos section
    }

    // Photos Section (Separate table)
    if (maintenance.foto?.length) {
      detailSheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const photosHeaderCell = detailSheet.getCell(`A${currentRow}`);
      photosHeaderCell.value = 'Dokumentasi Foto';
      photosHeaderCell.font = { bold: true };
      photosHeaderCell.alignment = { horizontal: 'center' };
      currentRow++;

      // Add headers for photos
      const photoHeaders = ['No', 'Foto Sebelum', 'Foto Sesudah', '']; // Empty column to reach D
      const headerRow = detailSheet.addRow(photoHeaders);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
        cell.alignment = { horizontal: 'center' };
      });
      currentRow++;

      // Group photos by before/after
      const sebelumFotos = maintenance.foto.filter((f) => f?.status === 'sebelum');
      const sesudahFotos = maintenance.foto.filter((f) => f?.status === 'sesudah');
      const maxFotos = Math.max(sebelumFotos.length, sesudahFotos.length);

      for (let i = 0; i < maxFotos; i++) {
        // Add row for photo names
        detailSheet.addRow([i + 1, '', '', '']); // Empty column to reach D
        currentRow++;

        // Add photo names
        if (sebelumFotos[i]?.nama || sesudahFotos[i]?.nama) {
          detailSheet.addRow([
            '', // Empty for No column
            sebelumFotos[i]?.nama || '', // Nama foto sebelum
            sesudahFotos[i]?.nama || '', // Nama foto sesudah
            '', // Empty column to reach D
          ]);
          currentRow++;
        }

        try {
          // Add Sebelum Foto
          if (sebelumFotos[i]?.foto) {
            const imagePath = path.join(process.cwd(), 'uploads', sebelumFotos[i].foto);
            if (fs.existsSync(imagePath)) {
              const imageId = workbook.addImage({
                filename: imagePath,
                extension: 'jpeg',
              });
              detailSheet.addImage(imageId, {
                tl: { col: 1, row: currentRow - 3 },
                ext: { width: 150, height: 100 },
              });
            }
          }

          // Add Sesudah Foto
          if (sesudahFotos[i]?.foto) {
            const imagePath = path.join(process.cwd(), 'uploads', sesudahFotos[i].foto);
            if (fs.existsSync(imagePath)) {
              const imageId = workbook.addImage({
                filename: imagePath,
                extension: 'jpeg',
              });
              detailSheet.addImage(imageId, {
                tl: { col: 2, row: currentRow - 3 },
                ext: { width: 150, height: 100 },
              });
            }
          }
        } catch (error) {
          console.error(`Error adding images for maintenance ${maintenance.id}:`, error);
        }
        currentRow += 4; // Space for images
      }
    }

    // Add borders around the entire detail section
    const endRow = currentRow - 1; // End row of the entire detail section
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 1; col <= 4; col++) {
        const cell = detailSheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }

    currentRow += 4; // Add space between maintenance records
  });
}

    // Set response headers
    const proyek = maintenances[0]?.unit?.ruangan?.gedung?.proyek;
    const projectName = proyek?.nama || 'unknown';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=maintenance-report-${projectName}-${startDate}-to-${endDate}.xlsx`,
    );

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  }

  @Roles(Role.ADMIN)
  @Get('foto/:filename')
  async getFoto(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = path.join(process.cwd(), 'uploads', filename);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Image not found');
    }

    const file = fs.createReadStream(filepath);
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `inline; filename="${filename}"`,
    });
    file.pipe(res);
  }
  @Roles(Role.ADMIN)
@Get('project/:projectId/total-maintenance')
async getTotalMaintenanceByProject(
  @Param('projectId', ParseIntPipe) projectId: number,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  // Buat base query condition
  const where: any = {
    unit: {
      ruangan: {
        gedung: {
          id_proyek: projectId,
        },
      },
    },
  };

  // Tambahkan filter tanggal jika ada
  if (startDate && endDate) {
    where.tanggal = Between(new Date(startDate), new Date(endDate));
  }

  const totalMaintenance = await this.maintenanceRepo.count({
    where,
    relations: [
      'unit',
      'unit.ruangan',
      'unit.ruangan.gedung',
    ],
  });

  return { totalMaintenance };
}
}
