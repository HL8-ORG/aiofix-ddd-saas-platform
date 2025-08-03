import { IsNumber, Min, Max } from 'class-validator';
import { ValueObject } from '@/shared/domain/value-objects/value-object.base';

/**
 * @class RolePriority
 * @description
 * 角色优先级值对象，封装角色优先级的验证规则和业务逻辑。
 * 
 * 主要原理与机制：
 * 1. 继承ValueObject基类，确保值对象的不可变性
 * 2. 实现角色优先级的验证规则（数值范围、默认值等）
 * 3. 提供优先级比较和业务逻辑处理
 * 4. 支持权限冲突解决时的优先级判断
 */
export class RolePriority extends ValueObject<number> {
  /**
   * @constant DEFAULT_PRIORITY
   * @description 默认优先级值
   */
  static readonly DEFAULT_PRIORITY = 100;

  /**
   * @constant MIN_PRIORITY
   * @description 最小优先级值
   */
  static readonly MIN_PRIORITY = 1;

  /**
   * @constant MAX_PRIORITY
   * @description 最大优先级值
   */
  static readonly MAX_PRIORITY = 1000;

  /**
   * @constant SYSTEM_ADMIN_PRIORITY
   * @description 系统管理员优先级值
   */
  static readonly SYSTEM_ADMIN_PRIORITY = 1;

  /**
   * @constant TENANT_ADMIN_PRIORITY
   * @description 租户管理员优先级值
   */
  static readonly TENANT_ADMIN_PRIORITY = 10;

  /**
   * @constant ORG_ADMIN_PRIORITY
   * @description 组织管理员优先级值
   */
  static readonly ORG_ADMIN_PRIORITY = 50;

  /**
   * @constant USER_PRIORITY
   * @description 普通用户优先级值
   */
  static readonly USER_PRIORITY = 100;

  /**
   * @constant GUEST_PRIORITY
   * @description 访客用户优先级值
   */
  static readonly GUEST_PRIORITY = 200;

  /**
   * @constructor
   * @description 创建角色优先级值对象
   * @param priority 角色优先级
   * @throws {Error} 当角色优先级不符合验证规则时抛出异常
   */
  constructor(priority: number) {
    super();
    this._value = this.validatePriority(priority);
  }

  /**
   * @method getValue
   * @description 获取角色优先级值
   * @returns {number} 角色优先级
   */
  getValue(): number {
    return this._value;
  }

  /**
   * @method getDisplayPriority
   * @description 获取角色优先级显示值
   * @returns {string} 优先级显示值
   */
  getDisplayPriority(): string {
    if (this._value <= RolePriority.SYSTEM_ADMIN_PRIORITY) {
      return '系统级';
    } else if (this._value <= RolePriority.TENANT_ADMIN_PRIORITY) {
      return '租户级';
    } else if (this._value <= RolePriority.ORG_ADMIN_PRIORITY) {
      return '组织级';
    } else if (this._value <= RolePriority.USER_PRIORITY) {
      return '用户级';
    } else {
      return '访客级';
    }
  }

  /**
   * @method getDescription
   * @description 获取角色优先级描述
   * @returns {string} 优先级描述
   */
  getDescription(): string {
    if (this._value <= RolePriority.SYSTEM_ADMIN_PRIORITY) {
      return '系统级角色，拥有最高权限，可管理所有租户';
    } else if (this._value <= RolePriority.TENANT_ADMIN_PRIORITY) {
      return '租户级角色，拥有租户内最高权限，可管理租户内所有资源';
    } else if (this._value <= RolePriority.ORG_ADMIN_PRIORITY) {
      return '组织级角色，拥有组织内管理权限，可管理组织内资源';
    } else if (this._value <= RolePriority.USER_PRIORITY) {
      return '用户级角色，拥有基本操作权限，可进行日常业务操作';
    } else {
      return '访客级角色，拥有只读权限，仅可查看部分信息';
    }
  }

  /**
   * @method isSystemLevel
   * @description 检查是否为系统级优先级
   * @returns {boolean} 是否为系统级优先级
   */
  isSystemLevel(): boolean {
    return this._value <= RolePriority.SYSTEM_ADMIN_PRIORITY;
  }

  /**
   * @method isTenantLevel
   * @description 检查是否为租户级优先级
   * @returns {boolean} 是否为租户级优先级
   */
  isTenantLevel(): boolean {
    return this._value > RolePriority.SYSTEM_ADMIN_PRIORITY &&
      this._value <= RolePriority.TENANT_ADMIN_PRIORITY;
  }

  /**
   * @method isOrgLevel
   * @description 检查是否为组织级优先级
   * @returns {boolean} 是否为组织级优先级
   */
  isOrgLevel(): boolean {
    return this._value > RolePriority.TENANT_ADMIN_PRIORITY &&
      this._value <= RolePriority.ORG_ADMIN_PRIORITY;
  }

  /**
   * @method isUserLevel
   * @description 检查是否为用户级优先级
   * @returns {boolean} 是否为用户级优先级
   */
  isUserLevel(): boolean {
    return this._value > RolePriority.ORG_ADMIN_PRIORITY &&
      this._value <= RolePriority.USER_PRIORITY;
  }

  /**
   * @method isGuestLevel
   * @description 检查是否为访客级优先级
   * @returns {boolean} 是否为访客级优先级
   */
  isGuestLevel(): boolean {
    return this._value > RolePriority.USER_PRIORITY;
  }

  /**
   * @method isHigherThan
   * @description 检查是否高于指定优先级
   * @param other 另一个优先级值对象
   * @returns {boolean} 是否高于指定优先级
   */
  isHigherThan(other: RolePriority): boolean {
    if (!other) {
      return false;
    }
    return this._value < other._value; // 数值越小优先级越高
  }

  /**
   * @method isLowerThan
   * @description 检查是否低于指定优先级
   * @param other 另一个优先级值对象
   * @returns {boolean} 是否低于指定优先级
   */
  isLowerThan(other: RolePriority): boolean {
    if (!other) {
      return false;
    }
    return this._value > other._value; // 数值越大优先级越低
  }

  /**
   * @method equals
   * @description 检查是否等于指定优先级
   * @param other 另一个优先级值对象
   * @returns {boolean} 是否等于指定优先级
   */
  equals(other: RolePriority): boolean {
    if (!other) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * @method validatePriority
   * @description 验证角色优先级
   * 
   * @param priority - 角色优先级
   * @returns 验证后的优先级
   * @throws Error 当优先级无效时
   */
  private validatePriority(priority: number): number {
    const validator = new RolePriorityValidator();
    validator.value = priority;

    const errors = validator.validateSync();
    if (errors && errors.length > 0) {
      const errorMessages = errors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new Error(errorMessages);
    }

    return validator.value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 角色优先级字符串
   */
  toString(): string {
    return this._value.toString();
  }

  /**
   * @static getDefault
   * @description 获取默认优先级
   * @returns {RolePriority} 默认优先级值对象
   */
  static getDefault(): RolePriority {
    return new RolePriority(RolePriority.DEFAULT_PRIORITY);
  }

  /**
   * @static getSystemAdmin
   * @description 获取系统管理员优先级
   * @returns {RolePriority} 系统管理员优先级值对象
   */
  static getSystemAdmin(): RolePriority {
    return new RolePriority(RolePriority.SYSTEM_ADMIN_PRIORITY);
  }

  /**
   * @static getTenantAdmin
   * @description 获取租户管理员优先级
   * @returns {RolePriority} 租户管理员优先级值对象
   */
  static getTenantAdmin(): RolePriority {
    return new RolePriority(RolePriority.TENANT_ADMIN_PRIORITY);
  }

  /**
   * @static getOrgAdmin
   * @description 获取组织管理员优先级
   * @returns {RolePriority} 组织管理员优先级值对象
   */
  static getOrgAdmin(): RolePriority {
    return new RolePriority(RolePriority.ORG_ADMIN_PRIORITY);
  }

  /**
   * @static getUser
   * @description 获取普通用户优先级
   * @returns {RolePriority} 普通用户优先级值对象
   */
  static getUser(): RolePriority {
    return new RolePriority(RolePriority.USER_PRIORITY);
  }

  /**
   * @static getGuest
   * @description 获取访客用户优先级
   * @returns {RolePriority} 访客用户优先级值对象
   */
  static getGuest(): RolePriority {
    return new RolePriority(RolePriority.GUEST_PRIORITY);
  }

  /**
   * @static fromNumber
   * @description 从数字创建RolePriority值对象
   */
  static fromNumber(value: number): RolePriority {
    return new RolePriority(value);
  }

  /**
   * @static isValid
   * @description 静态验证方法，使用class-validator验证角色优先级
   */
  static isValid(value: number): boolean {
    try {
      const validator = new RolePriorityValidator();
      validator.value = value;
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
  static validate(value: number): { isValid: boolean; errors: string[] } {
    try {
      const validator = new RolePriorityValidator();
      validator.value = value;
      const errors = validator.validateSync();

      if (!errors || errors.length === 0) {
        return { isValid: true, errors: [] };
      }

      const errorMessages = errors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      );
      return { isValid: false, errors: errorMessages };
    } catch (error) {
      return { isValid: false, errors: ['角色优先级验证失败'] };
    }
  }
}

/**
 * @class RolePriorityValidator
 * @description 用于class-validator验证的内部类
 */
class RolePriorityValidator {
  @IsNumber({}, { message: '角色优先级必须是数字' })
  @Min(1, { message: '角色优先级不能小于1' })
  @Max(1000, { message: '角色优先级不能大于1000' })
  value!: number;

  validateSync(): any[] {
    const { validateSync } = require('class-validator');
    return validateSync(this);
  }
} 