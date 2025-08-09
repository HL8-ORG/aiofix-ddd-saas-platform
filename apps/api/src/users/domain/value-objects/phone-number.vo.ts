import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import {
  InvalidPhoneNumberException,
  PhoneNumberRequiredException,
  UnsupportedCountryCodeException,
  PhoneNumberParsingException,
} from '../exceptions/phone-number.exception';

/**
 * @class PhoneNumber
 * @description
 * PhoneNumber值对象，用于表示和验证手机号码。
 * 支持国际化格式，使用libphonenumber-js库进行验证和格式化。
 * 
 * 主要特点：
 * 1. 不可变性：一旦创建，值不可改变
 * 2. 国际化支持：支持全球各国的手机号格式
 * 3. 自动格式化：统一格式化为E.164标准格式
 * 4. 严格验证：确保手机号的有效性
 * 
 * 使用场景：
 * 1. 用户注册时的手机号验证
 * 2. 短信验证码发送
 * 3. 用户联系方式管理
 */
export class PhoneNumber {
  /**
   * @private
   * @readonly
   * @description 存储标准化的手机号（E.164格式）
   */
  private readonly value: string;

  /**
   * @private
   * @readonly
   * @description 存储国家代码
   */
  private readonly countryCode: CountryCode;

  /**
   * @private
   * @readonly
   * @description 存储国际拨号格式的手机号
   */
  private readonly internationalFormat: string;

  /**
   * @private
   * @readonly
   * @description 存储国内拨号格式的手机号
   */
  private readonly nationalFormat: string;

  /**
   * @constructor
   * @description
   * 创建PhoneNumber值对象。
   * 解析和验证手机号，如果验证失败则抛出异常。
   * 
   * @param {string} phoneNumber - 手机号码（可以是各种格式）
   * @param {CountryCode} [defaultCountryCode] - 默认国家代码（当手机号没有国家代码时使用）
   * @throws {PhoneNumberRequiredException} 当手机号为空时抛出
   * @throws {PhoneNumberParsingException} 当手机号无法解析时抛出
   * @throws {InvalidPhoneNumberException} 当手机号格式无效时抛出
   * @throws {UnsupportedCountryCodeException} 当国家代码不支持时抛出
   */
  constructor(phoneNumber: string, defaultCountryCode?: CountryCode) {
    if (!phoneNumber) {
      throw new PhoneNumberRequiredException();
    }

    try {
      // 解析手机号
      const parsedNumber = parsePhoneNumber(phoneNumber, defaultCountryCode);

      if (!parsedNumber) {
        throw new PhoneNumberParsingException(phoneNumber);
      }

      // 验证手机号的有效性
      if (!parsedNumber.isValid()) {
        throw new InvalidPhoneNumberException(phoneNumber, 'Phone number is not valid');
      }

      // 放宽验证条件，接受更多类型的号码
      // 只拒绝明确是固定电话的号码
      if (parsedNumber.getType() === 'FIXED_LINE') {
        throw new InvalidPhoneNumberException(phoneNumber, 'Number is not a mobile phone');
      }

      // 存储各种格式
      this.value = parsedNumber.number; // E.164格式
      this.countryCode = parsedNumber.country as CountryCode;
      this.internationalFormat = parsedNumber.formatInternational();
      this.nationalFormat = parsedNumber.formatNational();

    } catch (error) {
      if (error instanceof PhoneNumberRequiredException ||
        error instanceof PhoneNumberParsingException ||
        error instanceof InvalidPhoneNumberException) {
        throw error;
      }

      // 处理libphonenumber-js抛出的其他异常
      throw new PhoneNumberParsingException(phoneNumber);
    }
  }

  /**
   * @static
   * @method isValid
   * @description 验证手机号是否有效
   * @param {string} phoneNumber - 待验证的手机号
   * @param {CountryCode} [defaultCountryCode] - 默认国家代码
   * @returns {boolean} 如果手机号有效返回true，否则返回false
   */
  static isValid(phoneNumber: string, defaultCountryCode?: CountryCode): boolean {
    try {
      return isValidPhoneNumber(phoneNumber, defaultCountryCode);
    } catch {
      return false;
    }
  }

  /**
   * @method getValue
   * @description 获取E.164格式的手机号
   * @returns {string} E.164格式的手机号
   */
  getValue(): string {
    return this.value;
  }

  /**
   * @method getCountryCode
   * @description 获取国家代码
   * @returns {CountryCode} 国家代码
   */
  getCountryCode(): CountryCode {
    return this.countryCode;
  }

  /**
   * @method getInternationalFormat
   * @description 获取国际拨号格式的手机号
   * @returns {string} 国际拨号格式的手机号
   */
  getInternationalFormat(): string {
    return this.internationalFormat;
  }

  /**
   * @method getNationalFormat
   * @description 获取国内拨号格式的手机号
   * @returns {string} 国内拨号格式的手机号
   */
  getNationalFormat(): string {
    return this.nationalFormat;
  }

  /**
   * @method equals
   * @description 比较两个PhoneNumber值对象是否相等
   * @param {PhoneNumber} other - 待比较的另一个PhoneNumber值对象
   * @returns {boolean} 如果两个手机号相等返回true，否则返回false
   */
  equals(other: PhoneNumber): boolean {
    if (!(other instanceof PhoneNumber)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * @method toString
   * @description 将PhoneNumber值对象转换为字符串（E.164格式）
   * @returns {string} E.164格式的手机号
   */
  toString(): string {
    return this.value;
  }

  /**
   * @method toDisplayFormat
   * @description 获取适合显示的格式化手机号
   * @param {'international' | 'national'} format - 显示格式类型
   * @returns {string} 格式化后的手机号
   */
  toDisplayFormat(format: 'international' | 'national' = 'international'): string {
    return format === 'international' ? this.internationalFormat : this.nationalFormat;
  }
}
