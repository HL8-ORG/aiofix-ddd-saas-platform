/**
 * @class TenantName
 * @description
 * 租户名称值对象，实现租户名称的不可变性和业务规则验证。
 * 该值对象采用DDD设计模式，确保租户名称的格式正确性和唯一性。
 *
 * 主要原理与机制：
 * 1. 使用值对象模式，确保租户名称的不可变性
 * 2. 实现业务规则验证，确保租户名称符合规范
 * 3. 提供equals方法进行值比较
 * 4. 支持租户名称的格式化处理
 * 5. 实现toString方法用于字符串表示
 */
export class TenantName {
  /**
   * @property value
   * @description 租户名称的实际值
   * @private
   */
  private readonly value: string

  /**
   * @property MIN_LENGTH
   * @description 租户名称最小长度
   * @static
   */
  private static readonly MIN_LENGTH = 2

  /**
   * @property MAX_LENGTH
   * @description 租户名称最大长度
   * @static
   */
  private static readonly MAX_LENGTH = 100

  /**
   * @property NAME_REGEX
   * @description 租户名称正则表达式
   * @static
   */
  private static readonly NAME_REGEX = /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]+$/

  /**
   * @constructor
   * @description 构造函数，创建租户名称值对象
   * @param value {string} 租户名称值
   * @throws {Error} 当租户名称不符合规范时抛出异常
   */
  constructor(value: string) {
    this.validate(value)
    this.value = this.normalize(value)
  }

  /**
   * @method validate
   * @description 验证租户名称是否符合规范
   * @param value {string} 租户名称值
   * @throws {Error} 验证失败时抛出异常
   * @private
   */
  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('租户名称不能为空')
    }

    const trimmedValue = value.trim()

    if (trimmedValue.length === 0) {
      throw new Error('租户名称不能为空')
    }

    if (trimmedValue.length < TenantName.MIN_LENGTH) {
      throw new Error(`租户名称长度不能少于${TenantName.MIN_LENGTH}个字符`)
    }

    if (trimmedValue.length > TenantName.MAX_LENGTH) {
      throw new Error(`租户名称长度不能超过${TenantName.MAX_LENGTH}个字符`)
    }

    if (!TenantName.NAME_REGEX.test(trimmedValue)) {
      throw new Error('租户名称只能包含中文、英文、数字、空格、连字符和下划线')
    }

    // 检查是否以数字开头
    if (/^\d/.test(trimmedValue)) {
      throw new Error('租户名称不能以数字开头')
    }

    // 连续空格会在normalize时处理，这里不检查
  }

  /**
   * @method normalize
   * @description 标准化租户名称格式
   * @param value {string} 原始租户名称值
   * @returns {string} 标准化后的租户名称
   * @private
   */
  private normalize(value: string): string {
    return value.trim().replace(/\s+/g, ' ')
  }

  /**
   * @method getValue
   * @description 获取租户名称的值
   * @returns {string} 租户名称值
   */
  getValue(): string {
    return this.value
  }

  /**
   * @method getDisplayValue
   * @description 获取租户名称的显示值
   * @returns {string} 显示值
   */
  getDisplayValue(): string {
    return this.value
  }

  /**
   * @method equals
   * @description 比较两个租户名称是否相等
   * @param other {TenantName} 另一个租户名称值对象
   * @returns {boolean} 是否相等
   */
  equals(other: TenantName): boolean {
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
   * @description 将租户名称转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return this.value
  }

  /**
   * @method toJSON
   * @description 将租户名称转换为JSON对象
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
   * @description 静态方法，检查租户名称是否有效
   * @param value {string} 租户名称值
   * @returns {boolean} 是否有效
   * @static
   */
  static isValid(value: string): boolean {
    try {
      new TenantName(value)
      return true
    } catch {
      return false
    }
  }

  /**
   * @method create
   * @description 静态工厂方法，创建租户名称值对象
   * @param value {string} 租户名称值
   * @returns {TenantName} 租户名称值对象
   * @static
   */
  static create(value: string): TenantName {
    return new TenantName(value)
  }

  /**
   * @method getMinLength
   * @description 获取租户名称最小长度
   * @returns {number} 最小长度
   * @static
   */
  static getMinLength(): number {
    return TenantName.MIN_LENGTH
  }

  /**
   * @method getMaxLength
   * @description 获取租户名称最大长度
   * @returns {number} 最大长度
   * @static
   */
  static getMaxLength(): number {
    return TenantName.MAX_LENGTH
  }

  /**
   * @method getRegex
   * @description 获取租户名称正则表达式
   * @returns {RegExp} 正则表达式
   * @static
   */
  static getRegex(): RegExp {
    return TenantName.NAME_REGEX
  }
}
