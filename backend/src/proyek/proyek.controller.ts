import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProyekService } from './proyek.service';
import { CreateProyekDto } from './dto/create-proyek.dto';
import { UpdateProyekDto } from './dto/update-proyek.dto';
import { CreateGedungDto } from './dto/create-gedung.dto';
import { UpdateGedungDto } from './dto/update-gedung.dto';
import { CreateRuanganDto } from './dto/create-ruangan.dto';
import { UpdateRuanganDto } from './dto/update-ruangan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';  // Import the RolesGuard
import { Roles } from '../auth/decorators/role.decorator';  // Import the Roles decorator
import { Role } from '../enums/role.enum';  
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Proyek')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) 
@Controller('proyek')
export class ProyekController {
  constructor(private readonly proyekService: ProyekService) {}

  // PROYEK ENDPOINTS
  @Post()
  @ApiOperation({ summary: 'Membuat proyek baru' })
  @ApiResponse({
    status: 201,
    description: 'Proyek berhasil dibuat',
    type: CreateProyekDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createProyek(@Body() createProyekDto: CreateProyekDto) {
    return this.proyekService.createProyek(createProyekDto);
  }
  
  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua proyek' })
  @ApiResponse({
    status: 200,
    description: 'Daftar semua proyek',
    type: [CreateProyekDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllProyek() {
    return this.proyekService.findAllProyek();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail proyek berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID Proyek' })
  @ApiResponse({
    status: 200,
    description: 'Detail proyek ditemukan',
    type: CreateProyekDto,
  })
  @ApiResponse({ status: 404, description: 'Proyek tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOneProyek(@Param('id') id: string) {
    return this.proyekService.findOneProyek(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mengupdate proyek berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID Proyek' })
  @ApiResponse({
    status: 200,
    description: 'Proyek berhasil diupdate',
    type: UpdateProyekDto,
  })
  @ApiResponse({ status: 404, description: 'Proyek tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProyek(
    @Param('id') id: string,
    @Body() updateProyekDto: UpdateProyekDto,
  ) {
    return this.proyekService.updateProyek(+id, updateProyekDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus proyek berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID Proyek' })
  @ApiResponse({ status: 200, description: 'Proyek berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Proyek tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeProyek(@Param('id') id: string) {
    return this.proyekService.removeProyek(+id);
  }

  // GEDUNG ENDPOINTS
  @Post(':proyekId/gedung')
  @ApiOperation({ summary: 'Membuat gedung baru dalam proyek' })
  @ApiParam({ name: 'proyekId', description: 'ID Proyek' })
  @ApiResponse({
    status: 201,
    description: 'Gedung berhasil dibuat',
    type: CreateGedungDto,
  })
  @ApiResponse({ status: 404, description: 'Proyek tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createGedung(
    @Param('proyekId') proyekId: string,
    @Body() createGedungDto: CreateGedungDto,
  ) {
    return this.proyekService.createGedung(+proyekId, createGedungDto);
  }

  @Get(':proyekId/gedung')
  @ApiOperation({ summary: 'Mendapatkan semua gedung dalam proyek' })
  @ApiParam({ name: 'proyekId', description: 'ID Proyek' })
  @ApiResponse({
    status: 200,
    description: 'Daftar semua gedung',
    type: [CreateGedungDto],
  })
  @ApiResponse({ status: 404, description: 'Proyek tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllGedung(@Param('proyekId') proyekId: string) {
    return this.proyekService.findAllGedung(+proyekId);
  }

  @Get(':proyekId/gedung/:id')
  @ApiOperation({ summary: 'Mendapatkan detail gedung dalam proyek' })
  @ApiParam({ name: 'proyekId', description: 'ID Proyek' })
  @ApiParam({ name: 'id', description: 'ID Gedung' })
  @ApiResponse({
    status: 200,
    description: 'Detail gedung ditemukan',
    type: CreateGedungDto,
  })
  @ApiResponse({ status: 404, description: 'Gedung tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOneGedung(@Param('proyekId') proyekId: string, @Param('id') id: string) {
    return this.proyekService.findOneGedung(+proyekId, +id);
  }

  @Patch(':proyekId/gedung/:id')
  @ApiOperation({ summary: 'Mengupdate gedung dalam proyek' })
  @ApiParam({ name: 'proyekId', description: 'ID Proyek' })
  @ApiParam({ name: 'id', description: 'ID Gedung' })
  @ApiResponse({
    status: 200,
    description: 'Gedung berhasil diupdate',
    type: UpdateGedungDto,
  })
  @ApiResponse({ status: 404, description: 'Gedung tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateGedung(
    @Param('proyekId') proyekId: string,
    @Param('id') id: string,
    @Body() updateGedungDto: UpdateGedungDto,
  ) {
    return this.proyekService.updateGedung(+proyekId, +id, updateGedungDto);
  }

  @Delete(':proyekId/gedung/:id')
  @ApiOperation({ summary: 'Menghapus gedung dari proyek' })
  @ApiParam({ name: 'proyekId', description: 'ID Proyek' })
  @ApiParam({ name: 'id', description: 'ID Gedung' })
  @ApiResponse({ status: 200, description: 'Gedung berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Gedung tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeGedung(@Param('proyekId') proyekId: string, @Param('id') id: string) {
    return this.proyekService.removeGedung(+proyekId, +id);
  }

  // RUANGAN ENDPOINTS
  @Post(':proyekId/gedung/:gedungId/ruangan')
  @ApiOperation({ summary: 'Membuat ruangan baru dalam gedung' })
  @ApiParam({ name: 'proyekId', description: 'ID Proyek' })
  @ApiParam({ name: 'gedungId', description: 'ID Gedung' })
  @ApiResponse({
    status: 201,
    description: 'Ruangan berhasil dibuat',
    type: CreateRuanganDto,
  })
  @ApiResponse({ status: 404, description: 'Gedung tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createRuangan(
    @Param('proyekId') proyekId: string,
    @Param('gedungId') gedungId: string,
    @Body() createRuanganDto: CreateRuanganDto,
  ) {
    return this.proyekService.createRuangan(+gedungId, createRuanganDto);
  }

  @Get(':proyekId/gedung/:gedungId/ruangan')
  @ApiOperation({ summary: 'Mendapatkan semua ruangan dalam gedung' })
  @ApiParam({ name: 'proyekId', description: 'ID Proyek' })
  @ApiParam({ name: 'gedungId', description: 'ID Gedung' })
  async findAllRuangan(
    @Param('proyekId') proyekId: string,
    @Param('gedungId') gedungId: string,
  ) {
    const ruangan = await this.proyekService.findAllRuangan(+gedungId);
    return ruangan;
  }

  @Get(':proyekId/gedung/:gedungId/ruangan/:id')
  @ApiOperation({ summary: 'Mendapatkan detail ruangan dalam gedung' })
  @ApiParam({ name: 'proyekId', description: 'ID Proyek' })
  @ApiParam({ name: 'gedungId', description: 'ID Gedung' })
  @ApiParam({ name: 'id', description: 'ID Ruangan' })
  @ApiResponse({
    status: 200,
    description: 'Detail ruangan ditemukan',
    type: CreateRuanganDto,
  })
  @ApiResponse({ status: 404, description: 'Ruangan tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOneRuangan(
    @Param('proyekId') proyekId: string,
    @Param('gedungId') gedungId: string,
    @Param('id') id: string,
  ) {
    return this.proyekService.findOneRuangan(+gedungId, +id);
  }

  @Patch(':proyekId/gedung/:gedungId/ruangan/:id')
  @ApiOperation({ summary: 'Mengupdate ruangan dalam gedung' })
  @ApiParam({ name: 'proyekId', description: 'ID Proyek' })
  @ApiParam({ name: 'gedungId', description: 'ID Gedung' })
  @ApiParam({ name: 'id', description: 'ID Ruangan' })
  @ApiResponse({
    status: 200,
    description: 'Ruangan berhasil diupdate',
    type: UpdateRuanganDto,
  })
  @ApiResponse({ status: 404, description: 'Ruangan tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateRuangan(
    @Param('proyekId') proyekId: string,
    @Param('gedungId') gedungId: string,
    @Param('id') id: string,
    @Body() updateRuanganDto: UpdateRuanganDto,
  ) {
    return this.proyekService.updateRuangan(+gedungId, +id, updateRuanganDto);
  }

  @Delete(':proyekId/gedung/:gedungId/ruangan/:id')
  @ApiOperation({ summary: 'Menghapus ruangan dari gedung' })
  @ApiParam({ name: 'proyekId', description: 'ID Proyek' })
  @ApiParam({ name: 'gedungId', description: 'ID Gedung' })
  @ApiParam({ name: 'id', description: 'ID Ruangan' })
  @ApiResponse({ status: 200, description: 'Ruangan berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Ruangan tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeRuangan(
    @Param('proyekId') proyekId: string,
    @Param('gedungId') gedungId: string,
    @Param('id') id: string,
  ) {
    return this.proyekService.removeRuangan(+gedungId, +id);
  }
}
