import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ValueObject } from '../../../../../shared/domain/value-objects/value-object.base'

/**
 * @class Phone
 * @description
 * 手机号码值对象，用于封装手机号码的业务规则和验证逻辑。
 *
 * 主要原理与机制：
 * 1. 继承自ValueObject抽象类，实现值对象的基本功能（相等性比较、不可变性等）
 * 2. 使用class-validator装饰器进行声明式验证，与NestJS生态系统保持一致
 * 3. 通过@IsString、@MinLength、@MaxLength、@Matches等装饰器定义验证规则
 * 4. 构造函数中调用validate方法确保值对象的有效性
 * 5. 提供静态工厂方法isEmpty用于创建空手机号实例
 *
 * 验证规则：
 * - 必须是字符串类型
 * - 长度在8-15个字符之间
 * - 支持中国大陆手机号（11位，以1开头）
 * - 支持国际手机号（8-15位，不以0开头）
 * - 自动规范化手机号格式
 */
export class Phone extends ValueObject<string> {
  static readonly MIN_LENGTH = 8
  static readonly MAX_LENGTH = 15

  // 中国大陆手机号前缀
  static readonly CHINESE_MOBILE_PREFIXES = [
    '130',
    '131',
    '132',
    '133',
    '134',
    '135',
    '136',
    '137',
    '138',
    '139',
    '145',
    '147',
    '149',
    '150',
    '151',
    '152',
    '153',
    '155',
    '156',
    '157',
    '158',
    '159',
    '166',
    '167',
    '170',
    '171',
    '172',
    '173',
    '175',
    '176',
    '177',
    '178',
    '180',
    '181',
    '182',
    '183',
    '184',
    '185',
    '186',
    '187',
    '188',
    '189',
    '199',
  ]

  /**
   * @constructor
   * @description 创建手机号码值对象
   * @param {string} value 手机号码字符串
   * @throws {Error} 当手机号码无效时抛出异常
   */
  constructor(value: string) {
    super()
    this.validateOriginalValue(value)
    this._value = this.normalize(value)
    this.validate()
  }

  /**
   * @method validateOriginalValue
   * @description 验证原始手机号码是否包含无效字符
   * @param {string} value 原始手机号码
   * @throws {Error} 当手机号码包含无效字符时抛出异常
   */
  private validateOriginalValue(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('手机号长度不能少于8位')
    }

    // 检查是否包含无效字符（只允许数字、+、-、空格）
    if (!/^[0-9+\-\s]+$/.test(value)) {
      throw new Error('手机号只能包含数字、加号、连字符和空格')
    }
  }

  /**
   * @method normalize
   * @description 规范化手机号码（去除空格、连字符等，保留纯数字）
   * @param {string} value 原始手机号码
   * @returns {string} 规范化后的手机号码
   */
  private normalize(value: string): string {
    if (!value) return ''

    // 移除所有非数字字符，但保留+号用于国际号码
    let normalized = value.replace(/[^\d+]/g, '')

    // 处理中国大陆手机号的各种前缀
    if (normalized.startsWith('+86')) {
      normalized = normalized.substring(3)
    } else if (normalized.startsWith('0086')) {
      normalized = normalized.substring(4)
    } else if (normalized.startsWith('86') && normalized.length > 2) {
      normalized = normalized.substring(2)
    }

    return normalized
  }

  /**
   * @method validate
   * @description 验证手机号码是否符合业务规则
   * @throws {Error} 当手机号码不符合规则时抛出异常
   */
  private validate(): void {
    // 先执行class-validator验证（长度和格式检查）
    const phone = new PhoneValidator()
    phone.value = this._value

    const errors = phone.validateSync()
    if (errors && errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ')
      throw new Error(errorMessages)
    }

    // 再执行自定义验证（中国手机号特殊规则）
    this.validateCustomRules()
  }

  /**
   * @method validateCustomRules
   * @description 验证自定义业务规则
   * @throws {Error} 当手机号码不符合自定义规则时抛出异常
   */
  private validateCustomRules(): void {
    // 验证中国大陆手机号格式（严格11位，以1开头）
    if (this._value.length === 11 && this._value.startsWith('1')) {
      const prefix = this._value.substring(0, 3)
      if (!Phone.CHINESE_MOBILE_PREFIXES.includes(prefix)) {
        throw new Error('手机号格式无效')
      }
    }
    // 验证国际手机号格式（8-15位，不以0开头）
    else if (this._value.length >= 8 && this._value.length <= 15) {
      if (this._value.startsWith('0')) {
        throw new Error('手机号格式无效')
      }
    }
    // 其他情况都是无效的
    else {
      throw new Error('手机号格式无效')
    }
  }

  /**
   * @method getDisplayValue
   * @description 获取手机号码的显示值（格式化显示）
   * @returns {string} 格式化后的手机号码
   */
  getDisplayValue(): string {
    if (!this._value) return ''

    if (this._value.length === 11 && this._value.startsWith('1')) {
      // 中国大陆手机号格式化
      return `+86 ${this._value.substring(0, 3)} ${this._value.substring(3, 7)} ${this._value.substring(7)}`
    } else {
      // 国际手机号格式化
      return `+${this._value}`
    }
  }

  /**
   * @method getCountryCode
   * @description 获取国家代码
   * @returns {string} 国家代码
   */
  getCountryCode(): string {
    if (this._value.length === 11 && this._value.startsWith('1')) {
      return '+86'
    }
    return '+'
  }

  /**
   * @method getNationalNumber
   * @description 获取国内号码（不带国家代码）
   * @returns {string} 国内号码
   */
  getNationalNumber(): string {
    return this._value
  }

  /**
   * @method isEmpty
   * @description 检查手机号码是否为空
   * @returns {boolean} 如果为空返回true，否则返回false
   */
  isEmpty(): boolean {
    return !this._value || this._value.length === 0
  }

  /**
   * @method equals
   * @description 比较两个手机号码是否相等
   * @param {Phone} other 另一个手机号码值对象
   * @returns {boolean} 如果相等返回true，否则返回false
   */
  equals(other: Phone): boolean {
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
   * @description 从字符串创建Phone值对象
   * @param {string} value 字符串值
   * @returns {Phone} Phone值对象
   */
  static fromString(value: string): Phone {
    return new Phone(value)
  }

  /**
   * @static
   * @method isValid
   * @description 静态方法，验证字符串是否为有效的手机号码
   * @param {string} value 要验证的字符串
   * @returns {boolean} 如果有效返回true，否则返回false
   */
  static isValid(value: string): boolean {
    try {
      new Phone(value)
      return true
    } catch {
      return false
    }
  }

  /**
   * @static
   * @method isEmpty
   * @description 静态方法，检查字符串是否为空手机号码
   * @param {string} value 要检查的字符串
   * @returns {boolean} 如果为空返回true，否则返回false
   */
  static isEmpty(value: string): boolean {
    return !value || value.trim().length === 0
  }
}

/**
 * @class PhoneValidator
 * @description 用于class-validator验证的内部类
 */
class PhoneValidator {
  @IsString({ message: '手机号必须是字符串' })
  @IsOptional()
  @MinLength(Phone.MIN_LENGTH, {
    message: `手机号长度不能少于${Phone.MIN_LENGTH}位`,
  })
  @MaxLength(Phone.MAX_LENGTH, {
    message: `手机号长度不能超过${Phone.MAX_LENGTH}位`,
  })
  @Matches(/^[0-9]+$/, { message: '手机号只能包含数字' })
  value!: string

  validateSync(): any[] {
    const { validateSync } = require('class-validator')
    return validateSync(this)
  }
}
