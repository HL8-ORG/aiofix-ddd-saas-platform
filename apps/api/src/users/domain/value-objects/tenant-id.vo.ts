/**
 * @file tenant-id.vo.ts
 * @description 租户ID值对象
 * 
 * 租户ID是系统中用于标识租户的唯一标识符，支持多种格式：
 * 1. UUID格式：标准的UUID v4格式
 * 2. 自定义格式：符合业务规则的自定义标识符
 * 
 * 主要功能：
 * - 租户ID格式验证
 * - 租户ID生成
 * - 租户ID比较
 * - 租户ID转换
 */

import { IsString, IsNotEmpty, Matches, MinLength, MaxLength } from 'class-validator'

/**
 * @class TenantIdRequiredException
 * @description 租户ID为空异常
 */
export class TenantIdRequiredException extends Error {
  constructor() {
    super('租户ID不能为空')
    this.name = 'TenantIdRequiredException'
  }
}

/**
 * @class InvalidTenantIdException
 * @description 租户ID格式无效异常
 */
export class InvalidTenantIdException extends Error {
  constructor(tenantId: string) {
    super(`租户ID格式无效: ${tenantId}`)
    this.name = 'InvalidTenantIdException'
  }
}

/**
 * @class TenantId
 * @description 租户ID值对象
 * 
 * 租户ID是系统中用于标识租户的唯一标识符，支持以下格式：
 * 1. UUID格式：标准的UUID v4格式
 * 2. 自定义格式：符合业务规则的自定义标识符
 */
export class TenantId {
  @IsString({ message: '租户ID必须是字符串' })
  @IsNotEmpty({ message: '租户ID不能为空' })
  @MinLength(3, { message: '租户ID至少3个字符' })
  @MaxLength(50, { message: '租户ID最多50个字符' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: '租户ID只能包含字母、数字、下划线和连字符' })
  private readonly value: string

  /**
   * @constructor
   * @description 创建租户ID值对象
   * @param {string} tenantId - 租户ID字符串
   * @throws {TenantIdRequiredException} 当租户ID为空时
   * @throws {InvalidTenantIdException} 当租户ID格式无效时
   */
  constructor(tenantId: string) {
    this.validateTenantId(tenantId)
    this.value = tenantId
  }

  /**
   * @method validateTenantId
   * @description 验证租户ID格式
   * @param {string} tenantId - 待验证的租户ID
   * @throws {TenantIdRequiredException} 当租户ID为空时
   * @throws {InvalidTenantIdException} 当租户ID格式无效时
   */
  private validateTenantId(tenantId: string): void {
    if (!tenantId || tenantId.trim().length === 0) {
      throw new TenantIdRequiredException()
    }

    const trimmedTenantId = tenantId.trim()

    // 验证长度
    if (trimmedTenantId.length < 3) {
      throw new InvalidTenantIdException(tenantId)
    }

    if (trimmedTenantId.length > 50) {
      throw new InvalidTenantIdException(tenantId)
    }

    // 验证格式：支持UUID格式或自定义格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const customRegex = /^[a-zA-Z0-9_-]+$/

    if (!uuidRegex.test(trimmedTenantId) && !customRegex.test(trimmedTenantId)) {
      throw new InvalidTenantIdException(tenantId)
    }
  }

  /**
   * @method getValue
   * @description 获取租户ID值
   * @returns {string} 租户ID字符串
   */
  getValue(): string {
    return this.value
  }

  /**
   * @method getLength
   * @description 获取租户ID长度
   * @returns {number} 租户ID长度
   */
  getLength(): number {
    return this.value.length
  }

  /**
   * @method getFormat
   * @description 获取租户ID格式类型
   * @returns {string} 格式类型（'uuid', 'custom'）
   */
  getFormat(): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (uuidRegex.test(this.value)) {
      return 'uuid'
    } else {
      return 'custom'
    }
  }

  /**
   * @method equals
   * @description 比较两个租户ID值对象是否相等
   * @param {TenantId} other - 待比较的另一个租户ID值对象
   * @returns {boolean} 如果两个租户ID相等返回true，否则返回false
   */
  equals(other: TenantId): boolean {
    if (!(other instanceof TenantId)) {
      return false
    }
    return this.value === other.value
  }

  /**
   * @method toString
   * @description 将租户ID值对象转换为字符串
   * @returns {string} 租户ID的字符串表示
   */
  toString(): string {
    return this.value
  }

  /**
   * @static
   * @method isValid
   * @description 验证租户ID格式是否有效
   * @param {string} tenantId - 待验证的租户ID
   * @returns {boolean} 如果租户ID格式有效返回true，否则返回false
   */
  static isValid(tenantId: string): boolean {
    try {
      new TenantId(tenantId)
      return true
    } catch {
      return false
    }
  }

  /**
   * @static
   * @method create
   * @description 创建租户ID值对象（如果租户ID有效）
   * @param {string} tenantId - 租户ID字符串
   * @returns {TenantId} 新的租户ID值对象
   */
  static create(tenantId: string): TenantId {
    return new TenantId(tenantId)
  }

  /**
   * @static
   * @method generate
   * @description 生成新的租户ID
   * @param {string} format - 生成格式（'uuid', 'custom'）
   * @returns {string} 新的租户ID字符串
   */
  static generate(format: 'uuid' | 'custom' = 'uuid'): string {
    switch (format) {
      case 'uuid':
        return this.generateUUID()
      case 'custom':
        return this.generateCustom()
      default:
        return this.generateUUID()
    }
  }

  /**
   * @static
   * @method generateUUID
   * @description 生成UUID格式的租户ID
   * @returns {string} UUID格式的租户ID
   */
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * @static
   * @method generateCustom
   * @description 生成自定义格式的租户ID
   * @returns {string} 自定义格式的租户ID
   */
  private static generateCustom(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
    let result = 'tenant_'
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}
