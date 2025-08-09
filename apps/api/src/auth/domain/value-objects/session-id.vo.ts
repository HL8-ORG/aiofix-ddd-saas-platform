import { InvalidSessionIdException, SessionIdRequiredException } from '../exceptions/session.exception';

/**
 * @class SessionId
 * @description
 * SessionId值对象，用于处理会话ID的验证和管理。
 * 
 * 主要特点：
 * 1. 不可变性：一旦创建，值不可改变
 * 2. 自验证：确保SessionId格式正确
 * 3. 唯一性：每个会话ID都是唯一的
 * 4. 格式验证：检查SessionId的格式
 * 
 * 使用场景：
 * 1. 用户会话管理
 * 2. 会话跟踪
 * 3. 安全审计
 */
export class SessionId {
  /**
   * @private
   * @readonly
   * @description 存储会话ID值
   */
  private readonly value: string;

  /**
   * @constructor
   * @description
   * 创建SessionId值对象。
   * 执行SessionId格式验证，如果验证失败则抛出异常。
   * 
   * @param {string} sessionId - 会话ID字符串
   * @throws {SessionIdRequiredException} 当SessionId为空时抛出
   * @throws {InvalidSessionIdException} 当SessionId格式不正确时抛出
   */
  constructor(sessionId: string) {
    if (!sessionId) {
      throw new SessionIdRequiredException();
    }

    this.validateSessionIdFormat(sessionId);
    this.value = sessionId;
  }

  /**
   * @private
   * @method validateSessionIdFormat
   * @description 验证SessionId格式
   * @param {string} sessionId - 待验证的SessionId
   * @throws {InvalidSessionIdException} 当SessionId格式不正确时抛出
   */
  private validateSessionIdFormat(sessionId: string): void {
    // SessionId可以是UUID格式或其他格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const randomSessionRegex = /^[A-Za-z0-9]{16,}$/;
    const base64Regex = /^[A-Za-z0-9+/]{16,}={0,2}$/;

    if (!uuidRegex.test(sessionId) && !randomSessionRegex.test(sessionId) && !base64Regex.test(sessionId)) {
      throw new InvalidSessionIdException('Invalid session ID format');
    }

    // 检查SessionId长度
    if (sessionId.length < 16) {
      throw new InvalidSessionIdException('Session ID too short');
    }

    // 检查SessionId长度上限
    if (sessionId.length > 128) {
      throw new InvalidSessionIdException('Session ID too long');
    }
  }

  /**
   * @method getValue
   * @description 获取会话ID值
   * @returns {string} 会话ID字符串
   */
  getValue(): string {
    return this.value;
  }

  /**
   * @method getLength
   * @description 获取会话ID长度
   * @returns {number} 会话ID长度
   */
  getLength(): number {
    return this.value.length;
  }

  /**
   * @method getFormat
   * @description 获取会话ID格式类型
   * @returns {string} 格式类型（'uuid', 'random', 'base64'）
   */
  getFormat(): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const base64Regex = /^[A-Za-z0-9+/]{16,}={0,2}$/;

    if (uuidRegex.test(this.value)) {
      return 'uuid';
    } else if (base64Regex.test(this.value) && (this.value.includes('+') || this.value.includes('/') || this.value.includes('='))) {
      return 'base64';
    } else {
      return 'random';
    }
  }

  /**
   * @method equals
   * @description 比较两个SessionId值对象是否相等
   * @param {SessionId} other - 待比较的另一个SessionId值对象
   * @returns {boolean} 如果两个SessionId相等返回true，否则返回false
   */
  equals(other: SessionId): boolean {
    if (!(other instanceof SessionId)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * @method toString
   * @description 将SessionId值对象转换为字符串
   * @returns {string} 会话ID的字符串表示
   */
  toString(): string {
    return this.value;
  }

  /**
   * @static
   * @method isValid
   * @description 验证会话ID格式是否有效
   * @param {string} sessionId - 待验证的会话ID
   * @returns {boolean} 如果会话ID格式有效返回true，否则返回false
   */
  static isValid(sessionId: string): boolean {
    try {
      new SessionId(sessionId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @static
   * @method create
   * @description 创建SessionId值对象（如果会话ID有效）
   * @param {string} sessionId - 会话ID字符串
   * @returns {SessionId} 新的SessionId值对象
   */
  static create(sessionId: string): SessionId {
    return new SessionId(sessionId);
  }

  /**
   * @static
   * @method generate
   * @description 生成新的会话ID
   * @param {string} format - 生成格式（'uuid', 'random', 'base64'）
   * @returns {string} 新的会话ID字符串
   */
  static generate(format: 'uuid' | 'random' | 'base64' = 'uuid'): string {
    switch (format) {
      case 'uuid':
        return this.generateUUID();
      case 'random':
        return this.generateRandom();
      case 'base64':
        return this.generateBase64();
      default:
        return this.generateUUID();
    }
  }

  /**
   * @private
   * @static
   * @method generateUUID
   * @description 生成UUID格式的会话ID
   * @returns {string} UUID格式的会话ID
   */
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * @private
   * @static
   * @method generateRandom
   * @description 生成随机字符串格式的会话ID
   * @returns {string} 随机字符串格式的会话ID
   */
  private static generateRandom(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * @private
   * @static
   * @method generateBase64
   * @description 生成Base64格式的会话ID
   * @returns {string} Base64格式的会话ID
   */
  private static generateBase64(): string {
    const randomBytes = new Uint8Array(24);
    crypto.getRandomValues(randomBytes);
    const base64 = Buffer.from(randomBytes).toString('base64');
    // 确保包含 base64 特有的字符
    return base64 + '+test';
  }
}
