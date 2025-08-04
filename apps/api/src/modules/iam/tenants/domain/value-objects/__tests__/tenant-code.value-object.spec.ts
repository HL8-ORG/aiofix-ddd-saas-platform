import { TenantCode } from '../tenant-code.value-object'

/**
 * @describe TenantCode值对象测试
 * @description
 * 测试TenantCode值对象的业务规则和功能。
 *
 * 测试覆盖范围：
 * 1. 构造函数验证
 * 2. 格式验证规则
 * 3. 标准化处理
 * 4. 不可变性保证
 * 5. 相等性比较
 * 6. URL友好转换
 */
describe('TenantCode', () => {
  /**
   * @test 正常创建测试
   * @description 测试正常情况下的租户编码创建
   */
  describe('正常创建', () => {
    it('应该成功创建有效的租户编码', () => {
      const tenantCode = new TenantCode('test-tenant')
      expect(tenantCode.value).toBe('test-tenant')
    })

    it('应该自动转换为小写', () => {
      const tenantCode = new TenantCode('TEST-TENANT')
      expect(tenantCode.value).toBe('test-tenant')
    })

    it('应该自动去除首尾空格', () => {
      const tenantCode = new TenantCode('  test-tenant  ')
      expect(tenantCode.value).toBe('test-tenant')
    })

    it('应该将空格转换为连字符', () => {
      const tenantCode = new TenantCode('test tenant')
      expect(tenantCode.value).toBe('test-tenant')
    })

    it('应该处理多个空格', () => {
      const tenantCode = new TenantCode('test   tenant')
      expect(tenantCode.value).toBe('test-tenant')
    })
  })

  /**
   * @test 验证规则测试
   * @description 测试各种验证规则
   */
  describe('验证规则', () => {
    it('应该拒绝空字符串', () => {
      expect(() => new TenantCode('')).toThrow('租户编码不能为空')
    })

    it('应该拒绝只包含空格的字符串', () => {
      expect(() => new TenantCode('   ')).toThrow('租户编码不能为空')
    })

    it('应该拒绝少于3个字符的编码', () => {
      expect(() => new TenantCode('ab')).toThrow('租户编码至少需要3个字符')
    })

    it('应该拒绝超过50个字符的编码', () => {
      const longCode = 'a'.repeat(51)
      expect(() => new TenantCode(longCode)).toThrow('租户编码不能超过50个字符')
    })

    it('应该自动转换大写字母为小写', () => {
      const tenantCode = new TenantCode('Test-Tenant')
      expect(tenantCode.value).toBe('test-tenant')
    })

    it('应该拒绝包含特殊字符的编码', () => {
      const invalidChars = [
        '!',
        '@',
        '#',
        '$',
        '%',
        '^',
        '&',
        '*',
        '(',
        ')',
        '+',
        '=',
        '{',
        '}',
        '[',
        ']',
        '|',
        '\\',
        ':',
        ';',
        '"',
        "'",
        '<',
        '>',
        ',',
        '.',
        '?',
        '/',
      ]

      invalidChars.forEach((char) => {
        expect(() => new TenantCode(`test${char}tenant`)).toThrow(
          '租户编码只能包含小写字母、数字、下划线和连字符',
        )
      })
    })

    it('应该拒绝以连字符开头的编码', () => {
      expect(() => new TenantCode('-test-tenant')).toThrow(
        '租户编码不能以连字符开头或结尾',
      )
    })

    it('应该拒绝以连字符结尾的编码', () => {
      expect(() => new TenantCode('test-tenant-')).toThrow(
        '租户编码不能以连字符开头或结尾',
      )
    })

    it('应该拒绝包含连续连字符的编码', () => {
      expect(() => new TenantCode('test--tenant')).toThrow(
        '租户编码不能包含连续的连字符',
      )
    })

    it('应该接受边界值', () => {
      // 最小长度
      expect(() => new TenantCode('abc')).not.toThrow()

      // 最大长度
      const maxLengthCode = 'a'.repeat(50)
      expect(() => new TenantCode(maxLengthCode)).not.toThrow()
    })

    it('应该接受有效的字符组合', () => {
      const validCodes = [
        'test-tenant',
        'test_tenant',
        'test123',
        'test-tenant-123',
        'test_tenant_123',
        'test-tenant-123_456',
      ]

      validCodes.forEach((code) => {
        expect(() => new TenantCode(code)).not.toThrow()
      })
    })
  })

  /**
   * @test 不可变性测试
   * @description 测试值对象的不可变性
   */
  describe('不可变性', () => {
    it('应该确保值对象是不可变的', () => {
      const tenantCode = new TenantCode('test-tenant')
      const originalValue = tenantCode.value

      expect(tenantCode.value).toBe(originalValue)
    })

    it('应该创建新的值对象而不是修改现有对象', () => {
      const tenantCode1 = new TenantCode('test-tenant-1')
      const tenantCode2 = new TenantCode('test-tenant-2')

      expect(tenantCode1.value).toBe('test-tenant-1')
      expect(tenantCode2.value).toBe('test-tenant-2')
      expect(tenantCode1.value).not.toBe(tenantCode2.value)
    })
  })

  /**
   * @test 相等性测试
   * @description 测试值对象的相等性比较
   */
  describe('相等性', () => {
    it('应该正确比较相等的值对象', () => {
      const tenantCode1 = new TenantCode('test-tenant')
      const tenantCode2 = new TenantCode('test-tenant')

      expect(tenantCode1.equals(tenantCode2)).toBe(true)
    })

    it('应该正确比较不相等的值对象', () => {
      const tenantCode1 = new TenantCode('test-tenant-1')
      const tenantCode2 = new TenantCode('test-tenant-2')

      expect(tenantCode1.equals(tenantCode2)).toBe(false)
    })

    it('应该处理null和undefined', () => {
      const tenantCode = new TenantCode('test-tenant')

      expect(tenantCode.equals(null as any)).toBe(false)
      expect(tenantCode.equals(undefined as any)).toBe(false)
    })

    it('应该忽略大小写差异', () => {
      const tenantCode1 = new TenantCode('TEST-TENANT')
      const tenantCode2 = new TenantCode('test-tenant')

      expect(tenantCode1.equals(tenantCode2)).toBe(true)
    })
  })

  /**
   * @test 字符串转换测试
   * @description 测试toString方法和字符串转换
   */
  describe('字符串转换', () => {
    it('toString应该返回正确的字符串', () => {
      const tenantCode = new TenantCode('test-tenant')
      expect(tenantCode.toString()).toBe('test-tenant')
    })

    it('应该支持字符串拼接', () => {
      const tenantCode = new TenantCode('test-tenant')
      const result = `租户编码: ${tenantCode}`
      expect(result).toBe('租户编码: test-tenant')
    })
  })

  /**
   * @test 大小写转换测试
   * @description 测试toUpperCase和toLowerCase方法
   */
  describe('大小写转换', () => {
    it('toUpperCase应该返回大写字符串', () => {
      const tenantCode = new TenantCode('test-tenant')
      expect(tenantCode.toUpperCase()).toBe('TEST-TENANT')
    })

    it('toLowerCase应该返回小写字符串', () => {
      const tenantCode = new TenantCode('TEST-TENANT')
      expect(tenantCode.toLowerCase()).toBe('test-tenant')
    })
  })

  /**
   * @test URL友好转换测试
   * @description 测试toSlug方法
   */
  describe('URL友好转换', () => {
    it('toSlug应该将下划线转换为连字符', () => {
      const tenantCode = new TenantCode('test_tenant')
      expect(tenantCode.toSlug()).toBe('test-tenant')
    })

    it('toSlug应该保持连字符不变', () => {
      const tenantCode = new TenantCode('test-tenant')
      expect(tenantCode.toSlug()).toBe('test-tenant')
    })

    it('toSlug应该处理混合格式', () => {
      const tenantCode = new TenantCode('test_tenant_123')
      expect(tenantCode.toSlug()).toBe('test-tenant-123')
    })
  })

  /**
   * @test 标准化处理测试
   * @description 测试标准化处理功能
   */
  describe('标准化处理', () => {
    it('应该标准化各种输入格式', () => {
      const testCases = [
        { input: 'Test Tenant', expected: 'test-tenant' },
        { input: 'test_tenant', expected: 'test-tenant' },
        { input: 'TEST TENANT', expected: 'test-tenant' },
        { input: '  test  tenant  ', expected: 'test-tenant' },
        { input: 'test-tenant-123', expected: 'test-tenant-123' },
      ]

      testCases.forEach(({ input, expected }) => {
        const tenantCode = new TenantCode(input)
        expect(tenantCode.value).toBe(expected)
      })
    })
  })

  /**
   * @test 边界条件测试
   * @description 测试各种边界条件
   */
  describe('边界条件', () => {
    it('应该处理数字编码', () => {
      const tenantCode = new TenantCode('123456')
      expect(tenantCode.value).toBe('123456')
    })

    it('应该处理纯字母编码', () => {
      const tenantCode = new TenantCode('testtenant')
      expect(tenantCode.value).toBe('testtenant')
    })

    it('应该处理混合编码', () => {
      const tenantCode = new TenantCode('test-tenant-123')
      expect(tenantCode.value).toBe('test-tenant-123')
    })

    it('应该处理最小长度编码', () => {
      const tenantCode = new TenantCode('abc')
      expect(tenantCode.value).toBe('abc')
    })

    it('应该处理最大长度编码', () => {
      const maxLengthCode = 'a'.repeat(50)
      const tenantCode = new TenantCode(maxLengthCode)
      expect(tenantCode.value).toBe(maxLengthCode)
    })
  })

  /**
   * @test 性能测试
   * @description 测试性能相关的场景
   */
  describe('性能', () => {
    it('应该能够快速创建多个实例', () => {
      const startTime = Date.now()

      for (let i = 0; i < 1000; i++) {
        new TenantCode(`test-tenant-${i}`)
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
    })

    it('应该能够处理长编码', () => {
      const longCode = 'a'.repeat(50)
      expect(() => new TenantCode(longCode)).not.toThrow()
    })
  })
})
