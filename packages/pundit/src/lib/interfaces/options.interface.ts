import { FactoryProvider, ModuleMetadata } from '@nestjs/common';
import { AnyClass, AnyObject } from './common.interface';
import { AuthorizableRequest } from './request.interface';
import { UserBeforeFilterHook, UserBeforeFilterTuple } from './hooks.interface';

export interface OptionsForRoot<User = AnyObject, Request = AuthorizableRequest<User>> {
  isGlobal?: boolean;
  getUserFromRequest?: (request: Request) => User | undefined;
  getUserHook?: AnyClass<UserBeforeFilterHook<User>> | UserBeforeFilterTuple<User>;
}

export interface OptionsForRootAsync<User = AnyObject, Request = AuthorizableRequest<User>>
  extends Pick<ModuleMetadata, 'imports'> {
  isGlobal?: boolean;
  useFactory: FactoryProvider<Promise<OptionsForRoot<User, Request>> | OptionsForRoot<User, Request>>['useFactory'];
  inject?: FactoryProvider['inject'];
}
