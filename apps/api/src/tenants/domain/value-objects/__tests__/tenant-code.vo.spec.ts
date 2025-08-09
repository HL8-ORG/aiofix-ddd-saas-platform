/**
 * @file tenant-code.vo.spec.ts
 * @description 租户编码值对象的单元测试文件
 */
import { TenantCode } from '../tenant-code.vo'

describe('TenantCode', () => {
  describe('构造函数', () => {
    it('应该成功创建有效的租户编码', () => {
      const validCodes = ['test', 'test_tenant', 'test123']
      validCodes.forEach((code) => {
        expect(() => new TenantCode(code)).not.toThrow()
      })
    })

    it('应该标准化租户编码格式（转换为小写）', () => {
      const tenantCode = new TenantCode('test')
      expect(tenantCode.getValue()).toBe('test')
    })
  })

  describe('验证规则', () => {
    it('应该拒绝空字符串', () => {
      expect(() => new TenantCode('')).toThrow('租户编码不能为空')
    })

    it('应该拒绝长度少于3个字符的编码', () => {
      expect(() => new TenantCode('ab')).toThrow('租户编码长度不能少于3个字符')
    })

    it('应该拒绝长度超过20个字符的编码', () => {
      const longCode = 'a'.repeat(21)
      expect(() => new TenantCode(longCode)).toThrow(
        '租户编码长度不能超过20个字符',
      )
    })

    it('应该拒绝以数字开头的编码', () => {
      expect(() => new TenantCode('123test')).toThrow(
        '租户编码必须以字母开头，只能包含字母、数字和下划线',
      )
    })

    it('应该拒绝包含连续下划线的编码', () => {
      expect(() => new TenantCode('test__tenant')).toThrow(
        '租户编码不能包含连续的下划线',
      )
    })

    it('应该拒绝以下划线结尾的编码', () => {
      expect(() => new TenantCode('test_')).toThrow('租户编码不能以下划线结尾')
    })
  })

  describe('方法测试', () => {
    let tenantCode: TenantCode

    beforeEach(() => {
      tenantCode = new TenantCode('test_tenant')
    })

    it('应该返回正确的值', () => {
      expect(tenantCode.getValue()).toBe('test_tenant')
    })

    it('应该返回首字母大写的显示值', () => {
      expect(tenantCode.getDisplayValue()).toBe('Test_tenant')
    })

    it('应该正确比较两个相等的租户编码', () => {
      const other = new TenantCode('test_tenant')
      expect(tenantCode.equals(other)).toBe(true)
    })

    it('应该正确比较两个不相等的租户编码', () => {
      const other = new TenantCode('other_tenant')
      expect(tenantCode.equals(other)).toBe(false)
    })
  })

  describe('静态方法', () => {
    it('应该正确验证有效的租户编码', () => {
      expect(TenantCode.isValid('test')).toBe(true)
      expect(TenantCode.isValid('')).toBe(false)
    })

    it('应该返回正确的长度限制', () => {
      expect(TenantCode.getMinLength()).toBe(3)
      expect(TenantCode.getMaxLength()).toBe(20)
    })
  })
})
