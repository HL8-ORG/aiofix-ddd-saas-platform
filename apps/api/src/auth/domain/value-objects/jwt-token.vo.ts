import { InvalidTokenException, TokenExpiredException, TokenRequiredException } from '../exceptions/token.exception';

/**
 * @class JWTToken
 * @description
 * JWT Token值对象，用于处理JWT令牌的验证和管理。
 * 
 * 主要特点：
 * 1. 不可变性：一旦创建，值不可改变
 * 2. 自验证：确保Token格式正确
 * 3. 过期检查：验证Token是否过期
 * 4. 格式验证：检查Token的JWT格式
 * 
 * 使用场景：
 * 1. 用户认证Token管理
 * 2. API访问Token验证
 * 3. 会话Token处理
 */
export class JWTToken {
  /**
   * @private
   * @readonly
   * @description 存储JWT Token值
   */
  private readonly value: string;

  /**
   * @private
   * @readonly
   * @description Token过期时间
   */
  private readonly expiresAt: Date;

  /**
   * @private
   * @readonly
   * @description Token签发时间
   */
  private readonly issuedAt: Date;

  /**
   * @constructor
   * @description
   * 创建JWTToken值对象。
   * 执行Token格式验证，如果验证失败则抛出异常。
   * 
   * @param {string} token - JWT Token字符串
   * @throws {TokenRequiredException} 当Token为空时抛出
   * @throws {InvalidTokenException} 当Token格式不正确时抛出
   * @throws {TokenExpiredException} 当Token已过期时抛出
   */
  constructor(token: string) {
    if (!token) {
      throw new TokenRequiredException();
    }

    this.validateTokenFormat(token);
    this.value = token;

    // 解析Token获取时间信息
    const tokenData = this.parseToken(token);
    this.issuedAt = new Date(tokenData.iat * 1000);
    this.expiresAt = new Date(tokenData.exp * 1000);

    // 检查Token是否过期
    if (this.isExpired()) {
      throw new TokenExpiredException();
    }
  }

  /**
   * @private
   * @method validateTokenFormat
   * @description 验证Token格式是否符合JWT标准
   * @param {string} token - 待验证的Token
   * @throws {InvalidTokenException} 当Token格式不正确时抛出
   */
  private validateTokenFormat(token: string): void {
    // JWT格式：header.payload.signature
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;

    if (!jwtRegex.test(token)) {
      throw new InvalidTokenException('Invalid JWT format');
    }

    // 检查Token长度（JWT通常至少50个字符）
    if (token.length < 50) {
      throw new InvalidTokenException('Token too short');
    }
  }

  /**
   * @private
   * @method parseToken
   * @description 解析JWT Token获取payload信息
   * @param {string} token - JWT Token
   * @returns {any} Token的payload信息
   * @throws {InvalidTokenException} 当Token解析失败时抛出
   */
  private parseToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new InvalidTokenException('Invalid JWT structure');
      }

      const payload = parts[1];
      const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
      return JSON.parse(decodedPayload);
    } catch (error) {
      throw new InvalidTokenException('Failed to parse JWT token');
    }
  }

  /**
   * @method getValue
   * @description 获取JWT Token值
   * @returns {string} JWT Token字符串
   */
  getValue(): string {
    return this.value;
  }

  /**
   * @method getExpiresAt
   * @description 获取Token过期时间
   * @returns {Date} 过期时间
   */
  getExpiresAt(): Date {
    return this.expiresAt;
  }

  /**
   * @method getIssuedAt
   * @description 获取Token签发时间
   * @returns {Date} 签发时间
   */
  getIssuedAt(): Date {
    return this.issuedAt;
  }

  /**
   * @method isExpired
   * @description 检查Token是否已过期
   * @returns {boolean} 如果Token已过期返回true，否则返回false
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * @method getTimeToExpiry
   * @description 获取Token距离过期的剩余时间（毫秒）
   * @returns {number} 剩余时间（毫秒），如果已过期返回负数
   */
  getTimeToExpiry(): number {
    return this.expiresAt.getTime() - new Date().getTime();
  }

  /**
   * @method getTokenType
   * @description 获取Token类型（从payload中提取）
   * @returns {string} Token类型
   */
  getTokenType(): string {
    const payload = this.parseToken(this.value);
    return payload.type || 'access';
  }

  /**
   * @method getUserId
   * @description 获取Token关联的用户ID
   * @returns {string} 用户ID
   */
  getUserId(): string {
    const payload = this.parseToken(this.value);
    return payload.sub || payload.userId;
  }

  /**
   * @method getTenantId
   * @description 获取Token关联的租户ID
   * @returns {string} 租户ID
   */
  getTenantId(): string {
    const payload = this.parseToken(this.value);
    return payload.tenantId || payload.tid;
  }

  /**
   * @method equals
   * @description 比较两个JWTToken值对象是否相等
   * @param {JWTToken} other - 待比较的另一个JWTToken值对象
   * @returns {boolean} 如果两个Token相等返回true，否则返回false
   */
  equals(other: JWTToken): boolean {
    if (!(other instanceof JWTToken)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * @method toString
   * @description 将JWTToken值对象转换为字符串
   * @returns {string} JWT Token的字符串表示
   */
  toString(): string {
    return this.value;
  }

  /**
   * @static
   * @method isValid
   * @description 验证JWT Token格式是否有效
   * @param {string} token - 待验证的Token
   * @returns {boolean} 如果Token格式有效返回true，否则返回false
   */
  static isValid(token: string): boolean {
    try {
      new JWTToken(token);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @static
   * @method create
   * @description 创建JWTToken值对象（如果Token有效）
   * @param {string} token - JWT Token字符串
   * @returns {JWTToken} 新的JWTToken值对象
   */
  static create(token: string): JWTToken {
    return new JWTToken(token);
  }
}
