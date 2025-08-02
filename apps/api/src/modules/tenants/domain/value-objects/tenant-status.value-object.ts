import { IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';

/**
 * @enum TenantStatus
 * @description 租户状态枚举
 */
export enum TenantStatus {
  PENDING = 'pending',    // 待激活
  ACTIVE = 'active',      // 激活
  SUSPENDED = 'suspended', // 禁用
  DELETED = 'deleted'     // 已删除
}

/**
 * @class TenantStatusValue
 * @description
 * 租户状态值对象，封装租户状态的业务规则和状态转换逻辑。
 * 
 * 主要原理与机制：
 * 1. 值对象是不可变的，一旦创建就不能修改
 * 2. 通过状态机模式管理状态转换
 * 3. 提供状态查询和验证方法
 * 4. 实现值对象的相等性比较
 * 5. 封装状态相关的业务逻辑
 */
export class TenantStatusValue {
  /**
   * @property value
   * @description 租户状态的实际值
   */
  @IsEnum(TenantStatus, { message: '无效的租户状态' })
  @Expose()
  private readonly _value: TenantStatus;

  /**
   * @constructor
   * @description 创建租户状态值对象
   * @param value 租户状态值
   */
  constructor(value: TenantStatus) {
    this._value = value;
  }

  /**
   * @method get value
   * @description 获取租户状态值
   * @returns {TenantStatus} 租户状态
   */
  get value(): TenantStatus {
    return this._value;
  }

  /**
   * @method isPending
   * @description 检查是否为待激活状态
   * @returns {boolean} 如果是待激活状态返回true，否则返回false
   */
  isPending(): boolean {
    return this._value === TenantStatus.PENDING;
  }

  /**
   * @method isActive
   * @description 检查是否为激活状态
   * @returns {boolean} 如果是激活状态返回true，否则返回false
   */
  isActive(): boolean {
    return this._value === TenantStatus.ACTIVE;
  }

  /**
   * @method isSuspended
   * @description 检查是否为禁用状态
   * @returns {boolean} 如果是禁用状态返回true，否则返回false
   */
  isSuspended(): boolean {
    return this._value === TenantStatus.SUSPENDED;
  }

  /**
   * @method isDeleted
   * @description 检查是否为已删除状态
   * @returns {boolean} 如果是已删除状态返回true，否则返回false
   */
  isDeleted(): boolean {
    return this._value === TenantStatus.DELETED;
  }

  /**
   * @method canActivate
   * @description 检查是否可以激活
   * @returns {boolean} 如果可以激活返回true，否则返回false
   */
  canActivate(): boolean {
    return this._value === TenantStatus.PENDING || this._value === TenantStatus.SUSPENDED;
  }

  /**
   * @method canSuspend
   * @description 检查是否可以禁用
   * @returns {boolean} 如果可以禁用返回true，否则返回false
   */
  canSuspend(): boolean {
    return this._value === TenantStatus.ACTIVE || this._value === TenantStatus.PENDING;
  }

  /**
   * @method canDelete
   * @description 检查是否可以删除
   * @returns {boolean} 如果可以删除返回true，否则返回false
   */
  canDelete(): boolean {
    return this._value !== TenantStatus.DELETED;
  }

  /**
   * @method canRestore
   * @description 检查是否可以恢复
   * @returns {boolean} 如果可以恢复返回true，否则返回false
   */
  canRestore(): boolean {
    return this._value === TenantStatus.DELETED;
  }

  /**
   * @method getDisplayName
   * @description 获取状态的显示名称
   * @returns {string} 状态的显示名称
   */
  getDisplayName(): string {
    switch (this._value) {
      case TenantStatus.PENDING:
        return '待激活';
      case TenantStatus.ACTIVE:
        return '激活';
      case TenantStatus.SUSPENDED:
        return '禁用';
      case TenantStatus.DELETED:
        return '已删除';
      default:
        return '未知状态';
    }
  }

  /**
   * @method getDescription
   * @description 获取状态的描述信息
   * @returns {string} 状态的描述信息
   */
  getDescription(): string {
    switch (this._value) {
      case TenantStatus.PENDING:
        return '租户已创建但尚未激活，需要管理员审核';
      case TenantStatus.ACTIVE:
        return '租户已激活，可以正常使用系统功能';
      case TenantStatus.SUSPENDED:
        return '租户已被禁用，无法使用系统功能';
      case TenantStatus.DELETED:
        return '租户已被删除，数据保留但无法访问';
      default:
        return '未知状态';
    }
  }

  /**
   * @method toString
   * @description 返回租户状态的字符串表示
   * @returns {string} 租户状态
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个租户状态是否相等
   * @param other 另一个租户状态值对象
   * @returns {boolean} 如果相等返回true，否则返回false
   */
  equals(other: TenantStatusValue): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  /**
   * @static method fromString
   * @description 从字符串创建租户状态值对象
   * @param value 状态字符串
   * @returns {TenantStatusValue} 租户状态值对象
   * @throws {Error} 当状态值无效时抛出异常
   */
  static fromString(value: string): TenantStatusValue {
    if (!Object.values(TenantStatus).includes(value as TenantStatus)) {
      throw new Error(`无效的租户状态: ${value}`);
    }
    return new TenantStatusValue(value as TenantStatus);
  }

  /**
   * @static method getAvailableStatuses
   * @description 获取所有可用的状态
   * @returns {TenantStatus[]} 所有可用的状态
   */
  static getAvailableStatuses(): TenantStatus[] {
    return Object.values(TenantStatus);
  }
} 