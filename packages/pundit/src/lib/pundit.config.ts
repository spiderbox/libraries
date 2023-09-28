import { OptionsForRoot } from './interfaces/options.interface';
import { PUNDIT_ROOT_OPTIONS } from './pundit.constants';

type DefaultedOptionsForRoot = OptionsForRoot & Required<Pick<OptionsForRoot, 'getUserFromRequest'>>;

export class PunditConfig {
  static getRootOptions(): DefaultedOptionsForRoot {
    const rootOptions = (Reflect.getMetadata(PUNDIT_ROOT_OPTIONS, PunditConfig) || {}) as DefaultedOptionsForRoot;
    if (!rootOptions.getUserFromRequest) {
      return {
        ...rootOptions,
        getUserFromRequest: (request) => request.user,
      };
    }
    return rootOptions;
  }
}
