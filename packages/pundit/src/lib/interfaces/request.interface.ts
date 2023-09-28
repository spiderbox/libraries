import { AnyObject } from './common.interface';
import { PunditRequestCache } from './pundit-request-cache.interface';

export interface AuthorizableRequest<User = AnyObject, Subject = AnyObject> {
  user?: User;
  currentUser?: User;
  pundit: PunditRequestCache<User, Subject>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ContextWithAuthorizableRequest<User = AnyObject, Subject = AnyObject> {
  req: AuthorizableRequest<User, Subject>;
}
