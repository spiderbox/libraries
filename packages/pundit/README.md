# Nest Pundit

Minimal authorization for NestJS "heavily inspired by" [pundit](https://github.com/varvet/pundit) and [nest-casl](https://github.com/getjerry/nest-casl).

[![NPM version](https://img.shields.io/npm/v/%40spiderbox%2Fnest-pundit)](https://www.npmjs.com/package/@spiderbox/nest-pundit)
[![CI](https://github.com/spiderbox/libraries/actions/workflows/build.yml/badge.svg)](https://github.com/spiderbox/libraries/actions/workflows/build.yml)

## Installation

Install npm package with `yarn add @spiderbox/nest-pundit` or `npm i  @spiderbox/nest-pundit`

Peer dependencies are `@nestjs/core`, `@nestjs/common` and `@nestjs/graphql`

## Application configuration

Configure application:

```typescript
// app.module.ts

import { Module } from '@nestjs/common';
import { PunditModule } from '@spiderbox/nest-pundit';
import { Roles } from './app.roles';

@Module({
  imports: [
    PunditModule.forRoot({
      // Function to get pundit user from request
      // Optional, defaults to `(request) => request.user`
      getUserFromRequest: (request) => request.currentUser,
    }),
  ],
})
export class AppModule {}
```

## Policies

Nest Pundit is focused around the notion of policy classes. This is an example that allows creating and updating a post if the user is a Creator, and if the post is created by themselves:

```typescript
// post.policy.ts

export class PostPolicy {
  user;
  subject;

  constructor(user, subject) {
    this.user = user;
    this.subject = subject;
  }

  create() {
    return this.user.isCreator;
  }

  update() {
    return this.user.id == this.subject.userId;
  }
}
```

Nest Pundit makes the following assumptions about this class:

- The first argument is a user. Nest Pundit will call the
  `request.user` or what you configure in Module import `getUserFromRequest` method to retrieve what to send into this argument.
- The second argument is a subject, it could be a class or instance of a class.
- The class implements some kind of query method, in this case `create` and `update`. Usually, this will map to the name of a particular controller handler.

You'll probably want to create your own base class to inherit from:

```typescript
export class ApplicationPolicy {
  protected user;
  protected subject;

  constructor(user, subject) {
    this.user = user;
    this.subject = subject;
  }
}
```

```typescript
export class PostPolicy extends ApplicationPolicy {
  create() {
    return this.user.isCreator;
  }

  update() {
    return this.user.id == this.subject.userId;
  }
}
```

## Check Authorization

Assuming authentication handled by AuthGuard. PunditGuard expects user to at least exist, if not authenticated user obtained from request access will be denied.

```typescript
// post.resolver.ts

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PunditGuard, UsePundit, Actions } from '@spiderbox/nest-pundit';

import { CreatePostInput } from './dtos/create-post-input.dto';
import { UpdatePostInput } from './dtos/update-post-input.dto';
import { PostService } from './post.service';
import { PostHook } from './post.hook';
import { Post } from './dtos/post.dto';
import { PostPolicy } from './post.policy';

@Resolver(() => Post)
export class PostResolver {
  constructor(private postService: PostService) {}

  // No access restrictions, no request.user
  @Query(() => [Post])
  posts() {
    return this.postService.findAll();
  }

  // No access restrictions, request.user populated
  @Query(() => Post)
  @UseGuards(AuthGuard)
  async post(@Args('id') id: string) {
    return this.postService.findById(id);
  }

  // Tags method with ability action and subject and adds PunditGuard implicitly
  @UseGuards(AuthGuard, PunditGuard)
  @UsePundit(PostPolicy, Post)
  async createPost(@Args('input') input: CreatePostInput) {
    return this.postService.create(input);
  }

  // Use hook to get subject which is an instance of Post
  @Mutation(() => Post)
  @UseGuards(AuthGuard, PunditGuard)
  @UsePundit(PostPolicy, Post, PostHook)
  async updatePost(@Args('input') input: UpdatePostInput) {
    return this.postService.update(input);
  }
}
```

### @UsePundit Decorator

- First arg: The policy class you want to use.
- Second arg: The class of the subject.
- Third arg: optional subject hook, see below.

### Subject hook

For permissions with conditions we need to provide subject hook in UsePundit decorator. It can be class implementing `SubjectBeforeFilterHook` interface

```typescript
// post.hook.ts
import { Injectable } from '@nestjs/common';
import { Request, SubjectBeforeFilterHook } from '@spiderbox/nest-pundit';

import { PostService } from './post.service';
import { Post } from './dtos/post.dto';

@Injectable()
export class PostHook implements SubjectBeforeFilterHook<Post, Request> {
  constructor(readonly postService: PostService) {}

  async run({ params }: Request) {
    return this.postService.findById(params.input.id);
  }
}
```

passed as third argument of UsePundit

```typescript
@Mutation(() => Post)
@UseGuards(AuthGuard, PunditGuard)
@UsePundit(PostPolicy, Post, PostHook)
async updatePost(@Args('input') input: UpdatePostInput) {
  return this.postService.update(input);
}
```

Class hooks are preferred method, it has full dependency injection support and can be reused. Alternatively inline 'tuple hook' may be used, it can inject single service and may be useful for prototyping or single usage use cases.

```typescript
@Mutation(() => Post)
@UseGuards(AuthGuard, PunditGuard)
@UsePundit<Post>(PostPolicy, Post, [
  PostService,
  (service: PostService, { params }) => service.findById(params.input.id),
])
async updatePost(@Args('input') input: UpdatePostInput) {
  return this.postService.update(input);
}
```

### PunditSubject decorator

`PunditSubject` decorator provides access to lazy loaded subject, obtained from [subject hook](#subject-hook) and cached on request object.

```typescript
@Mutation(() => Post)
@UseGuards(AuthGuard, PunditGuard)
@UsePundit(PostPolicy, Post, PostHook)
async updatePost(
  @Args('input') input: UpdatePostInput,
  @PunditSubject() subjectProxy: SubjectProxy<Post>
) {
  const post = await subjectProxy.get();
}
```

### @PunditUser decorator

`PunditUser` decorator provides access to lazy loaded user, obtained from request or [user hook](#user-hook) and cached on request object.

```typescript
@Mutation(() => Post)
@UseGuards(AuthGuard, PunditGuard)
@UsePundit(PostPolicy, Post)
async updatePostConditionParamNoHook(
  @Args('input') input: UpdatePostInput,
  @PunditUser() userProxy: UserProxy<User>
) {
  const user = await userProxy.get();
}
```

### Pundit service (global)

Use PunditService to check permissions without PunditGuard and UsePundit decorator

```typescript
// ...
import { PunditService, PunditUser } from '@spiderbox/nest-pundit';

@Resolver(() => Post)
export class PostResolver {
  constructor(private postService: PostService, private punditService: PunditService) {}

  @Mutation(() => Post)
  @UseGuards(AuthGuard)
  async updatePost(@Args('input') input: UpdatePostInput, @PunditUser() userProxy: UserProxy<User>) {
    const user = await userProxy.get();
    const post = await this.postService.findById(input.id);

    this.punditService.authorize(user, PostPolicy, 'updatePost', post);
  }
}
```

## Advanced usage

### User Hook

Sometimes policy conditions require more info on user than exists on `request.user` User hook called after `getUserFromRequest` only for abilities with conditions. Similar to subject hook, it can be class or tuple.
Despite UserHook is configured on application level, it is executed in context of modules under authorization. To avoid importing user service to each module, consider making user module global.

```typescript
// user.hook.ts

import { Injectable } from '@nestjs/common';

import { UserBeforeFilterHook } from '@spiderbox/nest-pundit';
import { UserService } from './user.service';
import { User } from './dtos/user.dto';

@Injectable()
export class UserHook implements UserBeforeFilterHook<User> {
  constructor(readonly userService: UserService) {}

  async run(user: User) {
    return {
      ...user,
      ...(await this.userService.findById(user.id)),
    };
  }
}
```

```typescript
//app.module.ts

import { Module } from '@nestjs/common';
import { PunditModule } from '@spiderbox/nest-pundit';

@Module({
  imports: [
    PunditModule.forRoot({
      getUserFromRequest: (request) => request.user,
      getUserHook: UserHook,
    }),
  ],
})
export class AppModule {}
```

or with dynamic module initialization

```typescript
//app.module.ts

import { Module } from '@nestjs/common';
import { PunditModule } from '@spiderbox/nest-pundit';

@Module({
  imports: [
    PunditModule.forRootAsync({
      useFactory: async (service: SomeCoolService) => {
        const isOk = await service.doSomething();

        return {
          getUserFromRequest: () => {
            if (isOk) {
              return request.user;
            }
          },
        };
      },
      inject: [SomeCoolService],
    }),
  ],
})
export class AppModule {}
```

or with tuple hook

```typescript
//app.module.ts

import { Module } from '@nestjs/common';
import { PunditModule } from '@spiderbox/nest-pundit';

@Module({
  imports: [
    PunditModule.forRoot({
      getUserFromRequest: (request) => request.user,
      getUserHook: [
        UserService,
        async (service: UserService, user) => {
          return service.findById(user.id);
        },
      ],
    }),
  ],
})
export class AppModule {}
```

## Contribute

### Building

Run `nx build pundit` to build the library.

### Running unit tests

Run `nx test pundit` to execute the unit tests via [Jest](https://jestjs.io).
