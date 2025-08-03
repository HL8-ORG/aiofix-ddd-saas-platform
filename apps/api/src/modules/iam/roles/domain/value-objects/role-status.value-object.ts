import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ValueObject } from '@/shared/domain/value-objects/value-object.base';

/**
 * @enum RoleStatus
 * @description 角色状态枚举
 */
export enum RoleStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

/**
 * @class RoleStatusValue
 * @description
 * 角色状态值对象，使用class-validator库进行严格的状态验证。
 * 
 * 主要特性：
 * 1. 使用class-validator的@IsEnum装饰器进行枚举验证
 * 2. 支持状态转换规则验证
 * 3. 提供业务规则检查方法
 * 4. 支持显示信息和描述
 * 5. 实现值对象的相等性比较
 * 
 * 状态说明：
 * - ACTIVE: 激活状态，角色可以正常分配给用户
 * - SUSPENDED: 禁用状态，角色无法分配给新用户
 * - DELETED: 已删除状态，角色无法使用
 */
export class RoleStatusValue extends ValueObject<RoleStatus> {
  constructor(status: RoleStatus) {
    super();
    this._value = this.validateStatus(status);
  }

  /**
   * @method validateStatus
   * @description 验证角色状态
   * 
   * @param status - 角色状态
   * @returns 验证后的状态
   * @throws Error 当状态无效时
   */
  private validateStatus(status: RoleStatus): RoleStatus {
    const validator = new RoleStatusValidator();
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
   * @method isActive
   * @description 检查是否为激活状态
   */
  isActive(): boolean {
    return this._value === RoleStatus.ACTIVE;
  }

  /**
   * @method isSuspended
   * @description 检查是否为禁用状态
   */
  isSuspended(): boolean {
    return this._value === RoleStatus.SUSPENDED;
  }

  /**
   * @method isDeleted
   * @description 检查是否为已删除状态
   */
  isDeleted(): boolean {
    return this._value === RoleStatus.DELETED;
  }

  /**
   * @method canActivate
   * @description 检查是否可以激活
   */
  canActivate(): boolean {
    return this._value === RoleStatus.SUSPENDED;
  }

  /**
   * @method canSuspend
   * @description 检查是否可以禁用
   */
  canSuspend(): boolean {
    return this._value === RoleStatus.ACTIVE;
  }

  /**
   * @method canDelete
   * @description 检查是否可以删除
   */
  canDelete(): boolean {
    return this._value === RoleStatus.ACTIVE || this._value === RoleStatus.SUSPENDED;
  }

  /**
   * @method canRestore
   * @description 检查是否可以恢复
   */
  canRestore(): boolean {
    return this._value === RoleStatus.DELETED;
  }

  /**
   * @method canAssignToUser
   * @description 检查是否可以分配给用户
   */
  canAssignToUser(): boolean {
    return this._value === RoleStatus.ACTIVE;
  }

  /**
   * @method getDisplayName
   * @description 获取显示名称
   */
  getDisplayName(): string {
    const displayNames = {
      [RoleStatus.ACTIVE]: '激活',
      [RoleStatus.SUSPENDED]: '禁用',
      [RoleStatus.DELETED]: '已删除',
    };
    return displayNames[this._value];
  }

  /**
   * @method getDescription
   * @description 获取状态描述
   */
  getDescription(): string {
    const descriptions = {
      [RoleStatus.ACTIVE]: '角色处于激活状态，可以正常分配给用户',
      [RoleStatus.SUSPENDED]: '角色处于禁用状态，无法分配给新用户，但现有用户仍可使用',
      [RoleStatus.DELETED]: '角色已被删除，无法使用',
    };
    return descriptions[this._value];
  }

  /**
   * @method equals
   * @description 比较两个角色状态是否相等
   */
  equals(other: RoleStatusValue): boolean {
    if (!(other instanceof RoleStatusValue)) {
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
   * @description 从字符串创建RoleStatusValue值对象
   */
  static fromString(value: string): RoleStatusValue {
    return new RoleStatusValue(value as RoleStatus);
  }

  /**
   * @static isValid
   * @description 静态验证方法，使用class-validator验证角色状态
   */
  static isValid(value: string): boolean {
    try {
      const validator = new RoleStatusValidator();
      validator.value = value as RoleStatus;
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
      const validator = new RoleStatusValidator();
      validator.value = value as RoleStatus;
      const errors = validator.validateSync();

      if (!errors || errors.length === 0) {
        return { isValid: true, errors: [] };
      }

      const errorMessages = errors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      );
      return { isValid: false, errors: errorMessages };
    } catch (error) {
      return { isValid: false, errors: ['角色状态验证失败'] };
    }
  }

  // 静态工厂方法
  static active(): RoleStatusValue {
    return new RoleStatusValue(RoleStatus.ACTIVE);
  }

  static suspended(): RoleStatusValue {
    return new RoleStatusValue(RoleStatus.SUSPENDED);
  }

  static deleted(): RoleStatusValue {
    return new RoleStatusValue(RoleStatus.DELETED);
  }
}

/**
 * @class RoleStatusValidator
 * @description 用于class-validator验证的内部类
 */
class RoleStatusValidator {
  @IsString({ message: '角色状态必须是字符串' })
  @IsNotEmpty({ message: '角色状态不能为空' })
  @IsEnum(RoleStatus, { message: '无效的角色状态' })
  value!: RoleStatus;

  validateSync(): any[] {
    const { validateSync } = require('class-validator');
    return validateSync(this);
  }
} 