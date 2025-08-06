import { PermissionName } from '../../value-objects/permission-name.value-object'

describe('PermissionName', () => {
  describe('constructor', () => {
    it('应该成功创建有效的权限名称', () => {
      const permissionName = new PermissionName('用户管理')
      expect(permissionName.getValue()).toBe('用户管理')
    })

    it('应该规范化权限名称', () => {
      const permissionName = new PermissionName('  用户管理  ')
      expect(permissionName.getValue()).toBe('用户管理')
    })

    it('应该将多个空格替换为单个空格', () => {
      const permissionName = new PermissionName('用户  管理')
      expect(permissionName.getValue()).toBe('用户 管理')
    })
  })

  describe('validation', () => {
    it('应该拒绝空字符串', () => {
      expect(() => new PermissionName('')).toThrow('权限名称不能为空')
    })

    it('应该拒绝null值', () => {
      expect(() => new PermissionName(null as any)).toThrow('权限名称不能为空')
    })

    it('应该拒绝undefined值', () => {
      expect(() => new PermissionName(undefined as any)).toThrow(
        '权限名称不能为空',
      )
    })

    it('应该拒绝少于2个字符的名称', () => {
      expect(() => new PermissionName('A')).toThrow(
        '权限名称长度不能少于2个字符',
      )
    })

    it('应该拒绝超过50个字符的名称', () => {
      const longName = 'A'.repeat(51)
      expect(() => new PermissionName(longName)).toThrow(
        '权限名称长度不能超过50个字符',
      )
    })

    it('应该拒绝以数字开头的名称', () => {
      expect(() => new PermissionName('1用户管理')).toThrow(
        '权限名称不能以数字开头',
      )
    })

    it('应该拒绝包含连续特殊字符的名称', () => {
      expect(() => new PermissionName('用户@@管理')).toThrow(
        '权限名称不能包含连续的特殊字符',
      )
    })

    it('应该拒绝包含不允许字符的名称', () => {
      expect(() => new PermissionName('用户管理@')).toThrow(
        '权限名称只能包含字母、数字、下划线、连字符、中文和空格',
      )
    })

    it('应该接受包含中文的名称', () => {
      const permissionName = new PermissionName('用户管理权限')
      expect(permissionName.getValue()).toBe('用户管理权限')
    })

    it('应该接受包含英文的名称', () => {
      const permissionName = new PermissionName('User Management')
      expect(permissionName.getValue()).toBe('User Management')
    })

    it('应该接受包含数字的名称（不在开头）', () => {
      const permissionName = new PermissionName('用户管理2')
      expect(permissionName.getValue()).toBe('用户管理2')
    })

    it('应该接受包含下划线的名称', () => {
      const permissionName = new PermissionName('用户_管理')
      expect(permissionName.getValue()).toBe('用户_管理')
    })

    it('应该接受包含连字符的名称', () => {
      const permissionName = new PermissionName('用户-管理')
      expect(permissionName.getValue()).toBe('用户-管理')
    })
  })

  describe('getValue', () => {
    it('应该返回权限名称值', () => {
      const permissionName = new PermissionName('用户管理')
      expect(permissionName.getValue()).toBe('用户管理')
    })
  })

  describe('getDisplayName', () => {
    it('应该返回去除前后空格的显示名称', () => {
      const permissionName = new PermissionName('  用户管理  ')
      expect(permissionName.getDisplayName()).toBe('用户管理')
    })
  })

  describe('getShortName', () => {
    it('应该返回完整的短名称（当长度不超过20个字符时）', () => {
      const permissionName = new PermissionName('用户管理')
      expect(permissionName.getShortName()).toBe('用户管理')
    })

    it('应该返回截断的短名称（当长度超过20个字符时）', () => {
      const longName = '这是一个非常非常长的权限名称用于测试截断功能'
      const permissionName = new PermissionName(longName)
      expect(permissionName.getShortName()).toBe(
        '这是一个非常非常长的权限名称用于测试截断...',
      )
    })
  })

  describe('equals', () => {
    it('应该正确比较两个相同的权限名称', () => {
      const name1 = new PermissionName('用户管理')
      const name2 = new PermissionName('用户管理')
      expect(name1.equals(name2)).toBe(true)
    })

    it('应该正确比较两个不同的权限名称', () => {
      const name1 = new PermissionName('用户管理')
      const name2 = new PermissionName('角色管理')
      expect(name1.equals(name2)).toBe(false)
    })

    it('应该忽略大小写进行比较', () => {
      const name1 = new PermissionName('User Management')
      const name2 = new PermissionName('user management')
      expect(name1.equals(name2)).toBe(true)
    })

    it('应该处理null比较', () => {
      const name1 = new PermissionName('用户管理')
      expect(name1.equals(null as any)).toBe(false)
    })
  })

  describe('toString', () => {
    it('应该返回权限名称字符串', () => {
      const permissionName = new PermissionName('用户管理')
      expect(permissionName.toString()).toBe('用户管理')
    })
  })
})
