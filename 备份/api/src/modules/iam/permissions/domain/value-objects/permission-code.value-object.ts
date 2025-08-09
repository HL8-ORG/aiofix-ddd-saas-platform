import { ValueObject } from '@/shared/domain/value-objects/value-object.base'

/**
 * @class PermissionCode
 * @description
 * 权限代码值对象，封装权限代码的验证规则和业务逻辑。
 *
 * 主要原理与机制：
 * 1. 继承ValueObject基类，确保值对象的不可变性
 * 2. 实现权限代码的验证规则（长度、字符限制、格式等）
 * 3. 提供代码规范化处理，统一为大写格式
 * 4. 支持系统级权限代码的标准化命名
 */
export class PermissionCode extends ValueObject<string> {
  /**
   * @constructor
   * @description 创建权限代码值对象
   * @param value 权限代码
   * @throws {Error} 当权限代码不符合验证规则时抛出异常
   */
  constructor(value: string) {
    super()
    this._value = this.normalizeCode(value)
    this.validateCode(this._value)
  }

  /**
   * @method getValue
   * @description 获取权限代码值
   * @returns {string} 权限代码
   */
  getValue(): string {
    return this._value
  }

  /**
   * @method getDisplayCode
   * @description 获取权限代码显示值
   * @returns {string} 权限代码显示值
   */
  getDisplayCode(): string {
    return this._value
  }

  /**
   * @method getShortCode
   * @description 获取权限代码的简短版本（最多15个字符）
   * @returns {string} 权限代码简短版本
   */
  getShortCode(): string {
    return this._value.length > 15
      ? this._value.substring(0, 15) + '...'
      : this._value
  }

  /**
   * @method normalizeCode
   * @description 规范化权限代码
   * @param code 原始权限代码
   * @returns {string} 规范化后的权限代码
   */
  private normalizeCode(code: string): string {
    if (!code) {
      throw new Error('权限代码不能为空')
    }

    // 去除前后空格
    let normalized = code.trim()

    // 转换为大写
    normalized = normalized.toUpperCase()

    // 将多个连续下划线替换为单个下划线
    normalized = normalized.replace(/_+/g, '_')

    // 去除首尾的下划线
    normalized = normalized.replace(/^_+|_+$/g, '')

    return normalized
  }

  /**
   * @method validateCode
   * @description 验证权限代码是否符合规则
   * @param code 权限代码
   * @throws {Error} 当权限代码不符合规则时抛出异常
   */
  private validateCode(code: string): void {
    if (!code || code.length === 0) {
      throw new Error('权限代码不能为空')
    }

    if (code.length < 3) {
      throw new Error('权限代码长度不能少于3个字符')
    }

    if (code.length > 30) {
      throw new Error('权限代码长度不能超过30个字符')
    }

    // 检查是否以字母开头
    if (!/^[A-Z]/.test(code)) {
      throw new Error('权限代码必须以字母开头')
    }

    // 检查是否只包含大写字母、数字和下划线
    if (!/^[A-Z0-9_]+$/.test(code)) {
      throw new Error('权限代码只能包含大写字母、数字和下划线')
    }

    // 检查是否包含连续的下划线
    if (/_{2,}/.test(code)) {
      throw new Error('权限代码不能包含连续的下划线')
    }

    // 检查是否以下划线结尾
    if (code.endsWith('_')) {
      throw new Error('权限代码不能以下划线结尾')
    }
  }

  /**
   * @method isSystemCode
   * @description 检查是否为系统权限代码
   * @returns {boolean} 是否为系统权限代码
   */
  isSystemCode(): boolean {
    const systemCodes = [
      'USER_CREATE',
      'USER_READ',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_MANAGE',
      'ROLE_CREATE',
      'ROLE_READ',
      'ROLE_UPDATE',
      'ROLE_DELETE',
      'ROLE_MANAGE',
      'PERMISSION_CREATE',
      'PERMISSION_READ',
      'PERMISSION_UPDATE',
      'PERMISSION_DELETE',
      'PERMISSION_MANAGE',
      'TENANT_MANAGE',
      'SYSTEM_ADMIN',
    ]
    return systemCodes.includes(this._value)
  }

  /**
   * @method isDefaultCode
   * @description 检查是否为默认权限代码
   * @returns {boolean} 是否为默认权限代码
   */
  isDefaultCode(): boolean {
    const defaultCodes = ['USER_READ', 'ROLE_READ', 'PERMISSION_READ']
    return defaultCodes.includes(this._value)
  }

  /**
   * @method equals
   * @description 比较两个权限代码是否相等
   * @param other 另一个权限代码值对象
   * @returns {boolean} 是否相等
   */
  equals(other: PermissionCode): boolean {
    if (!other) {
      return false
    }
    return this._value === other._value
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 权限代码字符串
   */
  toString(): string {
    return this._value
  }
}
