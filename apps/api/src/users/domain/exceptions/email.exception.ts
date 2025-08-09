/**
 * @class InvalidEmailException
 * @description
 * 表示无效的电子邮件地址异常。当尝试创建或修改一个不符合电子邮件格式规范的地址时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 创建Email值对象时的格式验证
 * 2. 更新用户邮箱时的格式验证
 * 
 * @extends Error
 */
export class InvalidEmailException extends Error {
  constructor(email: string) {
    super(`Invalid email address: ${email}`);
    this.name = 'InvalidEmailException';
  }
}

/**
 * @class EmailRequiredException
 * @description
 * 表示必需的电子邮件地址缺失异常。当需要电子邮件地址但未提供时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 创建用户时未提供邮箱
 * 2. 邮箱验证流程中缺少邮箱地址
 * 
 * @extends Error
 */
export class EmailRequiredException extends Error {
  constructor() {
    super('Email address is required');
    this.name = 'EmailRequiredException';
  }
}
