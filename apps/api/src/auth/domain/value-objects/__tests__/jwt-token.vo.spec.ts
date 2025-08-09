import { JWTToken } from '../jwt-token.vo';
import {
  TokenRequiredException,
  InvalidTokenException,
  TokenExpiredException,
} from '../../exceptions/token.exception';

/**
 * @describe JWTToken Value Object
 * @description JWT Token值对象测试套件
 */
describe('JWTToken Value Object', () => {
  // 模拟有效的JWT Token（用于测试）
  const createMockJWT = (payload: any = {}, expiresIn: number = 3600) => {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'HS256', typ: 'JWT' };
    const payloadWithTime = {
      sub: 'user123',
      tenantId: 'tenant456',
      type: 'access',
      iat: now,
      exp: now + expiresIn,
      ...payload,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '');
    const encodedPayload = Buffer.from(JSON.stringify(payloadWithTime)).toString('base64').replace(/=/g, '');
    const signature = 'mock-signature';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  };

  describe('创建JWTToken值对象', () => {
    it('应该成功创建有效的JWTToken值对象', () => {
      const validToken = createMockJWT();
      const jwtToken = new JWTToken(validToken);

      expect(jwtToken).toBeDefined();
      expect(jwtToken.getValue()).toBe(validToken);
    });

    it('当Token为空时应该抛出TokenRequiredException', () => {
      expect(() => new JWTToken('')).toThrow(TokenRequiredException);
      expect(() => new JWTToken(null as any)).toThrow(TokenRequiredException);
      expect(() => new JWTToken(undefined as any)).toThrow(TokenRequiredException);
    });

    it('当Token格式无效时应该抛出InvalidTokenException', () => {
      const invalidTokens = [
        'invalid-token',
        'header.payload', // 缺少签名
        'header.payload.signature.extra', // 多余的部分
        'a', // 太短
        'header.payload.signature', // 格式正确但内容无效
      ];

      invalidTokens.forEach(token => {
        expect(() => new JWTToken(token)).toThrow(InvalidTokenException);
      });
    });

    it('当Token已过期时应该抛出TokenExpiredException', () => {
      const expiredToken = createMockJWT({}, -3600); // 1小时前过期
      expect(() => new JWTToken(expiredToken)).toThrow(TokenExpiredException);
    });
  });

  describe('Token信息获取', () => {
    it('应该正确获取Token的过期时间', () => {
      const expiresIn = 7200; // 2小时
      const token = createMockJWT({}, expiresIn);
      const jwtToken = new JWTToken(token);

      const expiresAt = jwtToken.getExpiresAt();
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + expiresIn * 1000);

      // 允许1秒的误差
      expect(Math.abs(expiresAt.getTime() - expectedExpiry.getTime())).toBeLessThan(1000);
    });

    it('应该正确获取Token的签发时间', () => {
      const token = createMockJWT();
      const jwtToken = new JWTToken(token);

      const issuedAt = jwtToken.getIssuedAt();
      const now = new Date();

      // 允许1秒的误差
      expect(Math.abs(issuedAt.getTime() - now.getTime())).toBeLessThan(1000);
    });

    it('应该正确获取Token类型', () => {
      const token = createMockJWT({ type: 'refresh' });
      const jwtToken = new JWTToken(token);

      expect(jwtToken.getTokenType()).toBe('refresh');
    });

    it('应该正确获取用户ID', () => {
      const token = createMockJWT({ sub: 'user789' });
      const jwtToken = new JWTToken(token);

      expect(jwtToken.getUserId()).toBe('user789');
    });

    it('应该正确获取租户ID', () => {
      const token = createMockJWT({ tenantId: 'tenant789' });
      const jwtToken = new JWTToken(token);

      expect(jwtToken.getTenantId()).toBe('tenant789');
    });
  });

  describe('Token状态检查', () => {
    it('应该正确检查Token是否过期', () => {
      const validToken = createMockJWT({}, 3600); // 1小时后过期
      const expiredToken = createMockJWT({}, -3600); // 1小时前过期

      const validJWT = new JWTToken(validToken);
      expect(validJWT.isExpired()).toBe(false);

      expect(() => new JWTToken(expiredToken)).toThrow(TokenExpiredException);
    });

    it('应该正确计算Token剩余时间', () => {
      const expiresIn = 3600; // 1小时
      const token = createMockJWT({}, expiresIn);
      const jwtToken = new JWTToken(token);

      const timeToExpiry = jwtToken.getTimeToExpiry();
      expect(timeToExpiry).toBeGreaterThan(0);
      expect(timeToExpiry).toBeLessThanOrEqual(expiresIn * 1000);
    });
  });

  describe('相等性比较', () => {
    it('相同的Token应该相等', () => {
      const token = createMockJWT();
      const jwtToken1 = new JWTToken(token);
      const jwtToken2 = new JWTToken(token);

      expect(jwtToken1.equals(jwtToken2)).toBe(true);
    });

    it('不同的Token不应该相等', () => {
      const token1 = createMockJWT({ sub: 'user1' });
      const token2 = createMockJWT({ sub: 'user2' });

      const jwtToken1 = new JWTToken(token1);
      const jwtToken2 = new JWTToken(token2);

      expect(jwtToken1.equals(jwtToken2)).toBe(false);
    });

    it('与非JWTToken对象比较应该返回false', () => {
      const token = createMockJWT();
      const jwtToken = new JWTToken(token);

      expect(jwtToken.equals('not-a-token' as any)).toBe(false);
      expect(jwtToken.equals(null as any)).toBe(false);
    });
  });

  describe('静态方法', () => {
    it('isValid应该正确验证Token格式', () => {
      const validToken = createMockJWT();
      const invalidToken = 'invalid-token';

      expect(JWTToken.isValid(validToken)).toBe(true);
      expect(JWTToken.isValid(invalidToken)).toBe(false);
    });

    it('create应该创建有效的JWTToken对象', () => {
      const token = createMockJWT();
      const jwtToken = JWTToken.create(token);

      expect(jwtToken).toBeInstanceOf(JWTToken);
      expect(jwtToken.getValue()).toBe(token);
    });

    it('create应该对无效Token抛出异常', () => {
      expect(() => JWTToken.create('invalid-token')).toThrow(InvalidTokenException);
    });
  });

  describe('字符串转换', () => {
    it('toString应该返回Token字符串', () => {
      const token = createMockJWT();
      const jwtToken = new JWTToken(token);

      expect(jwtToken.toString()).toBe(token);
    });
  });

  describe('边界情况', () => {
    it('应该处理Token中缺少可选字段的情况', () => {
      const token = createMockJWT({}, 3600);
      const jwtToken = new JWTToken(token);

      // 这些方法应该返回默认值或空字符串
      expect(jwtToken.getTokenType()).toBe('access'); // 默认值
      expect(jwtToken.getUserId()).toBe('user123'); // 默认值
      expect(jwtToken.getTenantId()).toBe('tenant456'); // 默认值
    });

    it('应该处理Token长度边界', () => {
      // 测试最小长度
      const shortToken = 'a.b.c';
      expect(() => new JWTToken(shortToken)).toThrow(InvalidTokenException);
    });
  });
});
