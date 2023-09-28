import { Test } from '@nestjs/testing';
import { PunditService } from './pundit.service';
import { AuthorizableRequest } from './interfaces/request.interface';
import { PunditMetadata } from './interfaces/pundit-metadata.interface';
import { UserProxy } from './proxies/user.proxy';
import { AnyClass } from './interfaces/common.interface';

class TestClass {
  constructor() {}

  create() {
    return true;
  }
}

describe('PunditService', () => {
  let service: PunditService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PunditService],
    }).compile();

    service = module.get(PunditService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  describe('authorize', () => {
    // Policy class exists and returns true for action
    it('should return true when policy class exists and returns true for action', () => {
      // Arrange
      const user = {};
      const policyClass = jest.fn().mockImplementation(() => ({
        [action]: jest.fn().mockReturnValue(true),
      }));
      const action = 'read';
      const subject = {};

      const punditService = new PunditService();

      // Act
      const result = punditService.authorize(user, policyClass, action, subject);

      // Assert
      expect(result).toBe(true);
    });

    // Policy class exists and returns false for action
    it('should return false when policy class exists and returns false for action', () => {
      // Arrange
      const user = {};
      const policyClass = jest.fn().mockImplementation(() => ({
        [action]: jest.fn().mockReturnValue(false),
      }));
      const action = 'read';
      const subject = {};

      const punditService = new PunditService();

      // Act
      const result = punditService.authorize(user, policyClass, action, subject);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when policy class exists and there is no action defined', () => {
      // Arrange
      const user = {};
      const policyClass = jest.fn().mockImplementation(() => ({
        [`${action}1`]: jest.fn().mockReturnValue(false),
      }));
      const action = 'read';
      const subject = {};

      const punditService = new PunditService();

      // Act
      const result = punditService.authorize(user, policyClass, action, subject);

      // Assert
      expect(result).toBe(false);
    });

    // Policy class exists and throws an error
    it('should throw an error when policy class exists and throws an error', () => {
      // Arrange
      const user = {};
      const policyClass = jest.fn().mockImplementation(() => {
        throw new Error('Policy class error');
      });
      const action = 'read';
      const subject = {};

      const punditService = new PunditService();

      // Act & Assert
      expect(() => punditService.authorize(user, policyClass, action, subject)).toThrowError('Policy class error');
    });
  });

  describe('authorizeByRequest', () => {
    const hook = {
      run: async (): Promise<{}> => {
        return {};
      },
    };
    // Returns true when user, subject and policyClass are defined
    it('should return true when user, subject and policyClass are defined', async () => {
      // Arrange
      const request: AuthorizableRequest = {
        user: {
          id: 1,
          name: 'John Doe',
          role: 'admin',
        },
        pundit: {
          hooks: {
            subject: hook,
            user: hook,
          },
        },
      };
      const action = 'create';
      const punditMetadata: PunditMetadata<TestClass, TestClass> = {
        policyClass: TestClass,
        subject: TestClass,
      };
      const punditService = new PunditService();

      // Act
      const result = await punditService.authorizeByRequest(request, action, punditMetadata);

      // Assert
      expect(result).toBe(true);
    });

    // Returns false when user, subject or policyClass are undefined
    // it('should return false when user is undefined', async () => {
    //   // Arrange
    //   const request: AuthorizableRequest = {
    //     user: undefined,
    //     pundit: {
    //       hooks: {
    //         subject: new SubjectBeforeFilterHook(),
    //         user: new UserBeforeFilterHook(),
    //       },
    //     },
    //   };
    //   const action = 'create';
    //   const punditMetadata: PunditMetadata = {
    //     policyClass: PolicyClass,
    //     subject: SubjectClass,
    //     subjectHook: SubjectBeforeFilterHook,
    //   };
    //   const punditService = new PunditService();

    //   // Act
    //   const result = await punditService.authorizeByRequest(request, action, punditMetadata);

    //   // Assert
    //   expect(result).toBe(false);
    // });

    // // Returns false when user, subject or policyClass are undefined
    // it('should return false when subject is undefined', async () => {
    //   // Arrange
    //   const request: AuthorizableRequest = {
    //     user: {
    //       id: 1,
    //       name: 'John Doe',
    //       role: 'admin',
    //     },
    //     pundit: {
    //       hooks: {
    //         subject: new SubjectBeforeFilterHook(),
    //         user: new UserBeforeFilterHook(),
    //       },
    //     },
    //   };
    //   const action = 'create';
    //   const punditMetadata: PunditMetadata = {
    //     policyClass: PolicyClass,
    //     subject: SubjectClass,
    //     subjectHook: SubjectBeforeFilterHook,
    //   };
    //   const punditService = new PunditService();

    //   // Act
    //   const result = await punditService.authorizeByRequest(request, action, punditMetadata);

    //   // Assert
    //   expect(result).toBe(false);
    // });

    // // Returns false when user, subject or policyClass are undefined
    // it('should return false when policyClass is undefined', async () => {
    //   // Arrange
    //   const request: AuthorizableRequest = {
    //     user: {
    //       id: 1,
    //       name: 'John Doe',
    //       role: 'admin',
    //     },
    //     pundit: {
    //       hooks: {
    //         subject: new SubjectBeforeFilterHook(),
    //         user: new UserBeforeFilterHook(),
    //       },
    //     },
    //   };
    //   const action = 'create';
    //   const punditMetadata: PunditMetadata = {
    //     policyClass: undefined,
    //     subject: SubjectClass,
    //     subjectHook: SubjectBeforeFilterHook,
    //   };
    //   const punditService = new PunditService();

    //   // Act
    //   const result = await punditService.authorizeByRequest(request, action, punditMetadata);

    //   // Assert
    //   expect(result).toBe(false);
    // });

    // // Returns false when userProxy.get() returns undefined
    // it('should return false when userProxy.get() returns undefined', async () => {
    //   // Arrange
    //   const request: AuthorizableRequest = {
    //     user: {
    //       id: 1,
    //       name: 'John Doe',
    //       role: 'admin',
    //     },
    //     pundit: {
    //       hooks: {
    //         subject: new SubjectBeforeFilterHook(),
    //         user: new UserBeforeFilterHook(),
    //       },
    //     },
    //   };
    //   const action = 'create';
    //   const punditMetadata: PunditMetadata = {
    //     policyClass: PolicyClass,
    //     subject: SubjectClass,
    //     subjectHook: SubjectBeforeFilterHook,
    //   };
    //   const punditService = new PunditService();
    //   const userProxy = new UserProxy(request, () => undefined);

    //   // Act
    //   const result = await punditService.authorizeByRequest(request, action, punditMetadata);

    //   // Assert
    //   expect(result).toBe(false);
    // });

    // // Returns false when policy[action]() returns false
    // it('should return false when policy[action]() returns false', async () => {
    //   // Arrange
    //   const request: AuthorizableRequest = {
    //     user: {
    //       id: 1,
    //       name: 'John Doe',
    //       role: 'admin',
    //     },
    //     pundit: {
    //       hooks: {
    //         subject: new SubjectBeforeFilterHook(),
    //         user: new UserBeforeFilterHook(),
    //       },
    //     },
    //   };
    //   const action = 'create';
    //   const punditMetadata: PunditMetadata = {
    //     policyClass: PolicyClass,
    //     subject: SubjectClass,
    //     subjectHook: SubjectBeforeFilterHook,
    //   };
    //   const punditService = new PunditService();
    //   const policyClass = jest.fn().mockImplementation(() => ({
    //     [action]: jest.fn().mockReturnValue(false),
    //   }));

    //   // Act
    //   const result = await punditService.authorizeByRequest(request, action, punditMetadata);

    //   // Assert
    //   expect(result).toBe(false);
    // });
  });
});
