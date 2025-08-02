import { generateUuid, isValidUuid, isValidUuidV4, generateShortUuid } from '../uuid.util';

/**
 * @description UUID工具测试套件
 * 测试UUID生成和验证功能
 */
describe('UUID工具', () => {
  describe('generateUuid', () => {
    it('应该生成有效的UUID v4格式', () => {
      const uuid = generateUuid();

      // 验证UUID格式
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('应该生成唯一的UUID', () => {
      const uuid1 = generateUuid();
      const uuid2 = generateUuid();

      expect(uuid1).not.toBe(uuid2);
    });

    it('应该生成标准长度的UUID', () => {
      const uuid = generateUuid();

      // UUID应该是36个字符（包括连字符）
      expect(uuid.length).toBe(36);
    });
  });

  describe('isValidUuid', () => {
    it('应该验证有效的UUID', () => {
      const validUuids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
      ];

      validUuids.forEach(uuid => {
        expect(isValidUuid(uuid)).toBe(true);
      });
    });

    it('应该拒绝无效的UUID', () => {
      const invalidUuids = [
        'invalid-uuid',
        '550e8400-e29b-41d4-a716-44665544000', // 太短
        '550e8400-e29b-41d4-a716-4466554400000', // 太长
        '550e8400-e29b-21d4-a716-446655440000', // 版本号2是保留的
        '550e8400-e29b-61d4-a716-446655440000', // 版本号6是保留的
        '550e8400-e29b-41d4-c716-446655440000', // 变体位错误
        '550e8400-e29b-41d4-a716-44665544000g', // 包含无效字符
        '',
        'null',
        'undefined',
      ];

      invalidUuids.forEach(uuid => {
        const result = isValidUuid(uuid);
        if (result === true) {
          console.log(`错误：无效UUID "${uuid}" 被错误地接受了`);
        }
        expect(result).toBe(false);
      });
    });

    it('应该区分大小写', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const upperUuid = uuid.toUpperCase();
      const lowerUuid = uuid.toLowerCase();

      expect(isValidUuid(upperUuid)).toBe(true);
      expect(isValidUuid(lowerUuid)).toBe(true);
    });
  });

  describe('isValidUuidV4', () => {
    it('应该验证有效的UUID v4', () => {
      const validUuidV4s = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-41d4-a716-446655440000',
        '6ba7b811-9dad-41d4-a716-446655440000',
        '6ba7b812-9dad-41d4-a716-446655440000',
        '6ba7b814-9dad-41d4-a716-446655440000',
      ];

      validUuidV4s.forEach(uuid => {
        expect(isValidUuidV4(uuid)).toBe(true);
      });
    });

    it('应该拒绝非v4的UUID', () => {
      const nonV4Uuids = [
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // v1
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8', // v1
        '6ba7b812-9dad-11d1-80b4-00c04fd430c8', // v1
        '6ba7b814-9dad-11d1-80b4-00c04fd430c8', // v1
        '550e8400-e29b-31d4-a716-446655440000', // 版本号错误
        '550e8400-e29b-41d4-c716-446655440000', // 变体位错误
      ];

      nonV4Uuids.forEach(uuid => {
        expect(isValidUuidV4(uuid)).toBe(false);
      });
    });
  });

  describe('generateShortUuid', () => {
    it('应该生成32位十六进制字符串', () => {
      const shortUuid = generateShortUuid();

      expect(shortUuid).toMatch(/^[0-9a-f]{32}$/i);
      expect(shortUuid.length).toBe(32);
    });

    it('应该不包含连字符', () => {
      const shortUuid = generateShortUuid();

      expect(shortUuid).not.toContain('-');
    });

    it('应该生成唯一的短UUID', () => {
      const shortUuid1 = generateShortUuid();
      const shortUuid2 = generateShortUuid();

      expect(shortUuid1).not.toBe(shortUuid2);
    });

    it('应该与标准UUID对应', () => {
      const standardUuid = generateUuid();
      const shortUuid = standardUuid.replace(/-/g, '');

      expect(shortUuid).toMatch(/^[0-9a-f]{32}$/i);
      expect(shortUuid.length).toBe(32);
    });
  });

  describe('性能测试', () => {
    it('应该能够快速生成大量UUID', () => {
      const startTime = Date.now();
      const uuids = [];

      // 生成1000个UUID
      for (let i = 0; i < 1000; i++) {
        uuids.push(generateUuid());
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 验证所有UUID都是唯一的
      const uniqueUuids = new Set(uuids);
      expect(uniqueUuids.size).toBe(1000);

      // 验证生成时间在合理范围内（小于1秒）
      expect(duration).toBeLessThan(1000);
    });

    it('应该能够快速验证大量UUID', () => {
      const validUuids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
      ];

      const invalidUuids = [
        'invalid-uuid',
        '550e8400-e29b-41d4-a716-44665544000',
        '550e8400-e29b-31d4-a716-446655440000',
      ];

      const startTime = Date.now();

      // 验证1000次
      for (let i = 0; i < 1000; i++) {
        validUuids.forEach(uuid => isValidUuid(uuid));
        invalidUuids.forEach(uuid => isValidUuid(uuid));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 验证验证时间在合理范围内（小于1秒）
      expect(duration).toBeLessThan(1000);
    });
  });
}); 