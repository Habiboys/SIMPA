import { Test, TestingModule } from '@nestjs/testing';
import { AcService } from './ac.service';

describe('AcService', () => {
  let service: AcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcService],
    }).compile();

    service = module.get<AcService>(AcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
