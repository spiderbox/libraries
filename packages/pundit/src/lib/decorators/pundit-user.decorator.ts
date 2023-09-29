import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { ContextProxy } from '../proxies/context.proxy';
import { UserProxy } from '../proxies/user.proxy';
import { PunditConfig } from '../pundit.config';

export const PunditUser = createParamDecorator(async (data: unknown, context: ExecutionContext) => {
  return new UserProxy(
    await ContextProxy.create(context).getRequest(),
    PunditConfig.getRootOptions().getUserFromRequest
  );
});
