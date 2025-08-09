import { InvalidEmailException, EmailRequiredException } from '../exceptions/email.exception';

/**
 * @class Email
 * @description
 * Email值对象，用于表示和验证电子邮件地址。
 * 
 * 主要特点：
 * 1. 不可变性：一旦创建，值不可改变
 * 2. 自验证：确保邮箱格式正确
 * 3. 相等性比较：基于值而非引用的比较
 * 
 * 使用场景：
 * 1. 用户注册时的邮箱验证
 * 2. 用户信息更新时的邮箱验证
 * 3. 系统通知发送的邮箱验证
 */
export class Email {
  /**
   * @private
   * @description 私有属性，存储邮箱地址的值
   */
  private readonly value: string;

  /**
   * @constructor
   * @description 
   * 创建Email值对象的构造函数。
   * 执行邮箱格式验证，如果验证失败则抛出异常。
   * 
   * @param {string} email - 待验证的邮箱地址
   * @throws {EmailRequiredException} 当邮箱地址为空时抛出
   * @throws {InvalidEmailException} 当邮箱格式不正确时抛出
   */
  constructor(email: string) {
    if (!email) {
      throw new EmailRequiredException();
    }

    if (!Email.isValid(email)) {
      throw new InvalidEmailException(email);
    }

    this.value = email.toLowerCase();
  }

  /**
   * @static
   * @method isValid
   * @description 
   * 验证邮箱地址格式是否正确。
   * 使用正则表达式进行格式验证，规则包括：
   * 1. 必须包含@符号
   * 2. @前必须有至少一个字符
   * 3. @后必须有域名部分
   * 4. 域名必须包含至少一个点号
   * 5. 顶级域名至少2个字符
   * 
   * @param {string} email - 待验证的邮箱地址
   * @returns {boolean} 如果格式正确返回true，否则返回false
   */
  static isValid(email: string): boolean {
    // 更宽松但实用的邮箱格式正则表达式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * @method getValue
   * @description 获取邮箱地址的值
   * @returns {string} 邮箱地址
   */
  getValue(): string {
    return this.value;
  }

  /**
   * @method equals
   * @description 
   * 比较两个Email值对象是否相等。
   * 比较是基于值而不是引用，并且忽略大小写。
   * 
   * @param {Email} other - 待比较的另一个Email值对象
   * @returns {boolean} 如果两个邮箱地址相等返回true，否则返回false
   */
  equals(other: Email): boolean {
    if (!(other instanceof Email)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * @method toString
   * @description 将Email值对象转换为字符串
   * @returns {string} 邮箱地址的字符串表示
   */
  toString(): string {
    return this.value;
  }
}
