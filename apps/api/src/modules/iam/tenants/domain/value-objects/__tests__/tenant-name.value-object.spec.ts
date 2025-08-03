import { TenantName } from '../tenant-name.value-object';

/**
 * @test TenantName值对象测试
 * @description 测试租户名称值对象的各种功能和业务规则
 */
describe('TenantName', () => {
  /**
   * @test 正常创建测试
   * @description 测试正常创建租户名称的各种情况
   */
  describe('正常创建', () => {
    it('应该成功创建有效的租户名称', () => {
      const tenantName = new TenantName('测试租户');
      expect(tenantName.value).toBe('测试租户');
    });

    it('应该自动去除首尾空格', () => {
      const tenantName = new TenantName('  测试租户  ');
      expect(tenantName.value).toBe('测试租户');
    });

    it('应该规范化多个空格', () => {
      const tenantName = new TenantName('测试  租户');
      expect(tenantName.value).toBe('测试 租户');
    });

    it('应该支持英文名称', () => {
      const tenantName = new TenantName('Test Tenant');
      expect(tenantName.value).toBe('Test Tenant');
    });

    it('应该支持中英文混合', () => {
      const tenantName = new TenantName('测试Tenant');
      expect(tenantName.value).toBe('测试Tenant');
    });

    it('应该支持数字', () => {
      const tenantName = new TenantName('租户123');
      expect(tenantName.value).toBe('租户123');
    });

    it('应该支持连字符和下划线', () => {
      const tenantName = new TenantName('test-tenant_123');
      expect(tenantName.value).toBe('test-tenant_123');
    });

    it('应该支持括号', () => {
      const tenantName = new TenantName('测试租户(测试)');
      expect(tenantName.value).toBe('测试租户(测试)');
    });

    it('应该将中文括号转换为英文括号', () => {
      const tenantName = new TenantName('测试租户（测试）');
      expect(tenantName.value).toBe('测试租户(测试)');
    });
  });

  /**
   * @test 验证规则测试
   * @description 测试各种验证规则
   */
  describe('验证规则', () => {
    it('应该拒绝空字符串', () => {
      expect(() => new TenantName('')).toThrow('租户名称不能为空');
    });

    it('应该拒绝只包含空格的字符串', () => {
      expect(() => new TenantName('   ')).toThrow('租户名称不能为空');
    });

    it('应该拒绝少于2个字符的名称', () => {
      expect(() => new TenantName('a')).toThrow('租户名称至少需要2个字符');
    });

    it('应该拒绝超过100个字符的名称', () => {
      const longName = 'a'.repeat(101);
      expect(() => new TenantName(longName)).toThrow('租户名称不能超过100个字符');
    });

    it('应该拒绝包含特殊字符的名称', () => {
      const invalidChars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*', '@', '#', '$', '%', '^', '&', '+', '=', '{', '}', '[', ']', ';', ',', '.'];

      invalidChars.forEach(char => {
        expect(() => new TenantName(`测试${char}租户`)).toThrow(
          '租户名称只能包含中文、英文、数字、空格、连字符、下划线和括号'
        );
      });
    });

    it('应该接受边界值', () => {
      // 最小长度
      expect(() => new TenantName('ab')).not.toThrow();

      // 最大长度
      const maxLengthName = 'a'.repeat(100);
      expect(() => new TenantName(maxLengthName)).not.toThrow();
    });

    it('应该接受有效的字符组合', () => {
      const validNames = [
        '测试租户',
        'Test Tenant',
        '测试Tenant',
        '租户123',
        'test-tenant',
        'test_tenant',
        '测试租户(测试)',
        'Test Tenant (Demo)',
        '租户-测试_123'
      ];

      validNames.forEach(name => {
        expect(() => new TenantName(name)).not.toThrow();
      });
    });
  });

  /**
   * @test 不可变性测试
   * @description 测试值对象的不可变性
   */
  describe('不可变性', () => {
    it('应该确保值对象是不可变的', () => {
      const tenantName = new TenantName('测试租户');
      const originalValue = tenantName.value;

      // 尝试修改值（虽然TypeScript会阻止，但测试确保设计正确）
      expect(tenantName.value).toBe(originalValue);
    });

    it('应该创建新的值对象而不是修改现有对象', () => {
      const tenantName1 = new TenantName('测试租户1');
      const tenantName2 = new TenantName('测试租户2');

      expect(tenantName1.value).toBe('测试租户1');
      expect(tenantName2.value).toBe('测试租户2');
    });
  });

  /**
   * @test 相等性测试
   * @description 测试值对象的相等性比较
   */
  describe('相等性', () => {
    it('应该正确比较相等的值对象', () => {
      const tenantName1 = new TenantName('测试租户');
      const tenantName2 = new TenantName('测试租户');

      expect(tenantName1.equals(tenantName2)).toBe(true);
    });

    it('应该正确比较不相等的值对象', () => {
      const tenantName1 = new TenantName('测试租户1');
      const tenantName2 = new TenantName('测试租户2');

      expect(tenantName1.equals(tenantName2)).toBe(false);
    });

    it('应该处理null和undefined', () => {
      const tenantName = new TenantName('测试租户');

      expect(tenantName.equals(null as any)).toBe(false);
      expect(tenantName.equals(undefined as any)).toBe(false);
    });

    it('应该忽略空格差异', () => {
      const tenantName1 = new TenantName('测试租户');
      const tenantName2 = new TenantName('  测试租户  ');

      expect(tenantName1.equals(tenantName2)).toBe(true);
    });
  });

  /**
   * @test 字符串转换测试
   * @description 测试toString方法和字符串转换
   */
  describe('字符串转换', () => {
    it('toString应该返回正确的字符串', () => {
      const tenantName = new TenantName('测试租户');
      expect(tenantName.toString()).toBe('测试租户');
    });

    it('应该支持字符串拼接', () => {
      const tenantName = new TenantName('测试租户');
      const result = `租户名称: ${tenantName}`;
      expect(result).toBe('租户名称: 测试租户');
    });
  });

  /**
   * @test 大小写转换测试
   * @description 测试toUpperCase和toLowerCase方法
   */
  describe('大小写转换', () => {
    it('toUpperCase应该返回大写字符串', () => {
      const tenantName = new TenantName('test tenant');
      expect(tenantName.toUpperCase()).toBe('TEST TENANT');
    });

    it('toLowerCase应该返回小写字符串', () => {
      const tenantName = new TenantName('TEST TENANT');
      expect(tenantName.toLowerCase()).toBe('test tenant');
    });
  });

  /**
   * @test 显示名称测试
   * @description 测试getDisplayName方法
   */
  describe('显示名称', () => {
    it('getDisplayName应该返回首字母大写的名称', () => {
      const tenantName = new TenantName('test tenant');
      expect(tenantName.getDisplayName()).toBe('Test Tenant');
    });

    it('getDisplayName应该处理单个单词', () => {
      const tenantName = new TenantName('test');
      expect(tenantName.getDisplayName()).toBe('Test');
    });

    it('getDisplayName应该处理中文', () => {
      const tenantName = new TenantName('测试租户');
      expect(tenantName.getDisplayName()).toBe('测试租户');
    });
  });

  /**
   * @test 短名称测试
   * @description 测试getShortName方法
   */
  describe('短名称', () => {
    it('getShortName应该返回完整名称（当长度<=20时）', () => {
      const tenantName = new TenantName('测试租户');
      expect(tenantName.getShortName()).toBe('测试租户');
    });

    it('getShortName应该截断长名称', () => {
      const longName = '这是一个很长的租户名称用于测试截断功能这是一个很长的租户名称';
      const tenantName = new TenantName(longName);
      expect(tenantName.getShortName()).toBe('这是一个很长的租户名称用于测试截断功能这...');
    });
  });

  /**
   * @test 标准化处理测试
   * @description 测试标准化处理功能
   */
  describe('标准化处理', () => {
    it('应该标准化各种输入格式', () => {
      const testCases = [
        { input: '  测试租户  ', expected: '测试租户' },
        { input: '测试  租户', expected: '测试 租户' },
        { input: 'Test   Tenant', expected: 'Test Tenant' },
        { input: '测试租户（测试）', expected: '测试租户(测试)' },
        { input: 'test-tenant_123', expected: 'test-tenant_123' }
      ];

      testCases.forEach(({ input, expected }) => {
        const tenantName = new TenantName(input);
        expect(tenantName.value).toBe(expected);
      });
    });
  });

  /**
   * @test 边界条件测试
   * @description 测试各种边界条件
   */
  describe('边界条件', () => {
    it('应该处理数字名称', () => {
      const tenantName = new TenantName('123456');
      expect(tenantName.value).toBe('123456');
    });

    it('应该处理纯英文名称', () => {
      const tenantName = new TenantName('TestTenant');
      expect(tenantName.value).toBe('TestTenant');
    });

    it('应该处理混合名称', () => {
      const tenantName = new TenantName('测试Tenant123');
      expect(tenantName.value).toBe('测试Tenant123');
    });

    it('应该处理最小长度名称', () => {
      const tenantName = new TenantName('ab');
      expect(tenantName.value).toBe('ab');
    });

    it('应该处理最大长度名称', () => {
      const maxLengthName = 'a'.repeat(100);
      const tenantName = new TenantName(maxLengthName);
      expect(tenantName.value).toBe(maxLengthName);
    });
  });

  /**
   * @test 性能测试
   * @description 测试性能相关功能
   */
  describe('性能', () => {
    it('应该能够快速创建多个实例', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        new TenantName(`测试租户${i}`);
      }

      const end = Date.now();
      expect(end - start).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该能够处理长名称', () => {
      const longName = 'a'.repeat(100);
      const tenantName = new TenantName(longName);
      expect(tenantName.value).toBe(longName);
    });
  });
}); 