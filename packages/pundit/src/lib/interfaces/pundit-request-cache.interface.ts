import { AnyObject } from './common.interface';
import { SubjectBeforeFilterHook, UserBeforeFilterHook } from './hooks.interface';

export interface PunditRequestCache<User = AnyObject, Subject = AnyObject> {
  user?: User;
  subject?: Subject;
  hooks: {
    user: UserBeforeFilterHook<User>;
    subject: SubjectBeforeFilterHook<Subject>;
  };
}
