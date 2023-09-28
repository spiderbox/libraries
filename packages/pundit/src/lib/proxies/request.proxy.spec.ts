import { NullUserHook } from '../factories/user-hook.factory';
import { NullSubjectHook } from '../factories/subject-hook.factory';
import { RequestProxy } from './request.proxy';
import { PunditRequestCache } from '../interfaces/pundit-request-cache.interface';

const defaultPunditCache: PunditRequestCache = {
  hooks: {
    subject: new NullSubjectHook(),
    user: new NullUserHook(),
  },
};

describe('RequestProxy', () => {
  let requestProxy: RequestProxy;

  beforeEach(() => {
    requestProxy = new RequestProxy({ pundit: defaultPunditCache });
  });

  it('getSubject returns cached subject', () => {
    const subject = { userId: 'userId' };
    requestProxy.setSubject(subject);
    expect(requestProxy.getSubject()).toEqual(subject);
  });
});
