import { Test } from '@nestjs/testing';
import { PunditService } from './pundit.service';

describe('PunditService', () => {
  let service: PunditService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PunditService],
    }).compile();

    service = module.get(PunditService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
