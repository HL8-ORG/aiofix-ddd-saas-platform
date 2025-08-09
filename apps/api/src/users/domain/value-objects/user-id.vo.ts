import { generateUuid, isValidUuidV4 } from '../../../shared/utils/uuid.util';

/**
 * @class UserIdRequiredException
 * @description 用户ID必需异常
 */
export class UserIdRequiredException extends Error {
  constructor() {
    super('User ID is required');
    this.name = 'UserIdRequiredException';
  }
}

/**
 * @class InvalidUserIdException
 * @description 无效用户ID异常
 */
export class InvalidUserIdException extends Error {
  constructor(id: string) {
    super(`Invalid user ID format: ${id}`);
    this.name = 'InvalidUserIdException';
  }
}

/**
 * @class UserId
 * @description
 * UserId值对象，用于表示用户的唯一标识符。
 * 
 * 主要特点：
 * 1. 不可变性：一旦创建，ID值不可改变
 * 2. UUID格式：使用UUID v4格式确保唯一性
 * 3. 格式验证：确保ID格式正确
 * 
 * 使用场景：
 * 1. 用户实体标识
 * 2. 用户关联关系
 * 3. 用户查找和索引
 */
export class UserId {
  /**
   * @private
   * @readonly
   * @description 存储用户ID值
   */
  private readonly value: string;

  /**
   * @constructor
   * @description
   * 创建UserId值对象。
   * 
   * @param {string} [id] - 用户ID，如果未提供则自动生成UUID
   * @throws {UserIdRequiredException} 当ID为空字符串时抛出
   * @throws {InvalidUserIdException} 当ID格式无效时抛出
   */
  constructor(id?: string) {
    if (id === '') {
      throw new UserIdRequiredException();
    }

    // 统一按 v4 校验，参考租户模块的约定
    if (id && !isValidUuidV4(id)) {
      throw new InvalidUserIdException(id);
    }

    // 统一使用工具函数生成 UUID v4
    this.value = id || generateUuid();
  }

  /**
   * @static
   * @method generate
   * @description 生成新的UserId
   * @returns {UserId} 新的UserId对象
   */
  static generate(): UserId {
    return new UserId();
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建UserId
   * @param {string} id - 用户ID字符串
   * @returns {UserId} UserId对象
   */
  static fromString(id: string): UserId {
    return new UserId(id);
  }

  /**
   * @method getValue
   * @description 获取用户ID值
   * @returns {string} 用户ID
   */
  getValue(): string {
    return this.value;
  }

  /**
   * @method equals
   * @description 比较两个UserId值对象是否相等
   * @param {UserId} other - 待比较的另一个UserId值对象
   * @returns {boolean} 如果ID相等返回true，否则返回false
   */
  equals(other: UserId): boolean {
    if (!(other instanceof UserId)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * @method toString
   * @description 将UserId值对象转换为字符串
   * @returns {string} 用户ID的字符串表示
   */
  toString(): string {
    return this.value;
  }
}
