import { DynamicModule, Module } from '@nestjs/common';
import { PunditService } from './pundit.service';
import { AnyObject } from './interfaces/common.interface';
import { AuthorizableRequest } from './interfaces/request.interface';
import { OptionsForRoot, OptionsForRootAsync } from './interfaces/options.interface';
import { PUNDIT_ROOT_OPTIONS } from './pundit.constants';
import { PunditConfig } from './pundit.config';

@Module({
  controllers: [],
  providers: [PunditService],
  exports: [PunditService],
})
export class PunditModule {
  static forRoot<User = AnyObject, Request = AuthorizableRequest<User>>(
    options: OptionsForRoot<User, Request>
  ): DynamicModule {
    Reflect.defineMetadata(PUNDIT_ROOT_OPTIONS, options, PunditConfig);
    return {
      global: options.isGlobal,
      module: PunditModule,
    };
  }

  static forRootAsync<User = AnyObject, Request = AuthorizableRequest<User>>(
    options: OptionsForRootAsync<User, Request>
  ): DynamicModule {
    return {
      global: options.isGlobal,
      module: PunditModule,
      imports: options.imports || [],
      providers: [
        {
          provide: PUNDIT_ROOT_OPTIONS,
          useFactory: async (...args) => {
            const punditRootOptions = await options.useFactory(...args);
            Reflect.defineMetadata(PUNDIT_ROOT_OPTIONS, punditRootOptions, PunditConfig);

            return punditRootOptions;
          },
          inject: options.inject,
        },
      ],
    };
  }
}
