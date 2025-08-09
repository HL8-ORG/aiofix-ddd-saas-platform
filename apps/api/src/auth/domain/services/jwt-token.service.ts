import { Injectable } from '@nestjs/common';
import { JWTToken } from '../value-objects/jwt-token.vo';
import { RefreshToken } from '../value-objects/refresh-token.vo';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';
import { InvalidTokenException, TokenExpiredException } from '../exceptions/token.exception';

/**
 * @interface TokenPayload
 * @description JWT令牌载荷接口
 */
export interface TokenPayload {
  sub: string; // 用户ID
  tenantId: string; // 租户ID
  type: 'access' | 'refresh'; // 令牌类型
  jti?: string; // 令牌唯一标识
  iat?: number; // 签发时间
  exp?: number; // 过期时间
  [key: string]: any; // 其他自定义字段
}

/**
 * @interface TokenConfig
 * @description 令牌配置接口
 */
export interface TokenConfig {
  secret: string;
  accessTokenExpiresIn: number; // 秒
  refreshTokenExpiresIn: number; // 秒
  issuer?: string;
  audience?: string;
}

/**
 * @class JWTTokenService
 * @description JWT令牌服务，负责令牌的生成、验证和刷新
 */
@Injectable()
export class JWTTokenService {
  private readonly config: TokenConfig;

  constructor(config: TokenConfig) {
    this.config = config;
  }

  /**
   * @method generateAccessToken
   * @description 生成访问令牌
   * @param {UserId} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {Record<string, any>} additionalPayload - 额外的载荷数据
   * @returns {JWTToken} 访问令牌
   */
  generateAccessToken(userId: UserId, tenantId: string, additionalPayload: Record<string, any> = {}): JWTToken {
    const payload: TokenPayload = {
      sub: userId.getValue(),
      tenantId,
      type: 'access',
      jti: this.generateTokenId(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.config.accessTokenExpiresIn,
      ...additionalPayload,
    };

    const token = this.signToken(payload);
    return new JWTToken(token);
  }

  /**
   * @method generateRefreshToken
   * @description 生成刷新令牌
   * @param {UserId} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {string} accessTokenId - 关联的访问令牌ID
   * @param {Record<string, any>} additionalPayload - 额外的载荷数据
   * @returns {RefreshToken} 刷新令牌
   */
  generateRefreshToken(userId: UserId, tenantId: string, accessTokenId: string, additionalPayload: Record<string, any> = {}): RefreshToken {
    const payload: TokenPayload = {
      sub: userId.getValue(),
      tenantId,
      type: 'refresh',
      jti: accessTokenId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.config.refreshTokenExpiresIn,
      ...additionalPayload,
    };

    const token = this.signToken(payload);
    return new RefreshToken(token);
  }

  /**
   * @method verifyToken
   * @description 验证令牌
   * @param {string} token - 令牌字符串
   * @returns {TokenPayload} 令牌载荷
   * @throws {InvalidTokenException} 当令牌无效时抛出
   * @throws {TokenExpiredException} 当令牌已过期时抛出
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = this.verifySignature(token);
      return decoded as TokenPayload;
    } catch (error) {
      if (error instanceof TokenExpiredException) {
        throw error;
      }
      throw new InvalidTokenException('Token verification failed');
    }
  }

  /**
   * @method verifyAccessToken
   * @description 验证访问令牌
   * @param {string} token - 访问令牌字符串
   * @returns {TokenPayload} 令牌载荷
   */
  verifyAccessToken(token: string): TokenPayload {
    const payload = this.verifyToken(token);
    if (payload.type !== 'access') {
      throw new InvalidTokenException('Token is not an access token');
    }
    return payload;
  }

  /**
   * @method verifyRefreshToken
   * @description 验证刷新令牌
   * @param {string} token - 刷新令牌字符串
   * @returns {TokenPayload} 令牌载荷
   */
  verifyRefreshToken(token: string): TokenPayload {
    const payload = this.verifyToken(token);
    if (payload.type !== 'refresh') {
      throw new InvalidTokenException('Token is not a refresh token');
    }
    return payload;
  }

  /**
   * @method refreshAccessToken
   * @description 使用刷新令牌生成新的访问令牌
   * @param {RefreshToken} refreshToken - 刷新令牌
   * @returns {JWTToken} 新的访问令牌
   */
  refreshAccessToken(refreshToken: RefreshToken): JWTToken {
    const payload = this.verifyRefreshToken(refreshToken.getValue());

    return this.generateAccessToken(
      UserId.fromString(payload.sub),
      payload.tenantId,
      { jti: payload.jti }
    );
  }

  /**
   * @method extractUserId
   * @description 从令牌中提取用户ID
   * @param {string} token - 令牌字符串
   * @returns {string} 用户ID
   */
  extractUserId(token: string): string {
    const payload = this.verifyToken(token);
    return payload.sub;
  }

  /**
   * @method extractTenantId
   * @description 从令牌中提取租户ID
   * @param {string} token - 令牌字符串
   * @returns {string} 租户ID
   */
  extractTenantId(token: string): string {
    const payload = this.verifyToken(token);
    return payload.tenantId;
  }

  /**
   * @method extractTokenId
   * @description 从令牌中提取令牌ID
   * @param {string} token - 令牌字符串
   * @returns {string} 令牌ID
   */
  extractTokenId(token: string): string {
    const payload = this.verifyToken(token);
    return payload.jti || '';
  }

  /**
   * @method isTokenExpired
   * @description 检查令牌是否已过期
   * @param {string} token - 令牌字符串
   * @returns {boolean} 如果令牌已过期返回true，否则返回false
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.verifyToken(token);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp ? payload.exp < now : false;
    } catch {
      return true;
    }
  }

  /**
   * @method getTokenExpirationTime
   * @description 获取令牌过期时间
   * @param {string} token - 令牌字符串
   * @returns {Date | null} 过期时间，如果无法获取返回null
   */
  getTokenExpirationTime(token: string): Date | null {
    try {
      const payload = this.verifyToken(token);
      return payload.exp ? new Date(payload.exp * 1000) : null;
    } catch {
      return null;
    }
  }

  /**
   * @method getTokenIssuanceTime
   * @description 获取令牌签发时间
   * @param {string} token - 令牌字符串
   * @returns {Date | null} 签发时间，如果无法获取返回null
   */
  getTokenIssuanceTime(token: string): Date | null {
    try {
      const payload = this.verifyToken(token);
      return payload.iat ? new Date(payload.iat * 1000) : null;
    } catch {
      return null;
    }
  }

  /**
   * @private
   * @method signToken
   * @description 签名令牌
   * @param {TokenPayload} payload - 令牌载荷
   * @returns {string} 签名的令牌
   */
  private signToken(payload: TokenPayload): string {
    // 这里应该使用实际的JWT库进行签名
    // 为了演示，我们创建一个模拟的JWT格式
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '');
    const signature = this.generateSignature(encodedHeader + '.' + encodedPayload);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * @private
   * @method verifySignature
   * @description 验证令牌签名
   * @param {string} token - 令牌字符串
   * @returns {any} 解码后的载荷
   * @throws {InvalidTokenException} 当签名验证失败时抛出
   */
  private verifySignature(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new InvalidTokenException('Invalid token format');
    }

    const [header, payload, signature] = parts;

    // 验证签名
    const expectedSignature = this.generateSignature(header + '.' + payload);
    if (signature !== expectedSignature) {
      throw new InvalidTokenException('Invalid token signature');
    }

    // 解码载荷
    try {
      const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
      const payloadObj = JSON.parse(decodedPayload);

      // 检查过期时间
      if (payloadObj.exp && payloadObj.exp < Math.floor(Date.now() / 1000)) {
        throw new TokenExpiredException();
      }

      return payloadObj;
    } catch (error) {
      if (error instanceof TokenExpiredException) {
        throw error;
      }
      throw new InvalidTokenException('Failed to decode token payload');
    }
  }

  /**
   * @private
   * @method generateSignature
   * @description 生成签名
   * @param {string} data - 要签名的数据
   * @returns {string} 签名
   */
  private generateSignature(data: string): string {
    // 这里应该使用实际的HMAC-SHA256算法
    // 为了演示，我们创建一个简单的哈希
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.config.secret);
    hmac.update(data);
    return hmac.digest('base64').replace(/=/g, '');
  }

  /**
   * @method generateTokenId
   * @description 生成令牌ID
   * @returns {string} 令牌ID
   */
  generateTokenId(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }
}
