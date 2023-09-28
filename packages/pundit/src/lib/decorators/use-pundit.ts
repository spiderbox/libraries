import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { SubjectBeforeFilterHook, SubjectBeforeFilterTuple } from '../interfaces/hooks.interface';
import { AuthorizableRequest } from '../interfaces/request.interface';
import { AnyClass, AnyObject } from '../interfaces/common.interface';
import { PUNDIT_METADATA } from '../pundit.constants';

export function UsePundit<PolicyClass = AnyClass, Subject = AnyObject, Request = AuthorizableRequest>(
  policyClass: PolicyClass,
  subject: AnyClass<Subject>,
  subjectHook?: AnyClass<SubjectBeforeFilterHook<Subject, Request>> | SubjectBeforeFilterTuple<Subject, Request>
): CustomDecorator {
  return SetMetadata(PUNDIT_METADATA, { policyClass, subject, subjectHook });
}
