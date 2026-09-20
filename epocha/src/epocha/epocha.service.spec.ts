import { Test, TestingModule } from '@nestjs/testing';
import { ArchaismDictsService } from './epocha.service';

describe('EpochaService', () => {
  let service: ArchaismDictsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArchaismDictsService],
    }).compile();

    service = module.get<ArchaismDictsService>(ArchaismDictsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
