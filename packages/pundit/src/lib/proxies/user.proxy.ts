import { AnyObject } from '../interfaces/common.interface';
import { AuthorizableRequest } from '../interfaces/request.interface';
import { RequestProxy } from './request.proxy';

export class UserProxy<User = AnyObject> {
  constructor(
    private request: AuthorizableRequest<User>,
    private getUserFromRequest: (request: AuthorizableRequest<User>) => User | undefined
  ) {}

  public async get(): Promise<User | undefined> {
    return (await this.getFromHook()) || this.getFromRequest() || undefined;
  }

  public getFromRequest(): User | undefined {
    return this.getUserFromRequest(this.request);
  }

  public async getFromHook(): Promise<User | undefined> {
    const req = this.getRequest();
    const requestUser = this.getFromRequest();

    const cachedUser = req.getUser();
    if (cachedUser) {
      return cachedUser;
    }

    if (!requestUser) {
      return;
    }

    const userFromHook = await req.getUserHook()?.run?.(requestUser);
    if (!userFromHook) return;

    req.setUser(userFromHook);
    return userFromHook;
  }

  private getRequest() {
    return new RequestProxy(this.request);
  }
}
