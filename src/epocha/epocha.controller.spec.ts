import { Test, TestingModule } from '@nestjs/testing';
import { EpochaController } from './epocha.controller';

describe('EpochaController', () => {
  let controller: EpochaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EpochaController],
    }).compile();

    controller = module.get<EpochaController>(EpochaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
