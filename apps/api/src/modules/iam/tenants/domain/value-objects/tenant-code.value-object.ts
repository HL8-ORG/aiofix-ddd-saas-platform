import { IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { Expose } from 'class-transformer';
import { normalizeIdentifier, validateIdentifier } from '../../../../../shared/domain/utils/identifier.util';

/**
 * @class TenantCode
 * @description
 * 租户编码值对象，封装租户编码的业务规则和约束。
 * 使用shared层的identifier.util工具进行标准化和校验。
 * 
 * 主要原理与机制：
 * 1. 值对象是不可变的，一旦创建就不能修改
 * 2. 通过构造函数确保数据的有效性
 * 3. 使用shared层的通用工具进行标准化和校验
 * 4. 提供编码的标准化处理
 * 5. 实现值对象的相等性比较
 */
export class TenantCode {
  /**
   * @property value
   * @description 租户编码的实际值
   */
  @IsNotEmpty({ message: '租户编码不能为空' })
  @IsString({ message: '租户编码必须是字符串' })
  @MinLength(3, { message: '租户编码至少3个字符' })
  @MaxLength(50, { message: '租户编码不能超过50个字符' })
  @Matches(/^[a-z0-9_-]+$/, { message: '租户编码只能包含小写字母、数字、下划线和连字符' })
  @Expose()
  private readonly _value: string;

  /**
   * @constructor
   * @description 创建租户编码值对象
   * @param value 租户编码值
   * @throws {Error} 当编码不符合业务规则时抛出异常
   */
  constructor(value: string) {
    // 使用shared层的工具进行标准化和校验
    this._value = normalizeIdentifier(value);
    validateIdentifier(this._value, {
      minLength: 3,
      maxLength: 50,
      allowConsecutiveHyphens: false, // 不允许连续连字符
      errorPrefix: '租户编码'
    });
  }

  /**
   * @method get value
   * @description 获取租户编码值
   * @returns {string} 租户编码
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 返回租户编码的字符串表示
   * @returns {string} 租户编码
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个租户编码是否相等
   * @param other 另一个租户编码值对象
   * @returns {boolean} 如果相等返回true，否则返回false
   */
  equals(other: TenantCode): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  /**
   * @method toUpperCase
   * @description 返回大写的租户编码
   * @returns {string} 大写的租户编码
   */
  toUpperCase(): string {
    return this._value.toUpperCase();
  }

  /**
   * @method toLowerCase
   * @description 返回小写的租户编码
   * @returns {string} 小写的租户编码
   */
  toLowerCase(): string {
    return this._value.toLowerCase();
  }

  /**
   * @method toSlug
   * @description 将编码转换为URL友好的格式
   * @returns {string} URL友好的编码格式
   */
  toSlug(): string {
    return this._value.replace(/_/g, '-');
  }
} 