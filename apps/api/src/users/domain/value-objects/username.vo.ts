import {
  InvalidUsernameException,
  UsernameRequiredException,
  UsernameTooShortException,
  UsernameTooLongException,
  UsernameContainsInvalidCharactersException,
  UsernameReservedException,
} from '../exceptions/username.exception';

/**
 * @class UserName
 * @description
 * UserName值对象，用于表示和验证用户名。
 * 
 * 主要特点：
 * 1. 不可变性：一旦创建，值不可改变
 * 2. 自验证：确保用户名符合规范
 * 3. 格式验证：检查长度和字符合法性
 * 4. 保留字检查：防止使用系统保留的用户名
 * 
 * 使用场景：
 * 1. 用户注册时的用户名验证
 * 2. 用户信息更新时的用户名验证
 * 3. 用户搜索和展示
 */
export class UserName {
  /**
   * @private
   * @readonly
   * @description 存储用户名的值
   */
  private readonly value: string;

  /**
   * 用户名最小长度
   */
  private static readonly MIN_LENGTH = 3;

  /**
   * 用户名最大长度
   */
  private static readonly MAX_LENGTH = 50;

  /**
   * 系统保留的用户名列表
   */
  private static readonly RESERVED_USERNAMES = [
    'admin',
    'administrator',
    'system',
    'root',
    'superuser',
    'support',
    'help',
    'info',
    'webmaster',
    'postmaster',
    'mail',
    'www',
    'api',
    'dev',
    'test',
    'demo',
  ];

  /**
   * @constructor
   * @description
   * 创建UserName值对象。
   * 执行用户名格式验证，如果验证失败则抛出异常。
   * 
   * @param {string} username - 用户名
   * @throws {UsernameRequiredException} 当用户名为空时抛出
   * @throws {UsernameTooShortException} 当用户名长度小于最小长度时抛出
   * @throws {UsernameTooLongException} 当用户名长度超过最大长度时抛出
   * @throws {UsernameContainsInvalidCharactersException} 当用户名包含非法字符时抛出
   * @throws {UsernameReservedException} 当用户名是系统保留词时抛出
   */
  constructor(username: string) {
    if (!username) {
      throw new UsernameRequiredException();
    }

    this.validateLength(username);
    this.validateCharacters(username);
    this.validateReservedNames(username);

    this.value = username.toLowerCase();
  }

  /**
   * @private
   * @method validateLength
   * @description 验证用户名长度是否符合要求
   * @param {string} username - 待验证的用户名
   * @throws {UsernameTooShortException} 当用户名长度小于最小长度时抛出
   * @throws {UsernameTooLongException} 当用户名长度超过最大长度时抛出
   */
  private validateLength(username: string): void {
    if (username.length < UserName.MIN_LENGTH) {
      throw new UsernameTooShortException(UserName.MIN_LENGTH);
    }
    if (username.length > UserName.MAX_LENGTH) {
      throw new UsernameTooLongException(UserName.MAX_LENGTH);
    }
  }

  /**
   * @private
   * @method validateCharacters
   * @description 验证用户名是否只包含合法字符
   * @param {string} username - 待验证的用户名
   * @throws {UsernameContainsInvalidCharactersException} 当用户名包含非法字符时抛出
   */
  private validateCharacters(username: string): void {
    // 只允许字母、数字、点号、连字符和下划线
    const validCharactersRegex = /^[a-zA-Z0-9._-]+$/;
    if (!validCharactersRegex.test(username)) {
      throw new UsernameContainsInvalidCharactersException();
    }

    // 不允许连续的点号、连字符或下划线
    if (/[._-]{2,}/.test(username)) {
      throw new UsernameContainsInvalidCharactersException();
    }

    // 不允许以点号、连字符或下划线开头或结尾
    if (/^[._-]|[._-]$/.test(username)) {
      throw new UsernameContainsInvalidCharactersException();
    }
  }

  /**
   * @private
   * @method validateReservedNames
   * @description 验证用户名是否是系统保留词
   * @param {string} username - 待验证的用户名
   * @throws {UsernameReservedException} 当用户名是系统保留词时抛出
   */
  private validateReservedNames(username: string): void {
    const lowercaseUsername = username.toLowerCase();
    if (UserName.RESERVED_USERNAMES.includes(lowercaseUsername)) {
      throw new UsernameReservedException(username);
    }
  }

  /**
   * @method getValue
   * @description 获取用户名的值
   * @returns {string} 用户名
   */
  getValue(): string {
    return this.value;
  }

  /**
   * @method equals
   * @description 比较两个UserName值对象是否相等
   * @param {UserName} other - 待比较的另一个UserName值对象
   * @returns {boolean} 如果两个用户名相等返回true，否则返回false
   */
  equals(other: UserName): boolean {
    if (!(other instanceof UserName)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * @method toString
   * @description 将UserName值对象转换为字符串
   * @returns {string} 用户名的字符串表示
   */
  toString(): string {
    return this.value;
  }
}
