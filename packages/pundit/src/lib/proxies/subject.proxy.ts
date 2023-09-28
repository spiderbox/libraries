import { AnyObject } from '../interfaces/common.interface';
import { AuthorizableRequest } from '../interfaces/request.interface';
import { RequestProxy } from './request.proxy';

export class SubjectProxy<Subject = AnyObject> {
  constructor(private request: AuthorizableRequest<AnyObject, Subject>) {}

  public async get(): Promise<Subject | undefined> {
    const req = this.getRequest();

    if (req.getSubject()) {
      return req.getSubject();
    }

    const subjectFromHook = await req.getSubjectHook()?.run?.(this.request);
    if (!subjectFromHook) return;

    req.setSubject(subjectFromHook);
    return subjectFromHook;
  }

  private getRequest() {
    return new RequestProxy<AnyObject, Subject>(this.request);
  }
}
