import { RolePriority } from '../role-priority.value-object'

describe('RolePriority', () => {
  describe('constructor', () => {
    it('应该成功创建有效的角色优先级', () => {
      const priority = new RolePriority(1)
      expect(priority.getValue()).toBe(1)
    })

    it('应该成功创建高优先级', () => {
      const priority = new RolePriority(10)
      expect(priority.getValue()).toBe(10)
    })

    it('应该成功创建低优先级', () => {
      const priority = new RolePriority(100)
      expect(priority.getValue()).toBe(100)
    })
  })

  describe('validation', () => {
    it('应该拒绝负数优先级', () => {
      expect(() => new RolePriority(-1)).toThrow('角色优先级不能小于1')
    })

    it('应该拒绝null值', () => {
      expect(() => new RolePriority(null as any)).toThrow(
        '角色优先级不能大于1000, 角色优先级不能小于1, 角色优先级必须是数字',
      )
    })

    it('应该拒绝undefined值', () => {
      expect(() => new RolePriority(undefined as any)).toThrow(
        '角色优先级不能大于1000, 角色优先级不能小于1, 角色优先级必须是数字',
      )
    })

    it('应该拒绝非数字值', () => {
      expect(() => new RolePriority('invalid' as any)).toThrow(
        '角色优先级不能大于1000, 角色优先级不能小于1, 角色优先级必须是数字',
      )
    })

    it('应该拒绝超过最大值的优先级', () => {
      expect(() => new RolePriority(1001)).toThrow('角色优先级不能大于1000')
    })
  })

  describe('methods', () => {
    it('getValue应该返回优先级值', () => {
      const priority = new RolePriority(5)
      expect(priority.getValue()).toBe(5)
    })

    it('getDisplayPriority应该返回显示优先级', () => {
      const priority = new RolePriority(1)
      expect(priority.getDisplayPriority()).toBe('系统级')
    })

    it('getDescription应该返回描述', () => {
      const priority = new RolePriority(1)
      expect(priority.getDescription()).toBe(
        '系统级角色，拥有最高权限，可管理所有租户',
      )
    })

    it('toString应该返回字符串表示', () => {
      const priority = new RolePriority(5)
      expect(priority.toString()).toBe('5')
    })
  })

  describe('priority levels', () => {
    it('应该正确识别系统级优先级', () => {
      const priority = new RolePriority(1)
      expect(priority.isSystemLevel()).toBe(true)
    })

    it('应该正确识别租户级优先级', () => {
      const priority = new RolePriority(10)
      expect(priority.isTenantLevel()).toBe(true)
    })

    it('应该正确识别组织级优先级', () => {
      const priority = new RolePriority(50)
      expect(priority.isOrgLevel()).toBe(true)
    })

    it('应该正确识别用户级优先级', () => {
      const priority = new RolePriority(100)
      expect(priority.isUserLevel()).toBe(true)
    })

    it('应该正确识别访客级优先级', () => {
      const priority = new RolePriority(200)
      expect(priority.isGuestLevel()).toBe(true)
    })
  })

  describe('comparison methods', () => {
    it('应该正确比较优先级', () => {
      const highPriority = new RolePriority(1)
      const lowPriority = new RolePriority(100)

      expect(highPriority.isHigherThan(lowPriority)).toBe(true)
      expect(lowPriority.isLowerThan(highPriority)).toBe(true)
      expect(highPriority.isLowerThan(lowPriority)).toBe(false)
      expect(lowPriority.isHigherThan(highPriority)).toBe(false)
    })

    it('应该正确比较相等优先级', () => {
      const priority1 = new RolePriority(50)
      const priority2 = new RolePriority(50)

      expect(priority1.isHigherThan(priority2)).toBe(false)
      expect(priority1.isLowerThan(priority2)).toBe(false)
      expect(priority1.equals(priority2)).toBe(true)
    })
  })

  describe('static methods', () => {
    it('应该创建默认优先级', () => {
      const priority = RolePriority.getDefault()
      expect(priority.getValue()).toBe(100)
    })

    it('应该创建系统管理员优先级', () => {
      const priority = RolePriority.getSystemAdmin()
      expect(priority.getValue()).toBe(1)
    })

    it('应该创建租户管理员优先级', () => {
      const priority = RolePriority.getTenantAdmin()
      expect(priority.getValue()).toBe(10)
    })

    it('应该创建组织管理员优先级', () => {
      const priority = RolePriority.getOrgAdmin()
      expect(priority.getValue()).toBe(50)
    })

    it('应该创建用户优先级', () => {
      const priority = RolePriority.getUser()
      expect(priority.getValue()).toBe(100)
    })

    it('应该创建访客优先级', () => {
      const priority = RolePriority.getGuest()
      expect(priority.getValue()).toBe(200)
    })
  })

  describe('equality', () => {
    it('应该正确比较相等的优先级', () => {
      const priority1 = new RolePriority(50)
      const priority2 = new RolePriority(50)
      expect(priority1.equals(priority2)).toBe(true)
    })

    it('应该正确比较不等的优先级', () => {
      const priority1 = new RolePriority(50)
      const priority2 = new RolePriority(100)
      expect(priority1.equals(priority2)).toBe(false)
    })

    it('应该正确处理null比较', () => {
      const priority = new RolePriority(50)
      expect(priority.equals(null as any)).toBe(false)
    })
  })

  describe('display priorities', () => {
    it('应该返回正确的显示优先级', () => {
      expect(new RolePriority(1).getDisplayPriority()).toBe('系统级')
      expect(new RolePriority(10).getDisplayPriority()).toBe('租户级')
      expect(new RolePriority(50).getDisplayPriority()).toBe('组织级')
      expect(new RolePriority(100).getDisplayPriority()).toBe('用户级')
      expect(new RolePriority(200).getDisplayPriority()).toBe('访客级')
    })
  })

  describe('descriptions', () => {
    it('应该返回正确的描述', () => {
      expect(new RolePriority(1).getDescription()).toBe(
        '系统级角色，拥有最高权限，可管理所有租户',
      )
      expect(new RolePriority(10).getDescription()).toBe(
        '租户级角色，拥有租户内最高权限，可管理租户内所有资源',
      )
      expect(new RolePriority(50).getDescription()).toBe(
        '组织级角色，拥有组织内管理权限，可管理组织内资源',
      )
      expect(new RolePriority(100).getDescription()).toBe(
        '用户级角色，拥有基本操作权限，可进行日常业务操作',
      )
      expect(new RolePriority(200).getDescription()).toBe(
        '访客级角色，拥有只读权限，仅可查看部分信息',
      )
    })
  })

  describe('edge cases', () => {
    it('应该接受最小优先级值', () => {
      const priority = new RolePriority(1)
      expect(priority.getValue()).toBe(1)
    })

    it('应该接受最大优先级值', () => {
      const priority = new RolePriority(1000)
      expect(priority.getValue()).toBe(1000)
    })

    it('应该正确处理边界值', () => {
      expect(() => new RolePriority(1001)).toThrow('角色优先级不能大于1000')
      expect(() => new RolePriority(-1)).toThrow('角色优先级不能小于1')
    })
  })
})
