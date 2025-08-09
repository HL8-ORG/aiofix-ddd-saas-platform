import { UserStatus, UserStatusValue } from '../user-status.value-object'

describe('UserStatusValue Value Object', () => {
  describe('枚举值', () => {
    it('应该包含所有预定义的用户状态', () => {
      expect(UserStatus.PENDING).toBe('PENDING')
      expect(UserStatus.ACTIVE).toBe('ACTIVE')
      expect(UserStatus.SUSPENDED).toBe('SUSPENDED')
      expect(UserStatus.DELETED).toBe('DELETED')
    })

    it('应该包含所有状态值', () => {
      const allStatuses = Object.values(UserStatus)
      expect(allStatuses).toContain('PENDING')
      expect(allStatuses).toContain('ACTIVE')
      expect(allStatuses).toContain('SUSPENDED')
      expect(allStatuses).toContain('DELETED')
    })
  })

  describe('构造函数', () => {
    it('应该成功创建有效的用户状态', () => {
      expect(() => new UserStatusValue(UserStatus.PENDING)).not.toThrow()
      expect(() => new UserStatusValue(UserStatus.ACTIVE)).not.toThrow()
      expect(() => new UserStatusValue(UserStatus.SUSPENDED)).not.toThrow()
      expect(() => new UserStatusValue(UserStatus.DELETED)).not.toThrow()
    })

    it('应该拒绝无效的用户状态', () => {
      expect(() => new UserStatusValue('INVALID' as any)).toThrow(
        '无效的用户状态',
      )
      expect(() => new UserStatusValue('' as any)).toThrow('无效的用户状态')
      expect(() => new UserStatusValue(null as any)).toThrow()
      expect(() => new UserStatusValue(undefined as any)).toThrow()
    })
  })

  describe('状态检查', () => {
    it('应该正确识别PENDING状态', () => {
      const status = new UserStatusValue(UserStatus.PENDING)
      expect(status.isPending()).toBe(true)
      expect(status.isActive()).toBe(false)
      expect(status.isSuspended()).toBe(false)
      expect(status.isDeleted()).toBe(false)
    })

    it('应该正确识别ACTIVE状态', () => {
      const status = new UserStatusValue(UserStatus.ACTIVE)
      expect(status.isPending()).toBe(false)
      expect(status.isActive()).toBe(true)
      expect(status.isSuspended()).toBe(false)
      expect(status.isDeleted()).toBe(false)
    })

    it('应该正确识别SUSPENDED状态', () => {
      const status = new UserStatusValue(UserStatus.SUSPENDED)
      expect(status.isPending()).toBe(false)
      expect(status.isActive()).toBe(false)
      expect(status.isSuspended()).toBe(true)
      expect(status.isDeleted()).toBe(false)
    })

    it('应该正确识别DELETED状态', () => {
      const status = new UserStatusValue(UserStatus.DELETED)
      expect(status.isPending()).toBe(false)
      expect(status.isActive()).toBe(false)
      expect(status.isSuspended()).toBe(false)
      expect(status.isDeleted()).toBe(true)
    })
  })

  describe('业务规则检查', () => {
    it('应该正确识别可登录状态', () => {
      const activeStatus = new UserStatusValue(UserStatus.ACTIVE)
      expect(activeStatus.canLogin()).toBe(true)

      const pendingStatus = new UserStatusValue(UserStatus.PENDING)
      expect(pendingStatus.canLogin()).toBe(false)

      const suspendedStatus = new UserStatusValue(UserStatus.SUSPENDED)
      expect(suspendedStatus.canLogin()).toBe(false)

      const deletedStatus = new UserStatusValue(UserStatus.DELETED)
      expect(deletedStatus.canLogin()).toBe(false)
    })

    it('应该正确识别可激活状态', () => {
      const activeStatus = new UserStatusValue(UserStatus.ACTIVE)
      expect(activeStatus.canActivate()).toBe(false)

      const pendingStatus = new UserStatusValue(UserStatus.PENDING)
      expect(pendingStatus.canActivate()).toBe(true)

      const suspendedStatus = new UserStatusValue(UserStatus.SUSPENDED)
      expect(suspendedStatus.canActivate()).toBe(true)

      const deletedStatus = new UserStatusValue(UserStatus.DELETED)
      expect(deletedStatus.canActivate()).toBe(false)
    })

    it('应该正确识别可禁用状态', () => {
      const activeStatus = new UserStatusValue(UserStatus.ACTIVE)
      expect(activeStatus.canSuspend()).toBe(true)

      const pendingStatus = new UserStatusValue(UserStatus.PENDING)
      expect(pendingStatus.canSuspend()).toBe(false)

      const suspendedStatus = new UserStatusValue(UserStatus.SUSPENDED)
      expect(suspendedStatus.canSuspend()).toBe(false)

      const deletedStatus = new UserStatusValue(UserStatus.DELETED)
      expect(deletedStatus.canSuspend()).toBe(false)
    })

    it('应该正确识别可删除状态', () => {
      const activeStatus = new UserStatusValue(UserStatus.ACTIVE)
      expect(activeStatus.canDelete()).toBe(true)

      const pendingStatus = new UserStatusValue(UserStatus.PENDING)
      expect(pendingStatus.canDelete()).toBe(false)

      const suspendedStatus = new UserStatusValue(UserStatus.SUSPENDED)
      expect(suspendedStatus.canDelete()).toBe(true)

      const deletedStatus = new UserStatusValue(UserStatus.DELETED)
      expect(deletedStatus.canDelete()).toBe(false)
    })

    it('应该正确识别可恢复状态', () => {
      const activeStatus = new UserStatusValue(UserStatus.ACTIVE)
      expect(activeStatus.canRestore()).toBe(false)

      const pendingStatus = new UserStatusValue(UserStatus.PENDING)
      expect(pendingStatus.canRestore()).toBe(false)

      const suspendedStatus = new UserStatusValue(UserStatus.SUSPENDED)
      expect(suspendedStatus.canRestore()).toBe(false)

      const deletedStatus = new UserStatusValue(UserStatus.DELETED)
      expect(deletedStatus.canRestore()).toBe(true)
    })
  })

  describe('显示信息', () => {
    it('应该返回正确的显示名称', () => {
      expect(new UserStatusValue(UserStatus.PENDING).getDisplayName()).toBe(
        '待激活',
      )
      expect(new UserStatusValue(UserStatus.ACTIVE).getDisplayName()).toBe(
        '激活',
      )
      expect(new UserStatusValue(UserStatus.SUSPENDED).getDisplayName()).toBe(
        '禁用',
      )
      expect(new UserStatusValue(UserStatus.DELETED).getDisplayName()).toBe(
        '已删除',
      )
    })

    it('应该返回正确的描述', () => {
      expect(new UserStatusValue(UserStatus.PENDING).getDescription()).toBe(
        '用户已注册但尚未激活，需要管理员激活或邮箱验证',
      )
      expect(new UserStatusValue(UserStatus.ACTIVE).getDescription()).toBe(
        '用户已激活，可以正常登录和使用系统',
      )
      expect(new UserStatusValue(UserStatus.SUSPENDED).getDescription()).toBe(
        '用户已被禁用，无法登录系统',
      )
      expect(new UserStatusValue(UserStatus.DELETED).getDescription()).toBe(
        '用户已被删除，数据保留用于审计',
      )
    })
  })

  describe('相等性比较', () => {
    it('应该正确比较相等的状态', () => {
      const status1 = new UserStatusValue(UserStatus.ACTIVE)
      const status2 = new UserStatusValue(UserStatus.ACTIVE)
      expect(status1.equals(status2)).toBe(true)
    })

    it('应该正确比较不相等的状态', () => {
      const status1 = new UserStatusValue(UserStatus.ACTIVE)
      const status2 = new UserStatusValue(UserStatus.SUSPENDED)
      expect(status1.equals(status2)).toBe(false)
    })
  })

  describe('静态方法', () => {
    describe('isValid', () => {
      it('应该正确验证有效的状态值', () => {
        expect(UserStatusValue.isValid(UserStatus.PENDING)).toBe(true)
        expect(UserStatusValue.isValid(UserStatus.ACTIVE)).toBe(true)
        expect(UserStatusValue.isValid(UserStatus.SUSPENDED)).toBe(true)
        expect(UserStatusValue.isValid(UserStatus.DELETED)).toBe(true)
      })

      it('应该正确验证无效的状态值', () => {
        expect(UserStatusValue.isValid('INVALID')).toBe(false)
        expect(UserStatusValue.isValid('')).toBe(false)
        expect(UserStatusValue.isValid(null as any)).toBe(false)
        expect(UserStatusValue.isValid(undefined as any)).toBe(false)
      })
    })

    describe('静态工厂方法', () => {
      it('应该正确创建PENDING状态', () => {
        const status = UserStatusValue.pending()
        expect(status.getValue()).toBe(UserStatus.PENDING)
      })

      it('应该正确创建ACTIVE状态', () => {
        const status = UserStatusValue.active()
        expect(status.getValue()).toBe(UserStatus.ACTIVE)
      })

      it('应该正确创建SUSPENDED状态', () => {
        const status = UserStatusValue.suspended()
        expect(status.getValue()).toBe(UserStatus.SUSPENDED)
      })

      it('应该正确创建DELETED状态', () => {
        const status = UserStatusValue.deleted()
        expect(status.getValue()).toBe(UserStatus.DELETED)
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串', () => {
      expect(() => new UserStatusValue('' as any)).toThrow('无效的用户状态')
    })

    it('应该处理null和undefined', () => {
      expect(() => new UserStatusValue(null as any)).toThrow()
      expect(() => new UserStatusValue(undefined as any)).toThrow()
    })

    it('应该处理大小写敏感', () => {
      // 由于使用zod的nativeEnum，字符串值会被自动转换，所以这个测试需要调整
      expect(() => new UserStatusValue('active' as any)).toThrow(
        '无效的用户状态',
      )
      expect(() => new UserStatusValue(UserStatus.ACTIVE)).not.toThrow()
    })
  })
})
