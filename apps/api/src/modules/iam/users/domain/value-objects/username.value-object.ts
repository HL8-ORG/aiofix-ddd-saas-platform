import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ValueObject } from '../../../../../shared/domain/value-objects/value-object.base'

/**
 * @class Username
 * @description
 * 用户名值对象，用于封装用户名的业务规则和验证逻辑。
 *
 * 主要原理与机制：
 * 1. 继承自ValueObject抽象类，实现值对象的基本功能（相等性比较、不可变性等）
 * 2. 使用class-validator装饰器进行声明式验证，与NestJS生态系统保持一致
 * 3. 通过@IsString、@MinLength、@MaxLength、@Matches等装饰器定义验证规则
 * 4. 构造函数中调用validate方法确保值对象的有效性
 * 5. 提供静态工厂方法isEmpty用于创建空用户名实例
 *
 * 验证规则：
 * - 必须是字符串类型
 * - 长度在3-50个字符之间
 * - 只能包含字母、数字、下划线、连字符
 * - 不能以数字开头
 * - 不能包含连续的特殊字符
 * - 不能以特殊字符结尾
 */
export class Username extends ValueObject<string> {
  static readonly MIN_LENGTH = 3
  static readonly MAX_LENGTH = 50

  constructor(value: string) {
    super()
    this._value = this.normalize(value)
    this.validate()
  }

  /**
   * @method normalize
   * @description 规范化用户名（转换为小写并去除首尾空格）
   * @param {string} value 原始用户名
   * @returns {string} 规范化后的用户名
   */
  private normalize(value: string): string {
    return value.toLowerCase().trim()
  }

  /**
   * @method validate
   * @description 验证用户名是否符合业务规则
   * @throws {Error} 当用户名不符合规则时抛出异常
   */
  private validate(): void {
    // 先执行自定义验证
    this.validateCustomRules()

    // 再执行class-validator验证
    const username = new UsernameValidator()
    username.value = this._value

    const errors = username.validateSync()
    if (errors && errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ')
      throw new Error(errorMessages)
    }
  }

  /**
   * @method validateCustomRules
   * @description 验证自定义业务规则
   * @throws {Error} 当用户名不符合自定义规则时抛出异常
   */
  private validateCustomRules(): void {
    // 验证连续特殊字符
    if (/[_-]{2,}/.test(this._value)) {
      throw new Error('用户名不能包含连续的特殊字符')
    }

    // 验证以特殊字符结尾
    if (/[_-]$/.test(this._value)) {
      throw new Error('用户名不能以特殊字符结尾')
    }
  }

  /**
   * @method getDisplayValue
   * @description 获取用户名的显示值
   * @returns {string} 格式化后的用户名
   */
  getDisplayValue(): string {
    return this._value
  }

  /**
   * @method isEmpty
   * @description 检查用户名是否为空
   * @returns {boolean} 如果为空返回true，否则返回false
   */
  isEmpty(): boolean {
    return !this._value || this._value.trim().length === 0
  }

  /**
   * @method equals
   * @description 比较两个用户名是否相等
   * @param {Username} other 另一个用户名值对象
   * @returns {boolean} 如果相等返回true，否则返回false
   */
  equals(other: Username): boolean {
    if (!other) return false
    return this._value === other._value
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return this._value
  }

  /**
   * @method toJSON
   * @description 序列化为JSON
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return this._value
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建Username值对象
   * @param {string} value 字符串值
   * @returns {Username} Username值对象
   */
  static fromString(value: string): Username {
    return new Username(value)
  }

  /**
   * @static
   * @method isValid
   * @description 静态方法，验证字符串是否为有效的用户名
   * @param {string} value 要验证的字符串
   * @returns {boolean} 如果有效返回true，否则返回false
   */
  static isValid(value: string): boolean {
    try {
      new Username(value)
      return true
    } catch {
      return false
    }
  }

  /**
   * @static
   * @method isEmpty
   * @description 静态方法，检查字符串是否为空用户名
   * @param {string} value 要检查的字符串
   * @returns {boolean} 如果为空返回true，否则返回false
   */
  static isEmpty(value: string): boolean {
    return !value || value.trim().length === 0
  }
}

/**
 * @class UsernameValidator
 * @description 用于class-validator验证的内部类
 */
class UsernameValidator {
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(Username.MIN_LENGTH, {
    message: `用户名长度不能少于${Username.MIN_LENGTH}个字符`,
  })
  @MaxLength(Username.MAX_LENGTH, {
    message: `用户名长度不能超过${Username.MAX_LENGTH}个字符`,
  })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9]$/, {
    message:
      '用户名格式无效：必须以字母开头，只能包含字母、数字、下划线、连字符，不能以特殊字符结尾',
  })
  value!: string

  validateSync(): any[] {
    const { validateSync } = require('class-validator')
    return validateSync(this)
  }
}
