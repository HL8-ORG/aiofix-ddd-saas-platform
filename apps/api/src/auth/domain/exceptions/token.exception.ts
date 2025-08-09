/**
 * @class TokenRequiredException
 * @description Token必需异常
 */
export class TokenRequiredException extends Error {
  constructor() {
    super('Token is required');
    this.name = 'TokenRequiredException';
  }
}

/**
 * @class InvalidTokenException
 * @description 无效Token异常
 */
export class InvalidTokenException extends Error {
  constructor(message: string = 'Invalid token format') {
    super(message);
    this.name = 'InvalidTokenException';
  }
}

/**
 * @class TokenExpiredException
 * @description Token过期异常
 */
export class TokenExpiredException extends Error {
  constructor() {
    super('Token has expired');
    this.name = 'TokenExpiredException';
  }
}

/**
 * @class TokenRevokedException
 * @description Token被撤销异常
 */
export class TokenRevokedException extends Error {
  constructor() {
    super('Token has been revoked');
    this.name = 'TokenRevokedException';
  }
}

/**
 * @class TokenMalformedException
 * @description Token格式错误异常
 */
export class TokenMalformedException extends Error {
  constructor(message: string = 'Token is malformed') {
    super(message);
    this.name = 'TokenMalformedException';
  }
}
