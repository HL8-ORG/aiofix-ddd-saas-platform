/**
 * @class InvalidPhoneNumberException
 * @description
 * 表示无效的手机号异常。当手机号不符合格式要求时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 手机号格式不正确
 * 2. 手机号不符合指定国家/地区的格式规范
 * 3. 手机号包含非法字符
 */
export class InvalidPhoneNumberException extends Error {
  constructor(phoneNumber: string, reason?: string) {
    const message = reason
      ? `Invalid phone number '${phoneNumber}': ${reason}`
      : `Invalid phone number format: ${phoneNumber}`;
    super(message);
    this.name = 'InvalidPhoneNumberException';
  }
}

/**
 * @class PhoneNumberRequiredException
 * @description
 * 表示必需的手机号缺失异常。当需要手机号但未提供时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 创建用户时未提供手机号（当手机号为必填项时）
 * 2. 手机验证流程中缺少手机号
 */
export class PhoneNumberRequiredException extends Error {
  constructor() {
    super('Phone number is required');
    this.name = 'PhoneNumberRequiredException';
  }
}

/**
 * @class UnsupportedCountryCodeException
 * @description
 * 表示不支持的国家代码异常。当提供的国家代码不被支持时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 提供了无效的国家代码
 * 2. 系统不支持某个国家/地区的手机号格式
 */
export class UnsupportedCountryCodeException extends Error {
  constructor(countryCode: string) {
    super(`Unsupported country code: ${countryCode}`);
    this.name = 'UnsupportedCountryCodeException';
  }
}

/**
 * @class PhoneNumberParsingException
 * @description
 * 表示手机号解析异常。当手机号无法被正确解析时抛出此异常。
 * 
 * 主要用于以下场景：
 * 1. 手机号格式混乱，无法解析
 * 2. 手机号中包含无法识别的字符或格式
 */
export class PhoneNumberParsingException extends Error {
  constructor(phoneNumber: string) {
    super(`Unable to parse phone number: ${phoneNumber}`);
    this.name = 'PhoneNumberParsingException';
  }
}
