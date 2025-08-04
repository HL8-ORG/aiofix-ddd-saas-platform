import { ValueObject } from '@/shared/domain/value-objects/value-object.base'

/**
 * @enum PermissionType
 * @description 权限类型枚举
 */
export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api',
  DATA = 'data',
}

/**
 * @class PermissionTypeValue
 * @description
 * 权限类型值对象，封装权限类型的验证规则和业务逻辑。
 *
 * 主要原理与机制：
 * 1. 继承ValueObject基类，确保值对象的不可变性
 * 2. 实现权限类型的验证规则和业务逻辑
 * 3. 提供类型显示名称和描述信息
 * 4. 支持不同类型权限的业务规则验证
 */
export class PermissionTypeValue extends ValueObject<PermissionType> {
  /**
   * @constructor
   * @description 创建权限类型值对象
   * @param type 权限类型
   * @throws {Error} 当权限类型无效时抛出异常
   */
  constructor(type: PermissionType) {
    super()
    this.validateType(type)
    this._value = type
  }

  /**
   * @method getValue
   * @description 获取权限类型值
   * @returns {PermissionType} 权限类型
   */
  getValue(): PermissionType {
    return this._value
  }

  /**
   * @method getDisplayName
   * @description 获取权限类型显示名称
   * @returns {string} 类型显示名称
   */
  getDisplayName(): string {
    switch (this._value) {
      case PermissionType.MENU:
        return '菜单权限'
      case PermissionType.BUTTON:
        return '按钮权限'
      case PermissionType.API:
        return '接口权限'
      case PermissionType.DATA:
        return '数据权限'
      default:
        return '未知类型'
    }
  }

  /**
   * @method getDescription
   * @description 获取权限类型描述
   * @returns {string} 类型描述
   */
  getDescription(): string {
    switch (this._value) {
      case PermissionType.MENU:
        return '控制用户对系统菜单的访问权限'
      case PermissionType.BUTTON:
        return '控制用户对页面按钮的操作权限'
      case PermissionType.API:
        return '控制用户对后端接口的调用权限'
      case PermissionType.DATA:
        return '控制用户对数据的访问和操作权限'
      default:
        return '未知类型描述'
    }
  }

  /**
   * @method isMenu
   * @description 检查是否为菜单权限
   * @returns {boolean} 是否为菜单权限
   */
  isMenu(): boolean {
    return this._value === PermissionType.MENU
  }

  /**
   * @method isButton
   * @description 检查是否为按钮权限
   * @returns {boolean} 是否为按钮权限
   */
  isButton(): boolean {
    return this._value === PermissionType.BUTTON
  }

  /**
   * @method isApi
   * @description 检查是否为接口权限
   * @returns {boolean} 是否为接口权限
   */
  isApi(): boolean {
    return this._value === PermissionType.API
  }

  /**
   * @method isData
   * @description 检查是否为数据权限
   * @returns {boolean} 是否为数据权限
   */
  isData(): boolean {
    return this._value === PermissionType.DATA
  }

  /**
   * @method canHaveConditions
   * @description 检查是否可以设置条件
   * @returns {boolean} 是否可以设置条件
   */
  canHaveConditions(): boolean {
    return (
      this._value === PermissionType.DATA || this._value === PermissionType.API
    )
  }

  /**
   * @method canHaveFields
   * @description 检查是否可以设置字段权限
   * @returns {boolean} 是否可以设置字段权限
   */
  canHaveFields(): boolean {
    return this._value === PermissionType.DATA
  }

  /**
   * @method validateType
   * @description 验证权限类型是否有效
   * @param type 权限类型
   * @throws {Error} 当权限类型无效时抛出异常
   */
  private validateType(type: PermissionType): void {
    if (!Object.values(PermissionType).includes(type)) {
      throw new Error(`无效的权限类型: ${type}`)
    }
  }

  /**
   * @method equals
   * @description 比较两个权限类型是否相等
   * @param other 另一个权限类型值对象
   * @returns {boolean} 是否相等
   */
  equals(other: PermissionTypeValue): boolean {
    if (!other) {
      return false
    }
    return this._value === other._value
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 权限类型字符串
   */
  toString(): string {
    return this._value
  }

  /**
   * @static getMenu
   * @description 获取菜单权限类型
   * @returns {PermissionTypeValue} 菜单权限类型值对象
   */
  static getMenu(): PermissionTypeValue {
    return new PermissionTypeValue(PermissionType.MENU)
  }

  /**
   * @static getButton
   * @description 获取按钮权限类型
   * @returns {PermissionTypeValue} 按钮权限类型值对象
   */
  static getButton(): PermissionTypeValue {
    return new PermissionTypeValue(PermissionType.BUTTON)
  }

  /**
   * @static getApi
   * @description 获取接口权限类型
   * @returns {PermissionTypeValue} 接口权限类型值对象
   */
  static getApi(): PermissionTypeValue {
    return new PermissionTypeValue(PermissionType.API)
  }

  /**
   * @static getData
   * @description 获取数据权限类型
   * @returns {PermissionTypeValue} 数据权限类型值对象
   */
  static getData(): PermissionTypeValue {
    return new PermissionTypeValue(PermissionType.DATA)
  }
}
