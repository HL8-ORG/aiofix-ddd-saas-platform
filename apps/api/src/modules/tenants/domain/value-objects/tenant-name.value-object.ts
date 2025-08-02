import { IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

/**
 * @class TenantName
 * @description
 * 租户名称值对象，封装租户名称的业务规则和约束。
 * 
 * 主要原理与机制：
 * 1. 值对象是不可变的，一旦创建就不能修改
 * 2. 通过构造函数确保数据的有效性
 * 3. 提供名称的标准化处理（去除首尾空格、规范化空格）
 * 4. 实现值对象的相等性比较
 * 5. 支持多语言字符（中文、英文、数字等）
 */
export class TenantName {
  /**
   * @property value
   * @description 租户名称的实际值
   */
  @IsNotEmpty({ message: '租户名称不能为空' })
  @IsString({ message: '租户名称必须是字符串' })
  @MinLength(2, { message: '租户名称至少2个字符' })
  @MaxLength(100, { message: '租户名称不能超过100个字符' })
  @Matches(/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_()（）]+$/, {
    message: '租户名称只能包含中文、英文、数字、空格、连字符、下划线和括号'
  })
  @Expose()
  private readonly _value: string;

  /**
   * @constructor
   * @description 创建租户名称值对象
   * @param value 租户名称值
   * @throws {Error} 当名称不符合业务规则时抛出异常
   */
  constructor(value: string) {
    // 标准化处理：去除首尾空格，规范化空格
    this._value = this.normalizeName(value);
    this.validateName(this._value);
  }

  /**
   * @method get value
   * @description 获取租户名称值
   * @returns {string} 租户名称
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 返回租户名称的字符串表示
   * @returns {string} 租户名称
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个租户名称是否相等
   * @param other 另一个租户名称值对象
   * @returns {boolean} 如果相等返回true，否则返回false
   */
  equals(other: TenantName): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  /**
   * @method toUpperCase
   * @description 返回大写的租户名称
   * @returns {string} 大写的租户名称
   */
  toUpperCase(): string {
    return this._value.toUpperCase();
  }

  /**
   * @method toLowerCase
   * @description 返回小写的租户名称
   * @returns {string} 小写的租户名称
   */
  toLowerCase(): string {
    return this._value.toLowerCase();
  }

  /**
   * @method getDisplayName
   * @description 获取显示名称（首字母大写）
   * @returns {string} 格式化的显示名称
   */
  getDisplayName(): string {
    return this._value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * @method getShortName
   * @description 获取短名称（取前20个字符）
   * @returns {string} 短名称
   */
  getShortName(): string {
    return this._value.length > 20 ? this._value.substring(0, 20) + '...' : this._value;
  }

  /**
   * @method normalizeName
   * @description 标准化租户名称
   * @param name 原始名称
   * @returns {string} 标准化后的名称
   */
  private normalizeName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
      .replace(/（/g, '(') // 将中文左括号替换为英文左括号
      .replace(/）/g, ')'); // 将中文右括号替换为英文右括号
  }

  /**
   * @method validateName
   * @description 校验租户名称的合法性
   * @param name 名称字符串
   * @throws {Error} 校验不通过时抛出异常
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('租户名称不能为空');
    }

    if (name.length < 2) {
      throw new Error('租户名称至少需要2个字符');
    }

    if (name.length > 100) {
      throw new Error('租户名称不能超过100个字符');
    }

    // 校验字符集：中文、英文、数字、空格、连字符、下划线、括号
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_()（）]+$/.test(name)) {
      throw new Error('租户名称只能包含中文、英文、数字、空格、连字符、下划线和括号');
    }

    // 校验不能只包含空格
    if (/^\s+$/.test(name)) {
      throw new Error('租户名称不能只包含空格');
    }

    // 校验不能以空格开头或结尾
    if (name.startsWith(' ') || name.endsWith(' ')) {
      throw new Error('租户名称不能以空格开头或结尾');
    }
  }
} 