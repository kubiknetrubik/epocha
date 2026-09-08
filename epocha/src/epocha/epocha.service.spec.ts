import { Test, TestingModule } from '@nestjs/testing';
import { EpochaService } from './epocha.service';

describe('EpochaService', () => {
  let service: EpochaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EpochaService],
    }).compile();

    service = module.get<EpochaService>(EpochaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
