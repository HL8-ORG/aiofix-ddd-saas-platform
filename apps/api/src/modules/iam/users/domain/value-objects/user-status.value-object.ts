import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ValueObject } from '../../../../../shared/domain/value-objects/value-object.base';

/**
 * @enum UserStatus
 * @description 用户状态枚举
 */
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

/**
 * @class UserStatusValue
 * @description
 * 用户状态值对象，使用class-validator库进行严格的状态验证。
 * 
 * 主要特性：
 * 1. 使用class-validator的@IsEnum装饰器进行枚举验证
 * 2. 支持状态转换规则验证
 * 3. 提供业务规则检查方法
 * 4. 支持显示信息和描述
 * 5. 实现值对象的相等性比较
 * 
 * 状态说明：
 * - PENDING: 待激活状态，用户已注册但未激活
 * - ACTIVE: 激活状态，用户可以正常使用系统
 * - SUSPENDED: 禁用状态，用户被临时禁用
 * - DELETED: 已删除状态，用户被软删除
 */
export class UserStatusValue extends ValueObject<UserStatus> {
  constructor(value: UserStatus) {
    super();
    this._value = this.validateStatus(value);
  }

  /**
   * @method validateStatus
   * @description 验证用户状态
   * 
   * @param status - 用户状态
   * @returns 验证后的状态
   * @throws Error 当状态无效时
   */
  private validateStatus(status: UserStatus): UserStatus {
    const validator = new UserStatusValidator();
    validator.value = status;

    const errors = validator.validateSync();
    if (errors && errors.length > 0) {
      const errorMessages = errors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new Error(errorMessages);
    }

    return status;
  }

  /**
   * @method isPending
   * @description 检查是否为待激活状态
   */
  isPending(): boolean {
    return this._value === UserStatus.PENDING;
  }

  /**
   * @method isActive
   * @description 检查是否为激活状态
   */
  isActive(): boolean {
    return this._value === UserStatus.ACTIVE;
  }

  /**
   * @method isSuspended
   * @description 检查是否为禁用状态
   */
  isSuspended(): boolean {
    return this._value === UserStatus.SUSPENDED;
  }

  /**
   * @method isDeleted
   * @description 检查是否为已删除状态
   */
  isDeleted(): boolean {
    return this._value === UserStatus.DELETED;
  }

  /**
   * @method canLogin
   * @description 检查是否可以登录
   */
  canLogin(): boolean {
    return this._value === UserStatus.ACTIVE;
  }

  /**
   * @method canActivate
   * @description 检查是否可以激活
   */
  canActivate(): boolean {
    return this._value === UserStatus.PENDING || this._value === UserStatus.SUSPENDED;
  }

  /**
   * @method canSuspend
   * @description 检查是否可以禁用
   */
  canSuspend(): boolean {
    return this._value === UserStatus.ACTIVE;
  }

  /**
   * @method canDelete
   * @description 检查是否可以删除
   */
  canDelete(): boolean {
    return this._value === UserStatus.ACTIVE || this._value === UserStatus.SUSPENDED;
  }

  /**
   * @method canRestore
   * @description 检查是否可以恢复
   */
  canRestore(): boolean {
    return this._value === UserStatus.DELETED;
  }

  /**
   * @method getDisplayName
   * @description 获取显示名称
   */
  getDisplayName(): string {
    const displayNames = {
      [UserStatus.PENDING]: '待激活',
      [UserStatus.ACTIVE]: '激活',
      [UserStatus.SUSPENDED]: '禁用',
      [UserStatus.DELETED]: '已删除',
    };
    return displayNames[this._value];
  }

  /**
   * @method getDescription
   * @description 获取状态描述
   */
  getDescription(): string {
    const descriptions = {
      [UserStatus.PENDING]: '用户已注册但尚未激活，需要管理员激活或邮箱验证',
      [UserStatus.ACTIVE]: '用户已激活，可以正常登录和使用系统',
      [UserStatus.SUSPENDED]: '用户已被禁用，无法登录系统',
      [UserStatus.DELETED]: '用户已被删除，数据保留用于审计',
    };
    return descriptions[this._value];
  }

  /**
   * @method equals
   * @description 比较两个用户状态是否相等
   */
  equals(other: UserStatusValue): boolean {
    if (!(other instanceof UserStatusValue)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method toJSON
   * @description 序列化为JSON
   */
  toJSON(): string {
    return this._value;
  }

  /**
   * @static fromString
   * @description 从字符串创建UserStatusValue值对象
   */
  static fromString(value: string): UserStatusValue {
    return new UserStatusValue(value as UserStatus);
  }

  /**
   * @static isValid
   * @description 静态验证方法，使用class-validator验证用户状态
   */
  static isValid(value: string): boolean {
    try {
      const validator = new UserStatusValidator();
      validator.value = value as UserStatus;
      const errors = validator.validateSync();
      return !errors || errors.length === 0;
    } catch {
      return false;
    }
  }

  /**
   * @static validate
   * @description 静态验证方法，返回详细的验证结果
   */
  static validate(value: string): { isValid: boolean; errors: string[] } {
    try {
      const validator = new UserStatusValidator();
      validator.value = value as UserStatus;
      const errors = validator.validateSync();

      if (!errors || errors.length === 0) {
        return { isValid: true, errors: [] };
      }

      const errorMessages = errors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      );
      return { isValid: false, errors: errorMessages };
    } catch (error) {
      return { isValid: false, errors: ['用户状态验证失败'] };
    }
  }

  // 静态工厂方法
  static pending(): UserStatusValue {
    return new UserStatusValue(UserStatus.PENDING);
  }

  static active(): UserStatusValue {
    return new UserStatusValue(UserStatus.ACTIVE);
  }

  static suspended(): UserStatusValue {
    return new UserStatusValue(UserStatus.SUSPENDED);
  }

  static deleted(): UserStatusValue {
    return new UserStatusValue(UserStatus.DELETED);
  }
}

/**
 * @class UserStatusValidator
 * @description 用于class-validator验证的内部类
 */
class UserStatusValidator {
  @IsString({ message: '用户状态必须是字符串' })
  @IsNotEmpty({ message: '用户状态不能为空' })
  @IsEnum(UserStatus, { message: '无效的用户状态' })
  value!: UserStatus;

  validateSync(): any[] {
    const { validateSync } = require('class-validator');
    return validateSync(this);
  }
} 