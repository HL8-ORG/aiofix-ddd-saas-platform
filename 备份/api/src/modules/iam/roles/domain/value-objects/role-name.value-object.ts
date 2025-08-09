import { ValueObject } from '@/shared/domain/value-objects/value-object.base'

/**
 * @class RoleName
 * @description
 * 角色名称值对象，封装角色名称的验证规则和业务逻辑。
 *
 * 主要原理与机制：
 * 1. 继承ValueObject基类，确保值对象的不可变性
 * 2. 实现角色名称的验证规则（长度、字符限制、格式等）
 * 3. 提供名称规范化处理，统一格式
 * 4. 支持中文角色名称，符合企业级应用需求
 */
export class RoleName extends ValueObject<string> {
  /**
   * @constructor
   * @description 创建角色名称值对象
   * @param value 角色名称
   * @throws {Error} 当角色名称不符合验证规则时抛出异常
   */
  constructor(value: string) {
    super()
    this._value = this.normalizeName(value)
    this.validateName(this._value)
  }

  /**
   * @method getValue
   * @description 获取角色名称值
   * @returns {string} 角色名称
   */
  getValue(): string {
    return this._value
  }

  /**
   * @method getDisplayName
   * @description 获取角色名称显示值（去除前后空格）
   * @returns {string} 角色名称显示值
   */
  getDisplayName(): string {
    return this._value.trim()
  }

  /**
   * @method getShortName
   * @description 获取角色名称的简短版本（最多20个字符）
   * @returns {string} 角色名称简短版本
   */
  getShortName(): string {
    return this._value.length > 20
      ? this._value.substring(0, 20) + '...'
      : this._value
  }

  /**
   * @method normalizeName
   * @description 规范化角色名称
   * @param name 原始角色名称
   * @returns {string} 规范化后的角色名称
   */
  private normalizeName(name: string): string {
    if (!name) {
      throw new Error('角色名称不能为空')
    }

    // 去除前后空格
    let normalized = name.trim()

    // 将多个连续空格替换为单个空格
    normalized = normalized.replace(/\s+/g, ' ')

    return normalized
  }

  /**
   * @method validateName
   * @description 验证角色名称是否符合规则
   * @param name 角色名称
   * @throws {Error} 当角色名称不符合规则时抛出异常
   */
  private validateName(name: string): void {
    if (!name || name.length === 0) {
      throw new Error('角色名称不能为空')
    }

    if (name.length < 2) {
      throw new Error('角色名称长度不能少于2个字符')
    }

    if (name.length > 50) {
      throw new Error('角色名称长度不能超过50个字符')
    }

    // 检查是否以数字开头
    if (/^\d/.test(name)) {
      throw new Error('角色名称不能以数字开头')
    }

    // 检查是否包含连续的特殊字符（除了空格）
    if (/[^\w\u4e00-\u9fa5\-\s]{2,}/.test(name)) {
      throw new Error('角色名称不能包含连续的特殊字符')
    }

    // 检查是否包含不允许的字符（只允许字母、数字、下划线、连字符、中文、空格）
    if (!/^[\w\u4e00-\u9fa5\-\s]+$/.test(name)) {
      throw new Error('角色名称只能包含字母、数字、下划线、连字符、中文和空格')
    }
  }

  /**
   * @method equals
   * @description 比较两个角色名称是否相等
   * @param other 另一个角色名称值对象
   * @returns {boolean} 是否相等
   */
  equals(other: RoleName): boolean {
    if (!other) {
      return false
    }
    return this._value.toLowerCase() === other._value.toLowerCase()
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 角色名称字符串
   */
  toString(): string {
    return this._value
  }
}
