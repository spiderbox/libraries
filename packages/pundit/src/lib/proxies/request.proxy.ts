import { AuthorizableRequest } from '../interfaces/request.interface';
import { SubjectBeforeFilterHook, UserBeforeFilterHook } from '../interfaces/hooks.interface';
import { NullSubjectHook } from '../factories/subject-hook.factory';
import { NullUserHook } from '../factories/user-hook.factory';
import { AnyObject } from '../interfaces/common.interface';
import { PunditRequestCache } from '../interfaces/pundit-request-cache.interface';

export class RequestProxy<User = AnyObject, Subject = AnyObject> {
  private readonly defaultPunditCache: PunditRequestCache<User, Subject> = {
    hooks: {
      subject: new NullSubjectHook(),
      user: new NullUserHook(),
    },
  };

  constructor(private request: AuthorizableRequest<User, Subject>) {
    this.request.pundit = this.request.pundit || (this.defaultPunditCache as PunditRequestCache<User, Subject>);
  }

  public get cached(): PunditRequestCache<User, Subject> {
    return this.request.pundit as PunditRequestCache<User, Subject>;
  }

  public getSubject(): Subject | undefined {
    return this.cached.subject;
  }

  public setSubject(subject: Subject | undefined): void {
    this.cached.subject = subject;
  }

  public getUser(): User | undefined {
    return this.cached.user;
  }

  public setUser(user: User | undefined): void {
    this.cached.user = user;
  }

  public getUserHook(): UserBeforeFilterHook<User> {
    return this.cached.hooks.user;
  }

  public setUserHook(hook: UserBeforeFilterHook<User>): void {
    this.cached.hooks.user = hook;
  }

  public getSubjectHook(): SubjectBeforeFilterHook<Subject> {
    return this.cached.hooks.subject;
  }

  public setSubjectHook(hook: SubjectBeforeFilterHook<Subject>): void {
    this.cached.hooks.subject = hook;
  }
}
