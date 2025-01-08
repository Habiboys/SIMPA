import { Module } from '@nestjs/common';
import { AcController } from './ac.controller';
import { AcService } from './ac.service';

@Module({
  controllers: [AcController],
  providers: [AcService],
})
export class AcModule {}
