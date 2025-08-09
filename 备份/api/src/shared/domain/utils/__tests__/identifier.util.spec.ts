import { normalizeIdentifier, validateIdentifier } from '../identifier.util'

/**
 * @describe identifier.util测试
 * @description
 * 测试identifier.util工具函数的标准化和校验功能。
 *
 * 测试覆盖范围：
 * 1. normalizeIdentifier的各种输入场景
 * 2. validateIdentifier的各种校验规则
 * 3. 边界条件和异常情况
 */
describe('identifier.util', () => {
  /**
   * @test normalizeIdentifier测试
   * @description 测试编码标准化功能
   */
  describe('normalizeIdentifier', () => {
    it('应该标准化基本编码', () => {
      expect(normalizeIdentifier('Test Tenant')).toBe('test-tenant')
      expect(normalizeIdentifier('test_tenant')).toBe('test-tenant')
      expect(normalizeIdentifier('TEST TENANT')).toBe('test-tenant')
    })

    it('应该处理多个空格', () => {
      expect(normalizeIdentifier('test   tenant')).toBe('test---tenant')
      expect(normalizeIdentifier('test  tenant  code')).toBe(
        'test--tenant--code',
      )
    })

    it('应该处理下划线和空格的混合', () => {
      expect(normalizeIdentifier('test_tenant code')).toBe('test-tenant-code')
      expect(normalizeIdentifier('test_tenant_code')).toBe('test-tenant-code')
    })

    it('应该去除首尾空格', () => {
      expect(normalizeIdentifier('  test-tenant  ')).toBe('test-tenant')
      expect(normalizeIdentifier('  test_tenant  ')).toBe('test-tenant')
    })

    it('应该转换为小写', () => {
      expect(normalizeIdentifier('TestTenant')).toBe('testtenant')
      expect(normalizeIdentifier('TEST-TENANT')).toBe('test-tenant')
    })

    it('应该处理数字和字母混合', () => {
      expect(normalizeIdentifier('test123')).toBe('test123')
      expect(normalizeIdentifier('test 123 tenant')).toBe('test-123-tenant')
    })

    it('应该处理边界情况', () => {
      expect(normalizeIdentifier('')).toBe('')
      expect(normalizeIdentifier('a')).toBe('a')
      expect(normalizeIdentifier('abc')).toBe('abc')
    })
  })

  /**
   * @test validateIdentifier测试
   * @description 测试编码校验功能
   */
  describe('validateIdentifier', () => {
    it('应该接受有效的编码', () => {
      expect(() => validateIdentifier('test-tenant')).not.toThrow()
      expect(() => validateIdentifier('test123')).not.toThrow()
      expect(() => validateIdentifier('abc')).not.toThrow()
    })

    it('应该拒绝空字符串', () => {
      expect(() => validateIdentifier('')).toThrow('编码不能为空')
      expect(() => validateIdentifier('   ')).toThrow('编码不能为空')
    })

    it('应该校验最小长度', () => {
      expect(() => validateIdentifier('ab')).toThrow('编码至少需要3个字符')
      expect(() => validateIdentifier('a')).toThrow('编码至少需要3个字符')
    })

    it('应该校验最大长度', () => {
      const longCode = 'a'.repeat(51)
      expect(() => validateIdentifier(longCode)).toThrow('编码不能超过50个字符')
    })

    it('应该拒绝包含大写字母的编码', () => {
      expect(() => validateIdentifier('Test-tenant')).toThrow(
        '编码只能包含小写字母、数字和连字符',
      )
      expect(() => validateIdentifier('test-Tenant')).toThrow(
        '编码只能包含小写字母、数字和连字符',
      )
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
        expect(() => validateIdentifier(`test${char}tenant`)).toThrow(
          '编码只能包含小写字母、数字和连字符',
        )
      })
    })

    it('应该拒绝以连字符开头或结尾的编码', () => {
      expect(() => validateIdentifier('-test-tenant')).toThrow(
        '编码不能以连字符开头或结尾',
      )
      expect(() => validateIdentifier('test-tenant-')).toThrow(
        '编码不能以连字符开头或结尾',
      )
      expect(() => validateIdentifier('-test-tenant-')).toThrow(
        '编码不能以连字符开头或结尾',
      )
    })

    it('应该根据配置处理连续连字符', () => {
      // 默认允许连续连字符
      expect(() => validateIdentifier('test--tenant')).not.toThrow()

      // 不允许连续连字符
      expect(() =>
        validateIdentifier('test--tenant', { allowConsecutiveHyphens: false }),
      ).toThrow('编码不能包含连续的连字符')
    })

    it('应该支持自定义长度范围', () => {
      // 自定义最小长度
      expect(() => validateIdentifier('ab', { minLength: 2 })).not.toThrow()
      expect(() => validateIdentifier('a', { minLength: 2 })).toThrow(
        '编码至少需要2个字符',
      )

      // 自定义最大长度
      expect(() => validateIdentifier('abc', { maxLength: 3 })).not.toThrow()
      expect(() => validateIdentifier('abcd', { maxLength: 3 })).toThrow(
        '编码不能超过3个字符',
      )
    })

    it('应该处理边界值', () => {
      // 最小长度边界
      expect(() => validateIdentifier('abc')).not.toThrow()
      expect(() => validateIdentifier('ab')).toThrow('编码至少需要3个字符')

      // 最大长度边界
      const maxLengthCode = 'a'.repeat(50)
      expect(() => validateIdentifier(maxLengthCode)).not.toThrow()
      const overMaxCode = 'a'.repeat(51)
      expect(() => validateIdentifier(overMaxCode)).toThrow(
        '编码不能超过50个字符',
      )
    })
  })

  /**
   * @test 集成测试
   * @description 测试normalizeIdentifier和validateIdentifier的集成使用
   */
  describe('集成测试', () => {
    it('应该能够标准化后校验', () => {
      const rawInput = '  Test_Tenant_Code  '
      const normalized = normalizeIdentifier(rawInput)

      expect(normalized).toBe('test-tenant-code')
      expect(() => validateIdentifier(normalized)).not.toThrow()
    })

    it('应该处理各种输入格式', () => {
      const testCases = [
        { input: 'Test Tenant', expected: 'test-tenant' },
        { input: 'test_tenant', expected: 'test-tenant' },
        { input: 'TEST TENANT', expected: 'test-tenant' },
        { input: '  test  tenant  ', expected: 'test--tenant' },
        { input: 'test-tenant-123', expected: 'test-tenant-123' },
      ]

      testCases.forEach(({ input, expected }) => {
        const normalized = normalizeIdentifier(input)
        expect(normalized).toBe(expected)
        expect(() => validateIdentifier(normalized)).not.toThrow()
      })
    })

    it('应该处理无效输入', () => {
      const invalidInputs = [
        'Test@Tenant',
        'test!tenant',
        'test#tenant',
        'test$tenant',
      ]

      invalidInputs.forEach((input) => {
        const normalized = normalizeIdentifier(input)
        expect(() => validateIdentifier(normalized)).toThrow(
          '编码只能包含小写字母、数字和连字符',
        )
      })
    })
  })

  /**
   * @test 性能测试
   * @description 测试工具函数的性能
   */
  describe('性能测试', () => {
    it('应该能够快速处理大量输入', () => {
      const startTime = Date.now()

      for (let i = 0; i < 1000; i++) {
        const input = `Test_Tenant_${i}`
        const normalized = normalizeIdentifier(input)
        validateIdentifier(normalized)
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
    })

    it('应该能够处理长字符串', () => {
      const longInput = 'a'.repeat(50) + '_' + 'b'.repeat(50)
      const startTime = Date.now()

      const normalized = normalizeIdentifier(longInput)
      validateIdentifier(normalized, { maxLength: 101 }) // 50 + 1 + 50 = 101

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
    })
  })

  /**
   * @test 边界条件测试
   * @description 测试各种边界条件
   */
  describe('边界条件', () => {
    it('应该处理Unicode字符', () => {
      expect(() => validateIdentifier('test🚀tenant')).toThrow(
        '编码只能包含小写字母、数字和连字符',
      )
    })

    it('应该处理数字编码', () => {
      expect(() => validateIdentifier('123456')).not.toThrow()
      expect(() => validateIdentifier('123')).not.toThrow()
    })

    it('应该处理纯字母编码', () => {
      expect(() => validateIdentifier('testtenant')).not.toThrow()
      expect(() => validateIdentifier('abc')).not.toThrow()
    })

    it('应该处理混合编码', () => {
      expect(() => validateIdentifier('test-tenant-123')).not.toThrow()
      expect(() => validateIdentifier('test123tenant')).not.toThrow()
    })
  })
})
