/**
 * @class UserNotFoundException
 * @description 用户未找到异常
 */
export class UserNotFoundException extends Error {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
    this.name = 'UserNotFoundException';
  }
}

/**
 * @class DuplicateUserException
 * @description 重复用户异常
 */
export class DuplicateUserException extends Error {
  constructor(field: string, value: string) {
    super(`User with ${field} '${value}' already exists`);
    this.name = 'DuplicateUserException';
  }
}

/**
 * @class UserAlreadyActivatedException
 * @description 用户已激活异常
 */
export class UserAlreadyActivatedException extends Error {
  constructor() {
    super('User is already activated');
    this.name = 'UserAlreadyActivatedException';
  }
}

/**
 * @class UserNotActivatedException
 * @description 用户未激活异常
 */
export class UserNotActivatedException extends Error {
  constructor() {
    super('User is not activated');
    this.name = 'UserNotActivatedException';
  }
}

/**
 * @class UserLockedException
 * @description 用户被锁定异常
 */
export class UserLockedException extends Error {
  constructor(reason?: string) {
    const message = reason ? `User is locked: ${reason}` : 'User is locked';
    super(message);
    this.name = 'UserLockedException';
  }
}

/**
 * @class UserDeletedException
 * @description 用户已删除异常
 */
export class UserDeletedException extends Error {
  constructor() {
    super('User is deleted');
    this.name = 'UserDeletedException';
  }
}

/**
 * @class InvalidUserStatusTransitionException
 * @description 无效的用户状态转换异常
 */
export class InvalidUserStatusTransitionException extends Error {
  constructor(currentStatus: string, targetStatus: string) {
    super(`Cannot transition user status from '${currentStatus}' to '${targetStatus}'`);
    this.name = 'InvalidUserStatusTransitionException';
  }
}

/**
 * @class IncorrectPasswordException
 * @description 密码错误异常
 */
export class IncorrectPasswordException extends Error {
  constructor() {
    super('Incorrect password');
    this.name = 'IncorrectPasswordException';
  }
}

/**
 * @class UserRequiredFieldException
 * @description 用户必填字段异常
 */
export class UserRequiredFieldException extends Error {
  constructor(fieldName: string) {
    super(`Required field '${fieldName}' is missing`);
    this.name = 'UserRequiredFieldException';
  }
}

/**
 * @class TooManyLoginAttemptsException
 * @description 登录尝试次数过多异常
 */
export class TooManyLoginAttemptsException extends Error {
  constructor(maxAttempts: number) {
    super(`Too many login attempts. Maximum allowed: ${maxAttempts}`);
    this.name = 'TooManyLoginAttemptsException';
  }
}
