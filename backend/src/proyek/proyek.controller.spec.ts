import { Test, TestingModule } from '@nestjs/testing';
import { ProyekController } from './proyek.controller';

describe('ProyekController', () => {
  let controller: ProyekController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProyekController],
    }).compile();

    controller = module.get<ProyekController>(ProyekController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
