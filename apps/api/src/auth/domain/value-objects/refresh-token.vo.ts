import { InvalidTokenException, TokenExpiredException, TokenRequiredException } from '../exceptions/token.exception';

/**
 * @class RefreshToken
 * @description
 * RefreshToken值对象，用于处理刷新令牌的验证和管理。
 * 
 * 主要特点：
 * 1. 不可变性：一旦创建，值不可改变
 * 2. 自验证：确保Token格式正确
 * 3. 过期检查：验证Token是否过期
 * 4. 格式验证：检查Token的格式
 * 5. 长期有效：刷新令牌通常有更长的有效期
 * 
 * 使用场景：
 * 1. 用户会话刷新
 * 2. 长期认证管理
 * 3. 自动登录功能
 */
export class RefreshToken {
  /**
   * @private
   * @readonly
   * @description 存储刷新令牌值
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
   * @private
   * @readonly
   * @description 关联的访问令牌ID
   */
  private readonly accessTokenId: string;

  /**
   * @constructor
   * @description
   * 创建RefreshToken值对象。
   * 执行Token格式验证，如果验证失败则抛出异常。
   * 
   * @param {string} token - 刷新令牌字符串
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
    this.accessTokenId = tokenData.jti || tokenData.accessTokenId;

    // 检查Token是否过期
    if (this.isExpired()) {
      throw new TokenExpiredException();
    }
  }

  /**
   * @private
   * @method validateTokenFormat
   * @description 验证Token格式
   * @param {string} token - 待验证的Token
   * @throws {InvalidTokenException} 当Token格式不正确时抛出
   */
  private validateTokenFormat(token: string): void {
    // 刷新令牌可以是JWT格式或其他格式
    // 这里我们支持多种格式
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const randomTokenRegex = /^[A-Za-z0-9]{32,}$/;

    if (!jwtRegex.test(token) && !uuidRegex.test(token) && !randomTokenRegex.test(token)) {
      throw new InvalidTokenException('Invalid refresh token format');
    }

    // 检查Token长度
    if (token.length < 32) {
      throw new InvalidTokenException('Token too short');
    }
  }

  /**
   * @private
   * @method parseToken
   * @description 解析Token获取payload信息（如果是JWT格式）
   * @param {string} token - Token
   * @returns {any} Token的payload信息
   * @throws {InvalidTokenException} 当Token解析失败时抛出
   */
  private parseToken(token: string): any {
    // 如果是JWT格式，解析payload
    if (token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new InvalidTokenException('Invalid JWT structure');
        }

        const payload = parts[1];
        const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
        return JSON.parse(decodedPayload);
      } catch (error) {
        throw new InvalidTokenException('Failed to parse refresh token');
      }
    }

    // 如果不是JWT格式，返回默认值
    const now = Math.floor(Date.now() / 1000);
    return {
      iat: now,
      exp: now + 30 * 24 * 3600, // 30天
      jti: token,
      type: 'refresh',
    };
  }

  /**
   * @method getValue
   * @description 获取刷新令牌值
   * @returns {string} 刷新令牌字符串
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
   * @method getAccessTokenId
   * @description 获取关联的访问令牌ID
   * @returns {string} 访问令牌ID
   */
  getAccessTokenId(): string {
    return this.accessTokenId;
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
   * @description 获取Token类型
   * @returns {string} Token类型
   */
  getTokenType(): string {
    const payload = this.parseToken(this.value);
    return payload.type || 'refresh';
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
   * @description 比较两个RefreshToken值对象是否相等
   * @param {RefreshToken} other - 待比较的另一个RefreshToken值对象
   * @returns {boolean} 如果两个Token相等返回true，否则返回false
   */
  equals(other: RefreshToken): boolean {
    if (!(other instanceof RefreshToken)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * @method toString
   * @description 将RefreshToken值对象转换为字符串
   * @returns {string} 刷新令牌的字符串表示
   */
  toString(): string {
    return this.value;
  }

  /**
   * @static
   * @method isValid
   * @description 验证刷新令牌格式是否有效
   * @param {string} token - 待验证的Token
   * @returns {boolean} 如果Token格式有效返回true，否则返回false
   */
  static isValid(token: string): boolean {
    try {
      new RefreshToken(token);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @static
   * @method create
   * @description 创建RefreshToken值对象（如果Token有效）
   * @param {string} token - 刷新令牌字符串
   * @returns {RefreshToken} 新的RefreshToken值对象
   */
  static create(token: string): RefreshToken {
    return new RefreshToken(token);
  }

  /**
   * @static
   * @method generate
   * @description 生成新的刷新令牌
   * @returns {string} 新的刷新令牌字符串
   */
  static generate(): string {
    // 生成32位随机字符串
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
