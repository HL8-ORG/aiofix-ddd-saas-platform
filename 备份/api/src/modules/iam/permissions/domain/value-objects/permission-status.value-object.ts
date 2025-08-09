import { ValueObject } from '@/shared/domain/value-objects/value-object.base'

/**
 * @enum PermissionStatus
 * @description 权限状态枚举
 */
export enum PermissionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
}

/**
 * @class PermissionStatusValue
 * @description
 * 权限状态值对象，封装权限状态的验证规则和业务逻辑。
 *
 * 主要原理与机制：
 * 1. 继承ValueObject基类，确保值对象的不可变性
 * 2. 实现权限状态的验证规则和业务逻辑
 * 3. 提供状态显示名称和描述信息
 * 4. 支持状态转换的业务规则验证
 */
export class PermissionStatusValue extends ValueObject<PermissionStatus> {
  /**
   * @constructor
   * @description 创建权限状态值对象
   * @param status 权限状态
   * @throws {Error} 当权限状态无效时抛出异常
   */
  constructor(status: PermissionStatus) {
    super()
    this.validateStatus(status)
    this._value = status
  }

  /**
   * @method getValue
   * @description 获取权限状态值
   * @returns {PermissionStatus} 权限状态
   */
  getValue(): PermissionStatus {
    return this._value
  }

  /**
   * @method getDisplayName
   * @description 获取权限状态显示名称
   * @returns {string} 状态显示名称
   */
  getDisplayName(): string {
    switch (this._value) {
      case PermissionStatus.ACTIVE:
        return '启用'
      case PermissionStatus.INACTIVE:
        return '禁用'
      case PermissionStatus.SUSPENDED:
        return '暂停'
      case PermissionStatus.EXPIRED:
        return '过期'
      default:
        return '未知状态'
    }
  }

  /**
   * @method getDescription
   * @description 获取权限状态描述
   * @returns {string} 状态描述
   */
  getDescription(): string {
    switch (this._value) {
      case PermissionStatus.ACTIVE:
        return '权限已启用，可以正常使用'
      case PermissionStatus.INACTIVE:
        return '权限已禁用，暂时无法使用'
      case PermissionStatus.SUSPENDED:
        return '权限已暂停，需要管理员重新启用'
      case PermissionStatus.EXPIRED:
        return '权限已过期，需要重新申请'
      default:
        return '未知状态描述'
    }
  }

  /**
   * @method isActive
   * @description 检查是否为启用状态
   * @returns {boolean} 是否为启用状态
   */
  isActive(): boolean {
    return this._value === PermissionStatus.ACTIVE
  }

  /**
   * @method isInactive
   * @description 检查是否为禁用状态
   * @returns {boolean} 是否为禁用状态
   */
  isInactive(): boolean {
    return this._value === PermissionStatus.INACTIVE
  }

  /**
   * @method isSuspended
   * @description 检查是否为暂停状态
   * @returns {boolean} 是否为暂停状态
   */
  isSuspended(): boolean {
    return this._value === PermissionStatus.SUSPENDED
  }

  /**
   * @method isExpired
   * @description 检查是否为过期状态
   * @returns {boolean} 是否为过期状态
   */
  isExpired(): boolean {
    return this._value === PermissionStatus.EXPIRED
  }

  /**
   * @method canBeActivated
   * @description 检查是否可以激活
   * @returns {boolean} 是否可以激活
   */
  canBeActivated(): boolean {
    return (
      this._value === PermissionStatus.INACTIVE ||
      this._value === PermissionStatus.SUSPENDED
    )
  }

  /**
   * @method canBeSuspended
   * @description 检查是否可以暂停
   * @returns {boolean} 是否可以暂停
   */
  canBeSuspended(): boolean {
    return this._value === PermissionStatus.ACTIVE
  }

  /**
   * @method canBeDeactivated
   * @description 检查是否可以禁用
   * @returns {boolean} 是否可以禁用
   */
  canBeDeactivated(): boolean {
    return (
      this._value === PermissionStatus.ACTIVE ||
      this._value === PermissionStatus.SUSPENDED
    )
  }

  /**
   * @method validateStatus
   * @description 验证权限状态是否有效
   * @param status 权限状态
   * @throws {Error} 当权限状态无效时抛出异常
   */
  private validateStatus(status: PermissionStatus): void {
    if (!Object.values(PermissionStatus).includes(status)) {
      throw new Error(`无效的权限状态: ${status}`)
    }
  }

  /**
   * @method equals
   * @description 比较两个权限状态是否相等
   * @param other 另一个权限状态值对象
   * @returns {boolean} 是否相等
   */
  equals(other: PermissionStatusValue): boolean {
    if (!other) {
      return false
    }
    return this._value === other._value
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 权限状态字符串
   */
  toString(): string {
    return this._value
  }

  /**
   * @static getActive
   * @description 获取启用状态
   * @returns {PermissionStatusValue} 启用状态值对象
   */
  static getActive(): PermissionStatusValue {
    return new PermissionStatusValue(PermissionStatus.ACTIVE)
  }

  /**
   * @static getInactive
   * @description 获取禁用状态
   * @returns {PermissionStatusValue} 禁用状态值对象
   */
  static getInactive(): PermissionStatusValue {
    return new PermissionStatusValue(PermissionStatus.INACTIVE)
  }

  /**
   * @static getSuspended
   * @description 获取暂停状态
   * @returns {PermissionStatusValue} 暂停状态值对象
   */
  static getSuspended(): PermissionStatusValue {
    return new PermissionStatusValue(PermissionStatus.SUSPENDED)
  }

  /**
   * @static getExpired
   * @description 获取过期状态
   * @returns {PermissionStatusValue} 过期状态值对象
   */
  static getExpired(): PermissionStatusValue {
    return new PermissionStatusValue(PermissionStatus.EXPIRED)
  }
}
