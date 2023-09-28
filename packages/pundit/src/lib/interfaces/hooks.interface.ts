import { AnyClass, AnyObject } from './common.interface';
import { AuthorizableRequest } from './request.interface';

export interface SubjectBeforeFilterHook<Subject = AnyObject, Request = AuthorizableRequest<AnyObject, Subject>> {
  run: (request: Request) => Promise<Subject | undefined>;
}

export type SubjectBeforeFilterTuple<Subject = AnyObject, Request = AuthorizableRequest> = [
  AnyClass,
  (service: InstanceType<AnyClass>, request: Request) => Promise<Subject>
];

export interface UserBeforeFilterHook<User = AnyObject, RequestUser = User> {
  run: (user: RequestUser) => Promise<User | undefined>;
}

export type UserBeforeFilterTuple<User = AnyObject, RequestUser = User> = [
  AnyClass,
  (service: InstanceType<AnyClass>, user: RequestUser) => Promise<User>
];
