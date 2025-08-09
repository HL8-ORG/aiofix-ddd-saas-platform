/**
 * @class TenantCode
 * @description
 * 租户编码值对象，实现租户编码的不可变性和业务规则验证。
 * 该值对象采用DDD设计模式，确保租户编码的格式正确性和唯一性。
 *
 * 主要原理与机制：
 * 1. 使用值对象模式，确保租户编码的不可变性
 * 2. 实现业务规则验证，确保租户编码符合规范
 * 3. 提供equals方法进行值比较
 * 4. 支持租户编码的格式化处理
 * 5. 实现toString方法用于字符串表示
 */
export class TenantCode {
  /**
   * @property value
   * @description 租户编码的实际值
   * @private
   */
  private readonly value: string

  /**
   * @property MIN_LENGTH
   * @description 租户编码最小长度
   * @static
   */
  private static readonly MIN_LENGTH = 3

  /**
   * @property MAX_LENGTH
   * @description 租户编码最大长度
   * @static
   */
  private static readonly MAX_LENGTH = 20

  /**
   * @property CODE_REGEX
   * @description 租户编码正则表达式
   * @static
   */
  private static readonly CODE_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/

  /**
   * @constructor
   * @description 构造函数，创建租户编码值对象
   * @param value {string} 租户编码值
   * @throws {Error} 当租户编码不符合规范时抛出异常
   */
  constructor(value: string) {
    this.validate(value)
    this.value = this.normalize(value)
  }

  /**
   * @method validate
   * @description 验证租户编码是否符合规范
   * @param value {string} 租户编码值
   * @throws {Error} 验证失败时抛出异常
   * @private
   */
  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('租户编码不能为空')
    }

    const trimmedValue = value.trim()

    if (trimmedValue.length === 0) {
      throw new Error('租户编码不能为空')
    }

    if (trimmedValue.length < TenantCode.MIN_LENGTH) {
      throw new Error(`租户编码长度不能少于${TenantCode.MIN_LENGTH}个字符`)
    }

    if (trimmedValue.length > TenantCode.MAX_LENGTH) {
      throw new Error(`租户编码长度不能超过${TenantCode.MAX_LENGTH}个字符`)
    }

    if (!TenantCode.CODE_REGEX.test(trimmedValue)) {
      throw new Error('租户编码必须以字母开头，只能包含字母、数字和下划线')
    }

    // 检查是否包含连续的下划线
    if (/_{2,}/.test(trimmedValue)) {
      throw new Error('租户编码不能包含连续的下划线')
    }

    // 检查是否以下划线结尾
    if (trimmedValue.endsWith('_')) {
      throw new Error('租户编码不能以下划线结尾')
    }

    // 大写字母会在normalize时转换为小写，这里不检查
  }

  /**
   * @method normalize
   * @description 标准化租户编码格式
   * @param value {string} 原始租户编码值
   * @returns {string} 标准化后的租户编码
   * @private
   */
  private normalize(value: string): string {
    return value.trim().toLowerCase()
  }

  /**
   * @method getValue
   * @description 获取租户编码的值
   * @returns {string} 租户编码值
   */
  getValue(): string {
    return this.value
  }

  /**
   * @method getDisplayValue
   * @description 获取租户编码的显示值（首字母大写）
   * @returns {string} 显示值
   */
  getDisplayValue(): string {
    return this.value.charAt(0).toUpperCase() + this.value.slice(1)
  }

  /**
   * @method equals
   * @description 比较两个租户编码是否相等
   * @param other {TenantCode} 另一个租户编码值对象
   * @returns {boolean} 是否相等
   */
  equals(other: TenantCode): boolean {
    if (other === null || other === undefined) {
      return false
    }
    if (this === other) {
      return true
    }
    return this.value === other.value
  }

  /**
   * @method toString
   * @description 将租户编码转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return this.value
  }

  /**
   * @method toJSON
   * @description 将租户编码转换为JSON对象
   * @returns {object} JSON对象
   */
  toJSON(): object {
    return {
      value: this.value,
      displayValue: this.getDisplayValue(),
    }
  }

  /**
   * @method isValid
   * @description 静态方法，检查租户编码是否有效
   * @param value {string} 租户编码值
   * @returns {boolean} 是否有效
   * @static
   */
  static isValid(value: string): boolean {
    try {
      new TenantCode(value)
      return true
    } catch {
      return false
    }
  }

  /**
   * @method create
   * @description 静态工厂方法，创建租户编码值对象
   * @param value {string} 租户编码值
   * @returns {TenantCode} 租户编码值对象
   * @static
   */
  static create(value: string): TenantCode {
    return new TenantCode(value)
  }

  /**
   * @method getMinLength
   * @description 获取租户编码最小长度
   * @returns {number} 最小长度
   * @static
   */
  static getMinLength(): number {
    return TenantCode.MIN_LENGTH
  }

  /**
   * @method getMaxLength
   * @description 获取租户编码最大长度
   * @returns {number} 最大长度
   * @static
   */
  static getMaxLength(): number {
    return TenantCode.MAX_LENGTH
  }

  /**
   * @method getRegex
   * @description 获取租户编码正则表达式
   * @returns {RegExp} 正则表达式
   * @static
   */
  static getRegex(): RegExp {
    return TenantCode.CODE_REGEX
  }
}
