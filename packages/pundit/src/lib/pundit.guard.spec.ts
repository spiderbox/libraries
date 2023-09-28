import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { PunditGuard } from './pundit.guard';
import { PunditService } from './pundit.service';
import { PunditConfig } from './pundit.config';

describe('PunditGuard', () => {
  const req = new Object();
  let punditMetadata: unknown = {};
  let punditGuard: PunditGuard;
  let punditService: PunditService;

  beforeEach(async () => {
    PunditConfig.getRootOptions = jest.fn().mockImplementation(() => ({}));

    const moduleRef = await Test.createTestingModule({
      providers: [
        PunditGuard,
        { provide: Reflector, useValue: { get: jest.fn().mockImplementation(() => punditMetadata) } },
        { provide: PunditService, useValue: { authorizeByRequest: jest.fn() } },
      ],
    }).compile();

    punditService = moduleRef.get<PunditService>(PunditService);
    punditGuard = moduleRef.get<PunditGuard>(PunditGuard);
  });

  it('passes context request and ability to AccessService.canActivateAbility method', async () => {
    const context = new ExecutionContextHost([req, undefined, { req }]);
    jest.spyOn(context, 'getHandler').mockReturnValue(() => {});

    await punditGuard.canActivate(context);
    expect(punditService.authorizeByRequest).toBeCalledWith(req, '', punditMetadata);
  });

  it('passes context request and ability to AccessService.canActivateAbility method', async () => {
    punditMetadata = undefined;
    const context = new ExecutionContextHost([req, undefined, { req }]);
    jest.spyOn(context, 'getHandler').mockReturnValue(() => {});

    await punditGuard.canActivate(context);
    expect(punditService.authorizeByRequest).toBeCalledWith(req, '', punditMetadata);
  });
});
