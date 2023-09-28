import { SubjectBeforeFilterHook, SubjectBeforeFilterTuple } from '../interfaces/hooks.interface';
import { AuthorizableRequest } from '../interfaces/request.interface';
import { AnyClass, AnyObject } from './common.interface';

export interface PunditMetadata<PolicyClass = AnyObject, Subject = AnyObject, Request = AuthorizableRequest> {
  policyClass: AnyClass<PolicyClass>;
  subject: AnyClass<Subject>;
  subjectHook?: AnyClass<SubjectBeforeFilterHook<Subject, Request>> | SubjectBeforeFilterTuple<Subject, Request>;
}
