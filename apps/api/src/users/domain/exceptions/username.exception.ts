/**
 * @class InvalidUsernameException
 * @description
 * 表示无效的用户名异常。当用户名不符合格式要求时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 用户名包含非法字符
 * 2. 用户名长度不符合要求
 * 3. 用户名格式不符合规范
 */
export class InvalidUsernameException extends Error {
  constructor(message: string = 'Invalid username format') {
    super(message);
    this.name = 'InvalidUsernameException';
  }
}

/**
 * @class UsernameRequiredException
 * @description
 * 表示必需的用户名缺失异常。当需要用户名但未提供时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 创建用户时未提供用户名
 * 2. 更新用户信息时用户名为空
 */
export class UsernameRequiredException extends Error {
  constructor() {
    super('Username is required');
    this.name = 'UsernameRequiredException';
  }
}

/**
 * @class UsernameTooShortException
 * @description
 * 表示用户名长度过短的异常。
 * 
 * 主要用于以下场景：
 * 1. 用户名长度小于最小长度要求
 */
export class UsernameTooShortException extends Error {
  constructor(minLength: number) {
    super(`Username must be at least ${minLength} characters long`);
    this.name = 'UsernameTooShortException';
  }
}

/**
 * @class UsernameTooLongException
 * @description
 * 表示用户名长度过长的异常。
 * 
 * 主要用于以下场景：
 * 1. 用户名长度超过最大长度限制
 */
export class UsernameTooLongException extends Error {
  constructor(maxLength: number) {
    super(`Username cannot exceed ${maxLength} characters`);
    this.name = 'UsernameTooLongException';
  }
}

/**
 * @class UsernameContainsInvalidCharactersException
 * @description
 * 表示用户名包含非法字符的异常。
 * 
 * 主要用于以下场景：
 * 1. 用户名包含特殊字符
 * 2. 用户名包含空格
 * 3. 用户名包含非ASCII字符
 */
export class UsernameContainsInvalidCharactersException extends Error {
  constructor() {
    super('Username contains invalid characters. Only letters, numbers, dots, hyphens and underscores are allowed');
    this.name = 'UsernameContainsInvalidCharactersException';
  }
}

/**
 * @class UsernameReservedException
 * @description
 * 表示用户名是系统保留词的异常。
 * 
 * 主要用于以下场景：
 * 1. 用户名是系统保留的关键字
 * 2. 用户名是特殊用途的标识符
 */
export class UsernameReservedException extends Error {
  constructor(username: string) {
    super(`Username '${username}' is reserved and cannot be used`);
    this.name = 'UsernameReservedException';
  }
}
