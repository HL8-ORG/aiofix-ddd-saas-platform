import { PermissionAction } from '../permission-action.value-object'

/**
 * @description 权限操作值对象测试
 * 测试权限操作枚举的创建、验证和比较功能
 */
describe('权限操作值对象测试', () => {
  describe('PermissionAction枚举', () => {
    it('应该包含所有预定义的权限操作', () => {
      expect(PermissionAction.CREATE).toBe('create')
      expect(PermissionAction.READ).toBe('read')
      expect(PermissionAction.UPDATE).toBe('update')
      expect(PermissionAction.DELETE).toBe('delete')
      expect(PermissionAction.MANAGE).toBe('manage')
      expect(PermissionAction.APPROVE).toBe('approve')
      expect(PermissionAction.EXPORT).toBe('export')
      expect(PermissionAction.IMPORT).toBe('import')
    })

    it('应该包含所有权限操作值', () => {
      const allActions = Object.values(PermissionAction)
      expect(allActions).toContain('create')
      expect(allActions).toContain('read')
      expect(allActions).toContain('update')
      expect(allActions).toContain('delete')
      expect(allActions).toContain('manage')
      expect(allActions).toContain('approve')
      expect(allActions).toContain('export')
      expect(allActions).toContain('import')
    })

    it('应该包含8个权限操作', () => {
      const allActions = Object.values(PermissionAction)
      expect(allActions).toHaveLength(8)
    })
  })

  describe('权限操作验证', () => {
    it('应该验证有效的权限操作', () => {
      const validActions = [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
        PermissionAction.MANAGE,
        PermissionAction.APPROVE,
        PermissionAction.EXPORT,
        PermissionAction.IMPORT,
      ]

      validActions.forEach(action => {
        expect(Object.values(PermissionAction)).toContain(action)
      })
    })

    it('应该拒绝无效的权限操作', () => {
      const invalidActions = ['invalid', 'test', 'unknown', '']
      
      invalidActions.forEach(action => {
        expect(Object.values(PermissionAction)).not.toContain(action)
      })
    })
  })

  describe('权限操作比较', () => {
    it('应该正确比较相同的权限操作', () => {
      expect(PermissionAction.CREATE).toBe(PermissionAction.CREATE)
      expect(PermissionAction.READ).toBe(PermissionAction.READ)
      expect(PermissionAction.UPDATE).toBe(PermissionAction.UPDATE)
    })

    it('应该正确比较不同的权限操作', () => {
      expect(PermissionAction.CREATE).not.toBe(PermissionAction.READ)
      expect(PermissionAction.UPDATE).not.toBe(PermissionAction.DELETE)
      expect(PermissionAction.MANAGE).not.toBe(PermissionAction.APPROVE)
    })
  })

  describe('权限操作分类', () => {
    it('应该正确分类CRUD操作', () => {
      const crudActions = [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
      ]

      crudActions.forEach(action => {
        expect(Object.values(PermissionAction)).toContain(action)
      })
    })

    it('应该正确分类管理操作', () => {
      const managementActions = [
        PermissionAction.MANAGE,
        PermissionAction.APPROVE,
      ]

      managementActions.forEach(action => {
        expect(Object.values(PermissionAction)).toContain(action)
      })
    })

    it('应该正确分类数据操作', () => {
      const dataActions = [
        PermissionAction.EXPORT,
        PermissionAction.IMPORT,
      ]

      dataActions.forEach(action => {
        expect(Object.values(PermissionAction)).toContain(action)
      })
    })
  })

  describe('权限操作字符串表示', () => {
    it('应该正确转换为字符串', () => {
      expect(String(PermissionAction.CREATE)).toBe('create')
      expect(String(PermissionAction.READ)).toBe('read')
      expect(String(PermissionAction.UPDATE)).toBe('update')
      expect(String(PermissionAction.DELETE)).toBe('delete')
    })

    it('应该正确进行JSON序列化', () => {
      const action = PermissionAction.MANAGE
      const serialized = JSON.stringify(action)
      expect(serialized).toBe('"manage"')
    })
  })

  describe('权限操作类型安全', () => {
    it('应该确保所有操作都是字符串类型', () => {
      Object.values(PermissionAction).forEach(action => {
        expect(typeof action).toBe('string')
      })
    })

    it('应该确保所有操作都是小写', () => {
      Object.values(PermissionAction).forEach(action => {
        expect(action).toBe(action.toLowerCase())
      })
    })
  })
}) 