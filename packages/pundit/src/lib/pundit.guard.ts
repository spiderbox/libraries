import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';

import { subjectHookFactory } from './factories/subject-hook.factory';
import { userHookFactory } from './factories/user-hook.factory';
import { RequestProxy } from './proxies/request.proxy';
import { ContextProxy } from './proxies/context.proxy';
import { PunditMetadata } from './interfaces/pundit-metadata.interface';
import { PUNDIT_METADATA } from './pundit.constants';
import { PunditConfig } from './pundit.config';
import { PunditService } from './pundit.service';

@Injectable()
export class PunditGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly punditService: PunditService,
    private moduleRef: ModuleRef
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const punditMetadata = this.reflector.get<PunditMetadata | undefined>(PUNDIT_METADATA, context.getHandler());
    const action = context.getHandler().name;
    const request = await ContextProxy.create(context).getRequest();
    const { getUserHook } = PunditConfig.getRootOptions();
    const req = new RequestProxy(request);

    req.setUserHook(await userHookFactory(this.moduleRef, getUserHook));
    req.setSubjectHook(await subjectHookFactory(this.moduleRef, punditMetadata?.subjectHook));

    return await this.punditService.authorizeByRequest(request, action, punditMetadata);
  }
}
