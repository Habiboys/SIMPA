import { Test, TestingModule } from '@nestjs/testing';
import { AcController } from './ac.controller';

describe('AcController', () => {
  let controller: AcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcController],
    }).compile();

    controller = module.get<AcController>(AcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
