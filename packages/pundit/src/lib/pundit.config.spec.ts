import { OptionsForRoot } from './interfaces/options.interface';
import { NullUserHook } from './factories/user-hook.factory';
import { NullSubjectHook } from './factories/subject-hook.factory';
import { PunditConfig } from './pundit.config';
import { PUNDIT_ROOT_OPTIONS } from './pundit.constants';

describe('PunditConfig', () => {
  const user = { id: '', roles: [] };
  let rootOptions: OptionsForRoot = { getUserFromRequest: () => user };

  beforeEach(async () => {
    Reflect.getMetadata = jest.fn().mockImplementation(() => rootOptions);
  });

  it('should get root options from PunditConfig metadata', async () => {
    expect(PunditConfig.getRootOptions()).toEqual(rootOptions);
    expect(Reflect.getMetadata).toBeCalledWith(PUNDIT_ROOT_OPTIONS, PunditConfig);
  });

  it('should work with undefined metadata', async () => {
    Reflect.getMetadata = jest.fn().mockImplementation(() => undefined);
    expect(PunditConfig.getRootOptions()).toBeTruthy();
  });

  it('should add default getUserFromRequest function if not set', async () => {
    rootOptions = {};
    expect(
      PunditConfig.getRootOptions().getUserFromRequest({
        user,
        pundit: { hooks: { user: new NullUserHook(), subject: new NullSubjectHook() } },
      })
    ).toEqual(user);
  });
});
