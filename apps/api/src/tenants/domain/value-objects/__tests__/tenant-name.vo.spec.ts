/**
 * @file tenant-name.vo.spec.ts
 * @description
 * 租户名称值对象的单元测试文件。该测试文件采用TDD开发原则，
 * 全面测试租户名称值对象的所有业务规则、边界条件和异常情况。
 *
 * 主要测试内容：
 * 1. 正常创建租户名称值对象
 * 2. 验证业务规则（长度、格式、字符限制等）
 * 3. 测试边界条件
 * 4. 测试异常情况
 * 5. 测试值对象方法（equals、toString、toJSON等）
 * 6. 测试静态方法
 */
import { TenantName } from '../tenant-name.vo'

describe('TenantName', () => {
  describe('构造函数', () => {
    it('应该成功创建有效的租户名称', () => {
      const validNames = [
        '测试租户',
        'Test Tenant',
        'Test-Tenant',
        'Test_Tenant',
        'Test123',
        '测试租户123',
        'Test Tenant 123',
      ]

      for (const name of validNames) {
        expect(() => new TenantName(name)).not.toThrow()
        const tenantName = new TenantName(name)
        expect(tenantName.getValue()).toBe(name.trim().replace(/\s+/g, ' '))
      }
    })

    it('应该标准化租户名称格式', () => {
      const testCases = [
        { input: '  测试租户  ', expected: '测试租户' },
        { input: 'Test   Tenant', expected: 'Test Tenant' },
        { input: '  Test-Tenant  ', expected: 'Test-Tenant' },
      ]

      for (const { input, expected } of testCases) {
        const tenantName = new TenantName(input)
        expect(tenantName.getValue()).toBe(expected)
      }
    })
  })

  describe('验证规则', () => {
    describe('空值验证', () => {
      it('应该拒绝空字符串', () => {
        expect(() => new TenantName('')).toThrow('租户名称不能为空')
      })

      it('应该拒绝null值', () => {
        expect(() => new TenantName(null as unknown as string)).toThrow('租户名称不能为空')
      })

      it('应该拒绝undefined值', () => {
        expect(() => new TenantName(undefined as unknown as string)).toThrow(
          '租户名称不能为空',
        )
      })

      it('应该拒绝只包含空格的字符串', () => {
        expect(() => new TenantName('   ')).toThrow('租户名称不能为空')
      })
    })

    describe('长度验证', () => {
      it('应该拒绝长度少于2个字符的名称', () => {
        expect(() => new TenantName('a')).toThrow('租户名称长度不能少于2个字符')
      })

      it('应该拒绝长度超过100个字符的名称', () => {
        const longName = 'a'.repeat(101)
        expect(() => new TenantName(longName)).toThrow(
          '租户名称长度不能超过100个字符',
        )
      })

      it('应该接受最小长度名称', () => {
        expect(() => new TenantName('ab')).not.toThrow()
      })

      it('应该接受最大长度名称', () => {
        const maxLengthName = 'a'.repeat(100)
        expect(() => new TenantName(maxLengthName)).not.toThrow()
      })
    })

    describe('字符验证', () => {
      it('应该拒绝包含特殊字符的名称', () => {
        const invalidNames = [
          'Test@Tenant',
          'Test#Tenant',
          'Test$Tenant',
          'Test%Tenant',
          'Test&Tenant',
          'Test*Tenant',
          'Test+Tenant',
          'Test=Tenant',
          'Test[Tenant',
          'Test]Tenant',
          'Test{Tenant',
          'Test}Tenant',
          'Test|Tenant',
          'Test\\Tenant',
          'Test/Tenant',
          'Test<Tenant',
          'Test>Tenant',
          'Test?Tenant',
          'Test!Tenant',
          'Test~Tenant',
        ]

        for (const name of invalidNames) {
          expect(() => new TenantName(name)).toThrow(
            '租户名称只能包含中文、英文、数字、空格、连字符和下划线',
          )
        }
      })

      it('应该接受包含允许字符的名称', () => {
        const validNames = [
          '测试租户',
          'Test Tenant',
          'Test-Tenant',
          'Test_Tenant',
          'Test123',
          '测试租户123',
          'Test Tenant 123',
          'Test-Tenant_123',
        ]

        for (const name of validNames) {
          expect(() => new TenantName(name)).not.toThrow()
        }
      })
    })

    describe('格式验证', () => {
      it('应该拒绝以数字开头的名称', () => {
        const invalidNames = ['123Test', '1Test', '0Test', '9Test']

        for (const name of invalidNames) {
          expect(() => new TenantName(name)).toThrow('租户名称不能以数字开头')
        }
      })

      it('应该接受包含连续空格的名称（会被标准化）', () => {
        const namesWithSpaces = [
          'Test  Tenant',
          'Test   Tenant',
          'Test    Tenant',
          '  Test  Tenant  ',
        ]

        for (const name of namesWithSpaces) {
          expect(() => new TenantName(name)).not.toThrow()
        }
      })
    })
  })

  describe('方法测试', () => {
    let tenantName: TenantName

    beforeEach(() => {
      tenantName = new TenantName('Test Tenant')
    })

    describe('getValue', () => {
      it('应该返回租户名称的值', () => {
        expect(tenantName.getValue()).toBe('Test Tenant')
      })
    })

    describe('getDisplayValue', () => {
      it('应该返回显示值', () => {
        expect(tenantName.getDisplayValue()).toBe('Test Tenant')
      })
    })

    describe('equals', () => {
      it('应该正确比较两个相等的租户名称', () => {
        const other = new TenantName('Test Tenant')
        expect(tenantName.equals(other)).toBe(true)
      })

      it('应该正确比较两个不相等的租户名称', () => {
        const other = new TenantName('Other Tenant')
        expect(tenantName.equals(other)).toBe(false)
      })

      it('应该正确处理null值', () => {
        expect(tenantName.equals(null as unknown as TenantName)).toBe(false)
      })

      it('应该正确处理undefined值', () => {
        expect(tenantName.equals(undefined as unknown as TenantName)).toBe(false)
      })

      it('应该正确处理自身比较', () => {
        expect(tenantName.equals(tenantName)).toBe(true)
      })
    })

    describe('toString', () => {
      it('应该返回字符串表示', () => {
        expect(tenantName.toString()).toBe('Test Tenant')
      })
    })

    describe('toJSON', () => {
      it('应该返回正确的JSON对象', () => {
        const json = tenantName.toJSON()
        expect(json).toEqual({
          value: 'Test Tenant',
          displayValue: 'Test Tenant',
        })
      })
    })
  })

  describe('静态方法', () => {
    describe('isValid', () => {
      it('应该正确验证有效的租户名称', () => {
        const validNames = [
          'Test Tenant',
          '测试租户',
          'Test-Tenant',
          'Test_Tenant',
          'Test123',
        ]

        for (const name of validNames) {
          expect(TenantName.isValid(name)).toBe(true)
        }
      })

      it('应该正确验证无效的租户名称', () => {
        const invalidNames = [
          '',
          'a',
          'a'.repeat(101),
          '123Test',
          'Test@Tenant',
        ]

        for (const name of invalidNames) {
          expect(TenantName.isValid(name)).toBe(false)
        }
      })
    })

    describe('create', () => {
      it('应该创建租户名称值对象', () => {
        const tenantName = TenantName.create('Test Tenant')
        expect(tenantName).toBeInstanceOf(TenantName)
        expect(tenantName.getValue()).toBe('Test Tenant')
      })
    })

    describe('getMinLength', () => {
      it('应该返回最小长度', () => {
        expect(TenantName.getMinLength()).toBe(2)
      })
    })

    describe('getMaxLength', () => {
      it('应该返回最大长度', () => {
        expect(TenantName.getMaxLength()).toBe(100)
      })
    })

    describe('getRegex', () => {
      it('应该返回正则表达式', () => {
        const regex = TenantName.getRegex()
        expect(regex).toBeInstanceOf(RegExp)
        expect(regex.test('Test Tenant')).toBe(true)
        expect(regex.test('Test@Tenant')).toBe(false)
      })
    })
  })

  describe('边界条件测试', () => {
    it('应该处理Unicode字符', () => {
      const unicodeNames = ['测试租户', 'Test租户', '租户Test', 'Test租户123']

      for (const name of unicodeNames) {
        expect(() => new TenantName(name)).not.toThrow()
      }
    })

    it('应该处理混合字符', () => {
      const mixedNames = [
        'Test-租户',
        'Test_租户',
        '租户-Test',
        '租户_Test',
        'Test-租户_123',
      ]

      for (const name of mixedNames) {
        expect(() => new TenantName(name)).not.toThrow()
      }
    })

    it('应该处理数字在中间和结尾', () => {
      const validNames = [
        'Test123',
        'Test-123',
        'Test_123',
        '租户123',
        'Test租户123',
      ]

      for (const name of validNames) {
        expect(() => new TenantName(name)).not.toThrow()
      }
    })
  })

  describe('性能测试', () => {
    it('应该能够处理大量字符的名称', () => {
      const longName = 'Test'.repeat(25) // 100个字符
      expect(() => new TenantName(longName)).not.toThrow()
    })

    it('应该能够快速验证大量名称', () => {
      const names = Array.from({ length: 1000 }, (_, i) => `Test${i}`)
      const startTime = Date.now()

      for (const name of names) {
        TenantName.isValid(name)
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
    })
  })
})
