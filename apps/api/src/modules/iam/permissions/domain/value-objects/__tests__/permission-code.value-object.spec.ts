import { PermissionCode } from '../permission-code.value-object'

describe('PermissionCode', () => {
  describe('constructor', () => {
    it('应该成功创建有效的权限代码', () => {
      const permissionCode = new PermissionCode('USER_MANAGE')
      expect(permissionCode.getValue()).toBe('USER_MANAGE')
    })

    it('应该规范化权限代码', () => {
      const permissionCode = new PermissionCode('  user_manage  ')
      expect(permissionCode.getValue()).toBe('USER_MANAGE')
    })

    it('应该将多个连续下划线替换为单个下划线', () => {
      const permissionCode = new PermissionCode('USER__MANAGE')
      expect(permissionCode.getValue()).toBe('USER_MANAGE')
    })

    it('应该去除首尾的下划线', () => {
      const permissionCode = new PermissionCode('_USER_MANAGE_')
      expect(permissionCode.getValue()).toBe('USER_MANAGE')
    })
  })

  describe('validation', () => {
    it('应该拒绝空字符串', () => {
      expect(() => new PermissionCode('')).toThrow('权限代码不能为空')
    })

    it('应该拒绝null值', () => {
      expect(() => new PermissionCode(null as any)).toThrow('权限代码不能为空')
    })

    it('应该拒绝undefined值', () => {
      expect(() => new PermissionCode(undefined as any)).toThrow(
        '权限代码不能为空',
      )
    })

    it('应该拒绝少于3个字符的代码', () => {
      expect(() => new PermissionCode('AB')).toThrow(
        '权限代码长度不能少于3个字符',
      )
    })

    it('应该拒绝超过30个字符的代码', () => {
      const longCode = 'A'.repeat(31)
      expect(() => new PermissionCode(longCode)).toThrow(
        '权限代码长度不能超过30个字符',
      )
    })

    it('应该拒绝不以字母开头的代码', () => {
      expect(() => new PermissionCode('1USER_MANAGE')).toThrow(
        '权限代码必须以字母开头',
      )
    })

    it('应该规范化包含小写字母的代码', () => {
      const permissionCode = new PermissionCode('User_Manage')
      expect(permissionCode.getValue()).toBe('USER_MANAGE')
    })

    it('应该规范化包含连续下划线的代码', () => {
      const permissionCode = new PermissionCode('USER__MANAGE')
      expect(permissionCode.getValue()).toBe('USER_MANAGE')
    })

    it('应该规范化以下划线结尾的代码', () => {
      const permissionCode = new PermissionCode('USER_MANAGE_')
      expect(permissionCode.getValue()).toBe('USER_MANAGE')
    })

    it('应该接受有效的权限代码', () => {
      const permissionCode = new PermissionCode('USER_MANAGE')
      expect(permissionCode.getValue()).toBe('USER_MANAGE')
    })

    it('应该接受包含数字的代码', () => {
      const permissionCode = new PermissionCode('USER_MANAGE_2')
      expect(permissionCode.getValue()).toBe('USER_MANAGE_2')
    })
  })

  describe('getValue', () => {
    it('应该返回权限代码值', () => {
      const permissionCode = new PermissionCode('USER_MANAGE')
      expect(permissionCode.getValue()).toBe('USER_MANAGE')
    })
  })

  describe('getDisplayCode', () => {
    it('应该返回权限代码显示值', () => {
      const permissionCode = new PermissionCode('USER_MANAGE')
      expect(permissionCode.getDisplayCode()).toBe('USER_MANAGE')
    })
  })

  describe('getShortCode', () => {
    it('应该返回完整的短代码（当长度不超过15个字符时）', () => {
      const permissionCode = new PermissionCode('USER_MANAGE')
      expect(permissionCode.getShortCode()).toBe('USER_MANAGE')
    })

    it('应该返回截断的短代码（当长度超过15个字符时）', () => {
      const longCode = 'VERY_LONG_PERMISSION_CODE'
      const permissionCode = new PermissionCode(longCode)
      expect(permissionCode.getShortCode()).toBe('VERY_LONG_PERMI...')
    })
  })

  describe('isSystemCode', () => {
    it('应该正确识别系统权限代码', () => {
      const systemCodes = [
        'USER_CREATE',
        'USER_READ',
        'USER_UPDATE',
        'USER_DELETE',
        'USER_MANAGE',
        'ROLE_CREATE',
        'ROLE_READ',
        'ROLE_UPDATE',
        'ROLE_DELETE',
        'ROLE_MANAGE',
        'PERMISSION_CREATE',
        'PERMISSION_READ',
        'PERMISSION_UPDATE',
        'PERMISSION_DELETE',
        'PERMISSION_MANAGE',
        'TENANT_MANAGE',
        'SYSTEM_ADMIN',
      ]

      systemCodes.forEach((code) => {
        const permissionCode = new PermissionCode(code)
        expect(permissionCode.isSystemCode()).toBe(true)
      })
    })

    it('应该正确识别非系统权限代码', () => {
      const permissionCode = new PermissionCode('CUSTOM_PERMISSION')
      expect(permissionCode.isSystemCode()).toBe(false)
    })
  })

  describe('isDefaultCode', () => {
    it('应该正确识别默认权限代码', () => {
      const defaultCodes = ['USER_READ', 'ROLE_READ', 'PERMISSION_READ']

      defaultCodes.forEach((code) => {
        const permissionCode = new PermissionCode(code)
        expect(permissionCode.isDefaultCode()).toBe(true)
      })
    })

    it('应该正确识别非默认权限代码', () => {
      const permissionCode = new PermissionCode('USER_CREATE')
      expect(permissionCode.isDefaultCode()).toBe(false)
    })
  })

  describe('equals', () => {
    it('应该正确比较两个相同的权限代码', () => {
      const code1 = new PermissionCode('USER_MANAGE')
      const code2 = new PermissionCode('USER_MANAGE')
      expect(code1.equals(code2)).toBe(true)
    })

    it('应该正确比较两个不同的权限代码', () => {
      const code1 = new PermissionCode('USER_MANAGE')
      const code2 = new PermissionCode('ROLE_MANAGE')
      expect(code1.equals(code2)).toBe(false)
    })

    it('应该处理null比较', () => {
      const code1 = new PermissionCode('USER_MANAGE')
      expect(code1.equals(null as any)).toBe(false)
    })
  })

  describe('toString', () => {
    it('应该返回权限代码字符串', () => {
      const permissionCode = new PermissionCode('USER_MANAGE')
      expect(permissionCode.toString()).toBe('USER_MANAGE')
    })
  })
})
