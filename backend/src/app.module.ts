import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { User } from './entities/user.entity';
import { Proyek } from './entities/proyek.entity';
import { Gedung } from './entities/gedung.entity';
import { Ruangan } from './entities/ruangan.entity';
import { Unit } from './entities/unit.entity';
import { HasilPemeriksaan } from './entities/hasil-pemeriksaan.entity';
import { JenisModel } from './entities/jenis-model.entity';
import { HasilPembersihan } from './entities/hasil-pembersihan.entity';
import { Merek } from './entities/merek.entity';
import { DetailModel } from './entities/detail-model.entity';
import { Foto } from './entities/foto.entity';
import { Maintenance } from './entities/maintenance.entity';
import { VariablePemeriksaan } from './entities/variable-pemeriksaan.entity';
import { VariablePembersihan } from './entities/variable-pembersihan.entity';

import { ProyekModule } from './proyek/proyek.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AcModule } from './ac/ac.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User,
        Proyek,
        Gedung,
        Ruangan,
        Unit,
        HasilPemeriksaan,
        JenisModel,
        HasilPembersihan,
        Merek,
        DetailModel,
        Foto,
        Maintenance,
        VariablePembersihan,
        VariablePemeriksaan,
      ],
      synchronize: false, // set false di production
    }),
    AuthModule,
    ProyekModule,
    MaintenanceModule,
    AcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
