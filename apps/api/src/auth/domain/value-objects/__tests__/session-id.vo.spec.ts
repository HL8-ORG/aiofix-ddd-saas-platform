import { SessionId } from '../session-id.vo';
import {
  SessionIdRequiredException,
  InvalidSessionIdException,
} from '../../exceptions/session.exception';

/**
 * @describe SessionId Value Object
 * @description SessionId值对象测试套件
 */
describe('SessionId Value Object', () => {
  describe('创建SessionId值对象', () => {
    it('应该成功创建UUID格式的SessionId值对象', () => {
      const uuidSessionId = '550e8400-e29b-41d4-a716-446655440000';
      const sessionId = new SessionId(uuidSessionId);

      expect(sessionId).toBeDefined();
      expect(sessionId.getValue()).toBe(uuidSessionId);
    });

    it('应该成功创建随机字符串格式的SessionId值对象', () => {
      const randomSessionId = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';
      const sessionId = new SessionId(randomSessionId);

      expect(sessionId).toBeDefined();
      expect(sessionId.getValue()).toBe(randomSessionId);
    });

    it('应该成功创建Base64格式的SessionId值对象', () => {
      const base64SessionId = 'dGVzdC1zZXNzaW9uLWlkLWZvci10ZXN0aW5n';
      const sessionId = new SessionId(base64SessionId);

      expect(sessionId).toBeDefined();
      expect(sessionId.getValue()).toBe(base64SessionId);
    });

    it('当SessionId为空时应该抛出SessionIdRequiredException', () => {
      expect(() => new SessionId('')).toThrow(SessionIdRequiredException);
      expect(() => new SessionId(null as any)).toThrow(SessionIdRequiredException);
      expect(() => new SessionId(undefined as any)).toThrow(SessionIdRequiredException);
    });

    it('当SessionId格式无效时应该抛出InvalidSessionIdException', () => {
      const invalidSessionIds = [
        'invalid-session',
        'too-short',
        'invalid@session#id',
        'session with spaces',
        'session-with-special-chars!',
      ];

      invalidSessionIds.forEach(sessionId => {
        expect(() => new SessionId(sessionId)).toThrow(InvalidSessionIdException);
      });
    });

    it('当SessionId太短时应该抛出InvalidSessionIdException', () => {
      const shortSessionId = 'short';
      expect(() => new SessionId(shortSessionId)).toThrow(InvalidSessionIdException);
    });

    it('当SessionId太长时应该抛出InvalidSessionIdException', () => {
      const longSessionId = 'a'.repeat(129); // 超过128字符
      expect(() => new SessionId(longSessionId)).toThrow(InvalidSessionIdException);
    });
  });

  describe('SessionId信息获取', () => {
    it('应该正确获取SessionId值', () => {
      const sessionIdValue = '550e8400-e29b-41d4-a716-446655440000';
      const sessionId = new SessionId(sessionIdValue);

      expect(sessionId.getValue()).toBe(sessionIdValue);
    });

    it('应该正确获取SessionId长度', () => {
      const sessionIdValue = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';
      const sessionId = new SessionId(sessionIdValue);

      expect(sessionId.getLength()).toBe(sessionIdValue.length);
    });

    it('应该正确识别UUID格式', () => {
      const uuidSessionId = '550e8400-e29b-41d4-a716-446655440000';
      const sessionId = new SessionId(uuidSessionId);

      expect(sessionId.getFormat()).toBe('uuid');
    });

    it('应该正确识别Base64格式', () => {
      const base64SessionId = 'dGVzdC1zZXNzaW9uLWlkLWZvci10ZXN0aW5nK2FuZA==';
      const sessionId = new SessionId(base64SessionId);

      expect(sessionId.getFormat()).toBe('base64');
    });

    it('应该正确识别随机字符串格式', () => {
      const randomSessionId = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';
      const sessionId = new SessionId(randomSessionId);

      expect(sessionId.getFormat()).toBe('random');
    });
  });

  describe('相等性比较', () => {
    it('相同的SessionId应该相等', () => {
      const sessionIdValue = '550e8400-e29b-41d4-a716-446655440000';
      const sessionId1 = new SessionId(sessionIdValue);
      const sessionId2 = new SessionId(sessionIdValue);

      expect(sessionId1.equals(sessionId2)).toBe(true);
    });

    it('不同的SessionId不应该相等', () => {
      const sessionId1 = new SessionId('550e8400-e29b-41d4-a716-446655440000');
      const sessionId2 = new SessionId('660e8400-e29b-41d4-a716-446655440000');

      expect(sessionId1.equals(sessionId2)).toBe(false);
    });

    it('与非SessionId对象比较应该返回false', () => {
      const sessionId = new SessionId('550e8400-e29b-41d4-a716-446655440000');

      expect(sessionId.equals('not-a-session-id' as any)).toBe(false);
      expect(sessionId.equals(null as any)).toBe(false);
    });
  });

  describe('静态方法', () => {
    it('isValid应该正确验证SessionId格式', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const validRandom = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';
      const validBase64 = 'dGVzdC1zZXNzaW9uLWlkLWZvci10ZXN0aW5nK2FuZA==';
      const invalidSessionId = 'invalid-session';

      expect(SessionId.isValid(validUuid)).toBe(true);
      expect(SessionId.isValid(validRandom)).toBe(true);
      expect(SessionId.isValid(validBase64)).toBe(true);
      expect(SessionId.isValid(invalidSessionId)).toBe(false);
    });

    it('create应该创建有效的SessionId对象', () => {
      const sessionIdValue = '550e8400-e29b-41d4-a716-446655440000';
      const sessionId = SessionId.create(sessionIdValue);

      expect(sessionId).toBeInstanceOf(SessionId);
      expect(sessionId.getValue()).toBe(sessionIdValue);
    });

    it('create应该对无效SessionId抛出异常', () => {
      expect(() => SessionId.create('invalid-session')).toThrow(InvalidSessionIdException);
    });

    it('generate应该生成有效的UUID格式SessionId', () => {
      const generatedSessionId = SessionId.generate('uuid');

      expect(generatedSessionId).toBeDefined();
      expect(SessionId.isValid(generatedSessionId)).toBe(true);
      expect(new SessionId(generatedSessionId).getFormat()).toBe('uuid');
    });

    it('generate应该生成有效的随机字符串格式SessionId', () => {
      const generatedSessionId = SessionId.generate('random');

      expect(generatedSessionId).toBeDefined();
      expect(generatedSessionId.length).toBe(32);
      expect(SessionId.isValid(generatedSessionId)).toBe(true);
      expect(new SessionId(generatedSessionId).getFormat()).toBe('random');
    });

    it('generate应该生成有效的Base64格式SessionId', () => {
      const generatedSessionId = SessionId.generate('base64');

      expect(generatedSessionId).toBeDefined();
      expect(SessionId.isValid(generatedSessionId)).toBe(true);
      expect(new SessionId(generatedSessionId).getFormat()).toBe('base64');
    });

    it('generate应该默认生成UUID格式', () => {
      const generatedSessionId = SessionId.generate();

      expect(generatedSessionId).toBeDefined();
      expect(SessionId.isValid(generatedSessionId)).toBe(true);
      expect(new SessionId(generatedSessionId).getFormat()).toBe('uuid');
    });
  });

  describe('字符串转换', () => {
    it('toString应该返回SessionId字符串', () => {
      const sessionIdValue = '550e8400-e29b-41d4-a716-446655440000';
      const sessionId = new SessionId(sessionIdValue);

      expect(sessionId.toString()).toBe(sessionIdValue);
    });
  });

  describe('边界情况', () => {
    it('应该处理最小长度边界', () => {
      const minLengthSessionId = 'A'.repeat(16); // 正好16字符
      expect(() => new SessionId(minLengthSessionId)).not.toThrow();
    });

    it('应该处理最大长度边界', () => {
      const maxLengthSessionId = 'A'.repeat(128); // 正好128字符
      expect(() => new SessionId(maxLengthSessionId)).not.toThrow();
    });

    it('应该处理各种有效格式', () => {
      const validFormats = [
        '550e8400-e29b-41d4-a716-446655440000', // UUID
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456', // 随机字符串
        'dGVzdC1zZXNzaW9uLWlkLWZvci10ZXN0aW5n', // Base64
        'a'.repeat(16), // 最小长度
        'a'.repeat(128), // 最大长度
      ];

      validFormats.forEach(sessionId => {
        expect(() => new SessionId(sessionId)).not.toThrow();
      });
    });

    it('应该处理无效格式', () => {
      const invalidFormats = [
        'a'.repeat(15), // 太短
        'a'.repeat(129), // 太长
        'invalid@session#id',
        'session with spaces',
        'session-with-special-chars!',
      ];

      invalidFormats.forEach(sessionId => {
        expect(() => new SessionId(sessionId)).toThrow(InvalidSessionIdException);
      });
    });
  });
});
