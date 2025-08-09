import { RefreshToken } from '../refresh-token.vo';
import {
  TokenRequiredException,
  InvalidTokenException,
  TokenExpiredException,
} from '../../exceptions/token.exception';

/**
 * @describe RefreshToken Value Object
 * @description RefreshToken值对象测试套件
 */
describe('RefreshToken Value Object', () => {
  // 模拟有效的JWT格式刷新令牌（用于测试）
  const createMockJWTRefreshToken = (payload: any = {}, expiresIn: number = 30 * 24 * 3600) => {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'HS256', typ: 'JWT' };
    const payloadWithTime = {
      sub: 'user123',
      tenantId: 'tenant456',
      type: 'refresh',
      jti: 'refresh-token-id',
      iat: now,
      exp: now + expiresIn,
      ...payload,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '');
    const encodedPayload = Buffer.from(JSON.stringify(payloadWithTime)).toString('base64').replace(/=/g, '');
    const signature = 'mock-signature';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  };

  describe('创建RefreshToken值对象', () => {
    it('应该成功创建有效的JWT格式RefreshToken值对象', () => {
      const validToken = createMockJWTRefreshToken();
      const refreshToken = new RefreshToken(validToken);

      expect(refreshToken).toBeDefined();
      expect(refreshToken.getValue()).toBe(validToken);
    });

    it('应该成功创建UUID格式的RefreshToken值对象', () => {
      const uuidToken = '550e8400-e29b-41d4-a716-446655440000';
      const refreshToken = new RefreshToken(uuidToken);

      expect(refreshToken).toBeDefined();
      expect(refreshToken.getValue()).toBe(uuidToken);
    });

    it('应该成功创建随机字符串格式的RefreshToken值对象', () => {
      const randomToken = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';
      const refreshToken = new RefreshToken(randomToken);

      expect(refreshToken).toBeDefined();
      expect(refreshToken.getValue()).toBe(randomToken);
    });

    it('当Token为空时应该抛出TokenRequiredException', () => {
      expect(() => new RefreshToken('')).toThrow(TokenRequiredException);
      expect(() => new RefreshToken(null as any)).toThrow(TokenRequiredException);
      expect(() => new RefreshToken(undefined as any)).toThrow(TokenRequiredException);
    });

    it('当Token格式无效时应该抛出InvalidTokenException', () => {
      const invalidTokens = [
        'invalid-token',
        'too-short',
        'header.payload', // 缺少签名
        'header.payload.signature.extra', // 多余的部分
      ];

      invalidTokens.forEach(token => {
        expect(() => new RefreshToken(token)).toThrow(InvalidTokenException);
      });
    });

    it('当Token已过期时应该抛出TokenExpiredException', () => {
      const expiredToken = createMockJWTRefreshToken({}, -3600); // 1小时前过期
      expect(() => new RefreshToken(expiredToken)).toThrow(TokenExpiredException);
    });
  });

  describe('Token信息获取', () => {
    it('应该正确获取Token的过期时间', () => {
      const expiresIn = 60 * 24 * 3600; // 60天
      const token = createMockJWTRefreshToken({}, expiresIn);
      const refreshToken = new RefreshToken(token);

      const expiresAt = refreshToken.getExpiresAt();
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + expiresIn * 1000);

      // 允许1秒的误差
      expect(Math.abs(expiresAt.getTime() - expectedExpiry.getTime())).toBeLessThan(1000);
    });

    it('应该正确获取Token的签发时间', () => {
      const token = createMockJWTRefreshToken();
      const refreshToken = new RefreshToken(token);

      const issuedAt = refreshToken.getIssuedAt();
      const now = new Date();

      // 允许1秒的误差
      expect(Math.abs(issuedAt.getTime() - now.getTime())).toBeLessThan(1000);
    });

    it('应该正确获取关联的访问令牌ID', () => {
      const token = createMockJWTRefreshToken({ jti: 'access-token-123' });
      const refreshToken = new RefreshToken(token);

      expect(refreshToken.getAccessTokenId()).toBe('access-token-123');
    });

    it('应该正确获取Token类型', () => {
      const token = createMockJWTRefreshToken({ type: 'refresh' });
      const refreshToken = new RefreshToken(token);

      expect(refreshToken.getTokenType()).toBe('refresh');
    });

    it('应该正确获取用户ID', () => {
      const token = createMockJWTRefreshToken({ sub: 'user789' });
      const refreshToken = new RefreshToken(token);

      expect(refreshToken.getUserId()).toBe('user789');
    });

    it('应该正确获取租户ID', () => {
      const token = createMockJWTRefreshToken({ tenantId: 'tenant789' });
      const refreshToken = new RefreshToken(token);

      expect(refreshToken.getTenantId()).toBe('tenant789');
    });
  });

  describe('Token状态检查', () => {
    it('应该正确检查Token是否过期', () => {
      const validToken = createMockJWTRefreshToken({}, 30 * 24 * 3600); // 30天后过期
      const expiredToken = createMockJWTRefreshToken({}, -3600); // 1小时前过期

      const validRefreshToken = new RefreshToken(validToken);
      expect(validRefreshToken.isExpired()).toBe(false);

      expect(() => new RefreshToken(expiredToken)).toThrow(TokenExpiredException);
    });

    it('应该正确计算Token剩余时间', () => {
      const expiresIn = 30 * 24 * 3600; // 30天
      const token = createMockJWTRefreshToken({}, expiresIn);
      const refreshToken = new RefreshToken(token);

      const timeToExpiry = refreshToken.getTimeToExpiry();
      expect(timeToExpiry).toBeGreaterThan(0);
      expect(timeToExpiry).toBeLessThanOrEqual(expiresIn * 1000);
    });
  });

  describe('相等性比较', () => {
    it('相同的Token应该相等', () => {
      const token = createMockJWTRefreshToken();
      const refreshToken1 = new RefreshToken(token);
      const refreshToken2 = new RefreshToken(token);

      expect(refreshToken1.equals(refreshToken2)).toBe(true);
    });

    it('不同的Token不应该相等', () => {
      const token1 = createMockJWTRefreshToken({ sub: 'user1' });
      const token2 = createMockJWTRefreshToken({ sub: 'user2' });

      const refreshToken1 = new RefreshToken(token1);
      const refreshToken2 = new RefreshToken(token2);

      expect(refreshToken1.equals(refreshToken2)).toBe(false);
    });

    it('与非RefreshToken对象比较应该返回false', () => {
      const token = createMockJWTRefreshToken();
      const refreshToken = new RefreshToken(token);

      expect(refreshToken.equals('not-a-token' as any)).toBe(false);
      expect(refreshToken.equals(null as any)).toBe(false);
    });
  });

  describe('静态方法', () => {
    it('isValid应该正确验证Token格式', () => {
      const validToken = createMockJWTRefreshToken();
      const validUuidToken = '550e8400-e29b-41d4-a716-446655440000';
      const validRandomToken = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';
      const invalidToken = 'invalid-token';

      expect(RefreshToken.isValid(validToken)).toBe(true);
      expect(RefreshToken.isValid(validUuidToken)).toBe(true);
      expect(RefreshToken.isValid(validRandomToken)).toBe(true);
      expect(RefreshToken.isValid(invalidToken)).toBe(false);
    });

    it('create应该创建有效的RefreshToken对象', () => {
      const token = createMockJWTRefreshToken();
      const refreshToken = RefreshToken.create(token);

      expect(refreshToken).toBeInstanceOf(RefreshToken);
      expect(refreshToken.getValue()).toBe(token);
    });

    it('create应该对无效Token抛出异常', () => {
      expect(() => RefreshToken.create('invalid-token')).toThrow(InvalidTokenException);
    });

    it('generate应该生成有效的刷新令牌', () => {
      const generatedToken = RefreshToken.generate();

      expect(generatedToken).toBeDefined();
      expect(generatedToken.length).toBe(32);
      expect(RefreshToken.isValid(generatedToken)).toBe(true);
    });
  });

  describe('字符串转换', () => {
    it('toString应该返回Token字符串', () => {
      const token = createMockJWTRefreshToken();
      const refreshToken = new RefreshToken(token);

      expect(refreshToken.toString()).toBe(token);
    });
  });

  describe('边界情况', () => {
    it('应该处理Token中缺少可选字段的情况', () => {
      const token = createMockJWTRefreshToken({}, 30 * 24 * 3600);
      const refreshToken = new RefreshToken(token);

      // 这些方法应该返回默认值
      expect(refreshToken.getTokenType()).toBe('refresh'); // 默认值
      expect(refreshToken.getUserId()).toBe('user123'); // 默认值
      expect(refreshToken.getTenantId()).toBe('tenant456'); // 默认值
    });

    it('应该处理Token长度边界', () => {
      // 测试最小长度
      const shortToken = 'short-token';
      expect(() => new RefreshToken(shortToken)).toThrow(InvalidTokenException);
    });

    it('应该支持多种Token格式', () => {
      const formats = [
        createMockJWTRefreshToken(), // JWT格式
        '550e8400-e29b-41d4-a716-446655440000', // UUID格式
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456', // 随机字符串格式
      ];

      formats.forEach(token => {
        expect(() => new RefreshToken(token)).not.toThrow();
      });
    });
  });
});
