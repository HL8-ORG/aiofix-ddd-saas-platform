import * as bcrypt from 'bcrypt';
import {
  InvalidPasswordException,
  PasswordRequiredException,
  PasswordTooWeakException,
  PasswordHashingException,
} from '../exceptions/password.exception';

/**
 * @class Password
 * @description
 * Password值对象，用于处理密码的验证、哈希和比较。
 * 
 * 主要特点：
 * 1. 不可变性：一旦创建，值不可改变
 * 2. 自验证：确保密码符合安全要求
 * 3. 安全性：使用bcrypt进行密码哈希
 * 4. 密码强度检查：确保密码符合复杂度要求
 * 
 * 使用场景：
 * 1. 用户注册时的密码处理
 * 2. 密码重置
 * 3. 密码验证
 */
export class Password {
  /**
   * @private
   * @readonly
   * @description 存储密码哈希值
   */
  private readonly hash: string;

  /**
   * 密码最小长度要求
   */
  private static readonly MIN_LENGTH = 8;

  /**
   * 密码最大长度要求
   */
  private static readonly MAX_LENGTH = 100;

  /**
   * bcrypt加密的轮数
   */
  private static readonly SALT_ROUNDS = 12;

  /**
   * @constructor
   * @description
   * 创建Password值对象。
   * 如果提供的是明文密码，则进行验证和哈希处理；
   * 如果提供的是哈希值，则直接存储。
   * 
   * @param {string} password - 密码明文或哈希值
   * @param {boolean} isHashed - 标识提供的密码是否已经是哈希值
   * @throws {PasswordRequiredException} 当密码为空时抛出
   * @throws {InvalidPasswordException} 当密码格式无效时抛出
   * @throws {PasswordTooWeakException} 当密码强度不足时抛出
   * @throws {PasswordHashingException} 当密码哈希处理失败时抛出
   */
  private constructor(password: string, isHashed: boolean = false) {
    if (!password) {
      throw new PasswordRequiredException();
    }

    if (isHashed) {
      this.hash = password;
    } else {
      this.validatePassword(password);
      this.hash = this.hashPassword(password);
    }
  }

  /**
   * @static
   * @method create
   * @description 创建新的Password值对象（用于处理明文密码）
   * @param {string} password - 明文密码
   * @returns {Password} 新的Password值对象
   */
  static create(password: string): Password {
    return new Password(password, false);
  }

  /**
   * @static
   * @method createFromHash
   * @description 从哈希值创建Password值对象（用于从数据库加载已有密码）
   * @param {string} hash - 密码哈希值
   * @returns {Password} 新的Password值对象
   */
  static createFromHash(hash: string): Password {
    return new Password(hash, true);
  }

  /**
   * @private
   * @method validatePassword
   * @description
   * 验证密码是否符合安全要求：
   * 1. 长度检查
   * 2. 复杂度检查（必须包含大小写字母、数字和特殊字符）
   * 3. 常见密码检查
   * 
   * @param {string} password - 待验证的密码
   * @throws {InvalidPasswordException} 当密码格式无效时抛出
   * @throws {PasswordTooWeakException} 当密码强度不足时抛出
   */
  private validatePassword(password: string): void {
    // 长度检查
    if (password.length < Password.MIN_LENGTH || password.length > Password.MAX_LENGTH) {
      throw new InvalidPasswordException(
        `Password length must be between ${Password.MIN_LENGTH} and ${Password.MAX_LENGTH} characters`
      );
    }

    // 复杂度检查
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new PasswordTooWeakException(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    }

    // 常见密码检查（这里可以集成常见密码字典检查）
    const commonPasswords = ['Password123!', 'Admin123!', 'Welcome123!']; // 示例，实际应该使用更完整的列表
    if (commonPasswords.includes(password)) {
      throw new PasswordTooWeakException('Password is too common');
    }
  }

  /**
   * @private
   * @method hashPassword
   * @description 使用bcrypt对密码进行哈希处理
   * @param {string} password - 待哈希的密码
   * @returns {string} 密码的哈希值
   * @throws {PasswordHashingException} 当哈希处理失败时抛出
   */
  private hashPassword(password: string): string {
    try {
      return bcrypt.hashSync(password, Password.SALT_ROUNDS);
    } catch (error) {
      throw new PasswordHashingException('Failed to hash password');
    }
  }

  /**
   * @method getHash
   * @description 获取密码的哈希值
   * @returns {string} 密码哈希值
   */
  getHash(): string {
    return this.hash;
  }

  /**
   * @method verify
   * @description 验证明文密码是否匹配
   * @param {string} plainPassword - 待验证的明文密码
   * @returns {boolean} 如果密码匹配返回true，否则返回false
   * @throws {PasswordHashingException} 当验证过程发生错误时抛出
   */
  verify(plainPassword: string): boolean {
    try {
      return bcrypt.compareSync(plainPassword, this.hash);
    } catch (error) {
      throw new PasswordHashingException('Failed to verify password');
    }
  }

  /**
   * @method equals
   * @description 比较两个Password值对象是否相等
   * @param {Password} other - 待比较的另一个Password值对象
   * @returns {boolean} 如果两个密码哈希相等返回true，否则返回false
   */
  equals(other: Password): boolean {
    if (!(other instanceof Password)) {
      return false;
    }
    return this.hash === other.hash;
  }
}
