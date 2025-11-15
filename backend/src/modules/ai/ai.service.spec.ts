import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const httpServiceMock = {
      post: jest.fn().mockReturnValue(of({ data: { detections: [] } })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: HttpService,
          useValue: httpServiceMock,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
