import { IsString, IsEmail, MaxLength, IsNotEmpty } from 'class-validator';
import { ValueObject } from '../../../../../shared/domain/value-objects/value-object.base';

/**
 * @class Email
 * @description
 * 邮箱地址值对象，用于封装邮箱地址的业务规则和验证逻辑。
 * 
 * 主要原理与机制：
 * 1. 继承自ValueObject抽象类，实现值对象的基本功能（相等性比较、不可变性等）
 * 2. 使用class-validator装饰器进行声明式验证，与NestJS生态系统保持一致
 * 3. 通过@IsString、@IsEmail、@MaxLength等装饰器定义验证规则
 * 4. 构造函数中调用validate方法确保值对象的有效性
 * 5. 提供静态工厂方法isEmpty用于创建空邮箱实例
 * 
 * 验证规则：
 * - 必须是字符串类型
 * - 必须符合RFC 5322标准
 * - 最大长度254个字符
 * - 本地部分最大64个字符
 * - 域名部分最大253个字符
 * - 拒绝包含危险字符的邮箱地址
 */
export class Email extends ValueObject<string> {
  static readonly MAX_LENGTH = 254;
  static readonly MAX_LOCAL_PART_LENGTH = 64;
  static readonly MAX_DOMAIN_PART_LENGTH = 253;

  constructor(value: string) {
    super();
    this._value = this.normalize(value);
    this.validate();
  }

  /**
   * @method normalize
   * @description 规范化邮箱地址（转换为小写并去除首尾空格）
   * @param {string} value 原始邮箱地址
   * @returns {string} 规范化后的邮箱地址
   */
  private normalize(value: string): string {
    return value.toLowerCase().trim();
  }

  /**
   * @method validate
   * @description 验证邮箱地址是否符合业务规则
   * @throws {Error} 当邮箱地址不符合规则时抛出异常
   */
  private validate(): void {
    // 先执行自定义验证
    this.validateCustomRules();

    // 再执行class-validator验证
    const email = new EmailValidator();
    email.value = this._value;

    const errors = email.validateSync();
    if (errors && errors.length > 0) {
      const errorMessages = errors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new Error(errorMessages);
    }
  }

  /**
   * @method validateCustomRules
   * @description 验证自定义业务规则
   * @throws {Error} 当邮箱地址不符合自定义规则时抛出异常
   */
  private validateCustomRules(): void {
    // 验证总长度
    if (this._value.length > Email.MAX_LENGTH) {
      throw new Error(`邮箱地址长度不能超过${Email.MAX_LENGTH}个字符`);
    }

    // 验证危险字符
    if (/[{}|\\/:;,"<>[\]`']/.test(this._value)) {
      throw new Error('邮箱地址格式无效');
    }

    // 验证本地部分长度
    const localPart = this._value.split('@')[0];
    if (localPart.length > Email.MAX_LOCAL_PART_LENGTH) {
      throw new Error(`邮箱地址本地部分长度不能超过${Email.MAX_LOCAL_PART_LENGTH}个字符`);
    }

    // 验证域名部分长度
    const domainPart = this._value.split('@')[1];
    if (domainPart && domainPart.length > Email.MAX_DOMAIN_PART_LENGTH) {
      throw new Error(`邮箱地址域名部分长度不能超过${Email.MAX_DOMAIN_PART_LENGTH}个字符`);
    }
  }

  /**
   * @method getLocalPart
   * @description 获取邮箱地址的本地部分（@符号前的部分）
   * @returns {string} 本地部分
   */
  getLocalPart(): string {
    return this._value.split('@')[0];
  }

  /**
   * @method getDomainPart
   * @description 获取邮箱地址的域名部分（@符号后的部分）
   * @returns {string} 域名部分
   */
  getDomainPart(): string {
    return this._value.split('@')[1];
  }

  /**
   * @method getDisplayValue
   * @description 获取邮箱地址的显示值
   * @returns {string} 格式化后的邮箱地址
   */
  getDisplayValue(): string {
    return this._value;
  }

  /**
   * @method isEmpty
   * @description 检查邮箱地址是否为空
   * @returns {boolean} 如果为空返回true，否则返回false
   */
  isEmpty(): boolean {
    return !this._value || this._value.trim().length === 0;
  }

  /**
   * @method equals
   * @description 比较两个邮箱地址是否相等
   * @param {Email} other 另一个邮箱地址值对象
   * @returns {boolean} 如果相等返回true，否则返回false
   */
  equals(other: Email): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method toJSON
   * @description 序列化为JSON
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return this._value;
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建Email值对象
   * @param {string} value 字符串值
   * @returns {Email} Email值对象
   */
  static fromString(value: string): Email {
    return new Email(value);
  }

  /**
   * @static
   * @method isValid
   * @description 静态方法，验证字符串是否为有效的邮箱地址
   * @param {string} value 要验证的字符串
   * @returns {boolean} 如果有效返回true，否则返回false
   */
  static isValid(value: string): boolean {
    try {
      new Email(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @static
   * @method isEmpty
   * @description 静态方法，检查字符串是否为空邮箱地址
   * @param {string} value 要检查的字符串
   * @returns {boolean} 如果为空返回true，否则返回false
   */
  static isEmpty(value: string): boolean {
    return !value || value.trim().length === 0;
  }
}

/**
 * @class EmailValidator
 * @description 用于class-validator验证的内部类
 */
class EmailValidator {
  @IsString({ message: '邮箱地址必须是字符串' })
  @IsNotEmpty({ message: '邮箱地址不能为空' })
  @IsEmail({}, { message: '邮箱地址格式无效' })
  @MaxLength(Email.MAX_LENGTH, { message: `邮箱地址长度不能超过${Email.MAX_LENGTH}个字符` })
  value!: string;

  validateSync(): any[] {
    const { validateSync } = require('class-validator');
    return validateSync(this);
  }
} 