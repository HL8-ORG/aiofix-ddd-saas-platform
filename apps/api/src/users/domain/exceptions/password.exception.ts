/**
 * @class InvalidPasswordException
 * @description
 * 表示密码不符合安全要求的异常。当密码不满足最小长度、复杂度等安全要求时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 创建或更新密码时的格式验证
 * 2. 密码强度检查
 */
export class InvalidPasswordException extends Error {
  constructor(message: string = 'Password does not meet security requirements') {
    super(message);
    this.name = 'InvalidPasswordException';
  }
}

/**
 * @class PasswordRequiredException
 * @description
 * 表示必需的密码缺失异常。当需要密码但未提供时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 创建用户时未提供密码
 * 2. 密码重置流程中缺少新密码
 */
export class PasswordRequiredException extends Error {
  constructor() {
    super('Password is required');
    this.name = 'PasswordRequiredException';
  }
}

/**
 * @class PasswordTooWeakException
 * @description
 * 表示密码强度不足的异常。当密码不满足最低安全强度要求时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 密码不包含必要的字符类型（大小写字母、数字、特殊字符等）
 * 2. 密码在常见密码黑名单中
 */
export class PasswordTooWeakException extends Error {
  constructor(message: string = 'Password is too weak') {
    super(message);
    this.name = 'PasswordTooWeakException';
  }
}

/**
 * @class PasswordHashingException
 * @description
 * 表示密码哈希处理过程中发生错误的异常。
 * 
 * 主要用于以下场景：
 * 1. 密码哈希生成失败
 * 2. 密码哈希验证失败
 */
export class PasswordHashingException extends Error {
  constructor(message: string = 'Error occurred during password hashing') {
    super(message);
    this.name = 'PasswordHashingException';
  }
}
