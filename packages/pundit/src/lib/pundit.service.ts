import { Injectable } from '@nestjs/common';
import { AnyClass, AnyObject } from './interfaces/common.interface';
import { AuthorizableRequest } from './interfaces/request.interface';
import { PunditMetadata } from './interfaces/pundit-metadata.interface';
import { PunditConfig } from './pundit.config';
import { UserProxy } from './proxies/user.proxy';
import { SubjectProxy } from './proxies/subject.proxy';

@Injectable()
export class PunditService {
  public authorize(user: AnyObject, policyClass: AnyClass, action: string, subject: AnyObject | AnyClass): boolean {
    const policy = new policyClass(user, subject);
    return !!policy[action]?.();
  }

  public async authorizeByRequest<PolicyClass = AnyObject, Subject = AnyObject>(
    request: AuthorizableRequest,
    action: string,
    punditMetadata?: PunditMetadata<PolicyClass, Subject>
  ): Promise<boolean> {
    const { getUserFromRequest } = PunditConfig.getRootOptions();

    const userProxy = new UserProxy(request, getUserFromRequest);
    const subjectProxy = new SubjectProxy(request);

    const user = await userProxy.get();
    const subject = (await subjectProxy.get()) || punditMetadata?.subject;
    const policyClass = punditMetadata?.policyClass;

    // No user or subject or policyClass - no access
    if (!user || !subject || !policyClass) {
      return false;
    }

    return this.authorize(user, policyClass, action, subject);
  }
}
