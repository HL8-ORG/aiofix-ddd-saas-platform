import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ValueObject } from '@/shared/domain/value-objects/value-object.base';

/**
 * @class RoleCode
 * @description
 * 角色代码值对象，使用class-validator库进行严格的角色代码验证。
 * 
 * 主要特性：
 * 1. 使用class-validator的装饰器进行验证
 * 2. 提供代码规范化处理，统一为大写格式
 * 3. 支持系统级角色代码的标准化命名
 * 4. 实现值对象的相等性比较
 * 5. 支持显示信息和描述
 * 
 * 验证规则：
 * - 长度：3-20个字符
 * - 格式：大写字母、数字、下划线
 * - 必须以字母开头
 * - 不能包含连续的下划线
 * - 不能以下划线结尾
 */
export class RoleCode extends ValueObject<string> {
  constructor(value: string) {
    super();
    this._value = this.validateCode(value);
  }

  /**
   * @method validateCode
   * @description 验证角色代码
   * 
   * @param code - 角色代码
   * @returns 验证后的角色代码
   * @throws Error 当角色代码无效时
   */
  private validateCode(code: string): string {
    const validator = new RoleCodeValidator();
    validator.value = this.normalizeCode(code);

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
   * @method normalizeCode
   * @description 规范化角色代码
   * 
   * @param code - 原始角色代码
   * @returns 规范化后的角色代码
   */
  private normalizeCode(code: string): string {
    if (!code) {
      throw new Error('角色代码不能为空');
    }

    // 去除前后空格
    let normalized = code.trim();

    // 转换为大写
    normalized = normalized.toUpperCase();

    // 将多个连续下划线替换为单个下划线
    normalized = normalized.replace(/_+/g, '_');

    // 去除首尾的下划线
    normalized = normalized.replace(/^_+|_+$/g, '');

    return normalized;
  }

  /**
   * @method getValue
   * @description 获取角色代码值
   */
  getValue(): string {
    return this._value;
  }

  /**
   * @method getDisplayCode
   * @description 获取角色代码显示值
   */
  getDisplayCode(): string {
    return this._value;
  }

  /**
   * @method getShortCode
   * @description 获取角色代码的简短版本（最多15个字符）
   */
  getShortCode(): string {
    return this._value.length > 15 ? this._value.substring(0, 15) + '...' : this._value;
  }

  /**
   * @method isSystemCode
   * @description 检查是否为系统角色代码
   */
  isSystemCode(): boolean {
    const systemCodes = [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'ORG_ADMIN',
      'USER',
      'GUEST',
      'SYSTEM_ADMIN',
      'APP_ADMIN',
      'FUNCTION_ADMIN'
    ];
    return systemCodes.includes(this._value);
  }

  /**
   * @method isDefaultCode
   * @description 检查是否为默认角色代码
   */
  isDefaultCode(): boolean {
    const defaultCodes = [
      'USER',
      'GUEST'
    ];
    return defaultCodes.includes(this._value);
  }

  /**
   * @method equals
   * @description 比较两个角色代码是否相等
   */
  equals(other: RoleCode): boolean {
    if (!(other instanceof RoleCode)) {
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
   * @description 从字符串创建RoleCode值对象
   */
  static fromString(value: string): RoleCode {
    return new RoleCode(value);
  }

  /**
   * @static isValid
   * @description 静态验证方法，使用class-validator验证角色代码
   */
  static isValid(value: string): boolean {
    try {
      const validator = new RoleCodeValidator();
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
  static validate(value: string): { isValid: boolean; errors: string[] } {
    try {
      const validator = new RoleCodeValidator();
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
      return { isValid: false, errors: ['角色代码验证失败'] };
    }
  }
}

/**
 * @class RoleCodeValidator
 * @description 用于class-validator验证的内部类
 */
class RoleCodeValidator {
  @IsString({ message: '角色代码必须是字符串' })
  @IsNotEmpty({ message: '角色代码不能为空' })
  @Length(3, 20, { message: '角色代码长度必须在3-20个字符之间' })
  @Matches(/^[A-Z]/, { message: '角色代码必须以字母开头' })
  @Matches(/^[A-Z0-9_]+$/, { message: '角色代码只能包含大写字母、数字和下划线' })
  @Matches(/^(?!.*_{2,})/, { message: '角色代码不能包含连续的下划线' })
  @Matches(/^(?!.*_$)/, { message: '角色代码不能以下划线结尾' })
  value!: string;

  validateSync(): any[] {
    const { validateSync } = require('class-validator');
    return validateSync(this);
  }
} 