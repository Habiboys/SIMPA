import { Test, TestingModule } from '@nestjs/testing';
import { ProyekService } from './proyek.service';

describe('ProyekService', () => {
  let service: ProyekService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProyekService],
    }).compile();

    service = module.get<ProyekService>(ProyekService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
