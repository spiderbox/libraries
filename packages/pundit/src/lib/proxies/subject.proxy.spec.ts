import { SubjectBeforeFilterHook } from '../interfaces/hooks.interface';
import { NullSubjectHook } from '../factories/subject-hook.factory';
import { NullUserHook } from '../factories/user-hook.factory';
import { SubjectProxy } from './subject.proxy';
import { PunditRequestCache } from '../interfaces/pundit-request-cache.interface';

const expectedSubject = { id: 'subjectId' };

class SubjectHook implements SubjectBeforeFilterHook {
  public async run() {
    return expectedSubject;
  }
}

describe('SubjectProxy', () => {
  const defaultPunditCache: PunditRequestCache = {
    hooks: {
      subject: new NullSubjectHook(),
      user: new NullUserHook(),
    },
  };

  describe('get()', () => {
    it('gets cached subject', async () => {
      const subjectProxy = new SubjectProxy({ pundit: { ...defaultPunditCache, subject: expectedSubject } });
      expect(await subjectProxy.get()).toEqual(expectedSubject);
    });

    it('if no cached subject return undefined', async () => {
      const subjectProxy = new SubjectProxy({ pundit: defaultPunditCache });
      expect(await subjectProxy.get()).toEqual(undefined);
    });

    it('gets subject from hook', async () => {
      defaultPunditCache.hooks.subject = new SubjectHook();
      const subjectProxy = new SubjectProxy({ pundit: defaultPunditCache });
      expect(await subjectProxy.get()).toEqual(expectedSubject);
    });
  });
});
