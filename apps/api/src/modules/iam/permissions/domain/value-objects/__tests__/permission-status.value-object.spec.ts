import {
  PermissionStatus,
  PermissionStatusValue,
} from '../permission-status.value-object'

describe('PermissionStatusValue', () => {
  describe('constructor', () => {
    it('应该成功创建激活状态', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.ACTIVE,
      )
      expect(permissionStatus.getValue()).toBe(PermissionStatus.ACTIVE)
    })

    it('应该成功创建禁用状态', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.INACTIVE,
      )
      expect(permissionStatus.getValue()).toBe(PermissionStatus.INACTIVE)
    })

    it('应该成功创建暂停状态', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.SUSPENDED,
      )
      expect(permissionStatus.getValue()).toBe(PermissionStatus.SUSPENDED)
    })

    it('应该成功创建过期状态', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.EXPIRED,
      )
      expect(permissionStatus.getValue()).toBe(PermissionStatus.EXPIRED)
    })
  })

  describe('validation', () => {
    it('应该拒绝无效的权限状态', () => {
      expect(() => new PermissionStatusValue('invalid' as any)).toThrow(
        '无效的权限状态: invalid',
      )
    })
  })

  describe('getValue', () => {
    it('应该返回权限状态值', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.ACTIVE,
      )
      expect(permissionStatus.getValue()).toBe(PermissionStatus.ACTIVE)
    })
  })

  describe('getDisplayName', () => {
    it('应该返回激活状态的显示名称', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.ACTIVE,
      )
      expect(permissionStatus.getDisplayName()).toBe('启用')
    })

    it('应该返回禁用状态的显示名称', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.INACTIVE,
      )
      expect(permissionStatus.getDisplayName()).toBe('禁用')
    })

    it('应该返回暂停状态的显示名称', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.SUSPENDED,
      )
      expect(permissionStatus.getDisplayName()).toBe('暂停')
    })

    it('应该返回过期状态的显示名称', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.EXPIRED,
      )
      expect(permissionStatus.getDisplayName()).toBe('过期')
    })
  })

  describe('getDescription', () => {
    it('应该返回激活状态的描述', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.ACTIVE,
      )
      expect(permissionStatus.getDescription()).toBe('权限已启用，可以正常使用')
    })

    it('应该返回禁用状态的描述', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.INACTIVE,
      )
      expect(permissionStatus.getDescription()).toBe('权限已禁用，暂时无法使用')
    })

    it('应该返回暂停状态的描述', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.SUSPENDED,
      )
      expect(permissionStatus.getDescription()).toBe(
        '权限已暂停，需要管理员重新启用',
      )
    })

    it('应该返回过期状态的描述', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.EXPIRED,
      )
      expect(permissionStatus.getDescription()).toBe('权限已过期，需要重新申请')
    })
  })

  describe('status checking methods', () => {
    it('应该正确识别激活状态', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.ACTIVE,
      )
      expect(permissionStatus.isActive()).toBe(true)
      expect(permissionStatus.isInactive()).toBe(false)
      expect(permissionStatus.isSuspended()).toBe(false)
      expect(permissionStatus.isExpired()).toBe(false)
    })

    it('应该正确识别禁用状态', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.INACTIVE,
      )
      expect(permissionStatus.isActive()).toBe(false)
      expect(permissionStatus.isInactive()).toBe(true)
      expect(permissionStatus.isSuspended()).toBe(false)
      expect(permissionStatus.isExpired()).toBe(false)
    })

    it('应该正确识别暂停状态', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.SUSPENDED,
      )
      expect(permissionStatus.isActive()).toBe(false)
      expect(permissionStatus.isInactive()).toBe(false)
      expect(permissionStatus.isSuspended()).toBe(true)
      expect(permissionStatus.isExpired()).toBe(false)
    })

    it('应该正确识别过期状态', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.EXPIRED,
      )
      expect(permissionStatus.isActive()).toBe(false)
      expect(permissionStatus.isInactive()).toBe(false)
      expect(permissionStatus.isSuspended()).toBe(false)
      expect(permissionStatus.isExpired()).toBe(true)
    })
  })

  describe('business logic methods', () => {
    it('应该正确判断是否可以激活', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(
        PermissionStatus.INACTIVE,
      )
      const suspendedStatus = new PermissionStatusValue(
        PermissionStatus.SUSPENDED,
      )
      const expiredStatus = new PermissionStatusValue(PermissionStatus.EXPIRED)

      expect(activeStatus.canBeActivated()).toBe(false)
      expect(inactiveStatus.canBeActivated()).toBe(true)
      expect(suspendedStatus.canBeActivated()).toBe(true)
      expect(expiredStatus.canBeActivated()).toBe(false)
    })

    it('应该正确判断是否可以暂停', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(
        PermissionStatus.INACTIVE,
      )
      const suspendedStatus = new PermissionStatusValue(
        PermissionStatus.SUSPENDED,
      )
      const expiredStatus = new PermissionStatusValue(PermissionStatus.EXPIRED)

      expect(activeStatus.canBeSuspended()).toBe(true)
      expect(inactiveStatus.canBeSuspended()).toBe(false)
      expect(suspendedStatus.canBeSuspended()).toBe(false)
      expect(expiredStatus.canBeSuspended()).toBe(false)
    })

    it('应该正确判断是否可以禁用', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(
        PermissionStatus.INACTIVE,
      )
      const suspendedStatus = new PermissionStatusValue(
        PermissionStatus.SUSPENDED,
      )
      const expiredStatus = new PermissionStatusValue(PermissionStatus.EXPIRED)

      expect(activeStatus.canBeDeactivated()).toBe(true)
      expect(inactiveStatus.canBeDeactivated()).toBe(false)
      expect(suspendedStatus.canBeDeactivated()).toBe(true)
      expect(expiredStatus.canBeDeactivated()).toBe(false)
    })
  })

  describe('equals', () => {
    it('应该正确比较两个相同的权限状态', () => {
      const status1 = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const status2 = new PermissionStatusValue(PermissionStatus.ACTIVE)
      expect(status1.equals(status2)).toBe(true)
    })

    it('应该正确比较两个不同的权限状态', () => {
      const status1 = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const status2 = new PermissionStatusValue(PermissionStatus.INACTIVE)
      expect(status1.equals(status2)).toBe(false)
    })

    it('应该处理null比较', () => {
      const status1 = new PermissionStatusValue(PermissionStatus.ACTIVE)
      expect(status1.equals(null as any)).toBe(false)
    })
  })

  describe('toString', () => {
    it('应该返回权限状态字符串', () => {
      const permissionStatus = new PermissionStatusValue(
        PermissionStatus.ACTIVE,
      )
      expect(permissionStatus.toString()).toBe(PermissionStatus.ACTIVE)
    })
  })

  describe('static factory methods', () => {
    it('应该通过静态方法创建激活状态', () => {
      const permissionStatus = PermissionStatusValue.getActive()
      expect(permissionStatus.getValue()).toBe(PermissionStatus.ACTIVE)
      expect(permissionStatus.isActive()).toBe(true)
    })

    it('应该通过静态方法创建禁用状态', () => {
      const permissionStatus = PermissionStatusValue.getInactive()
      expect(permissionStatus.getValue()).toBe(PermissionStatus.INACTIVE)
      expect(permissionStatus.isInactive()).toBe(true)
    })

    it('应该通过静态方法创建暂停状态', () => {
      const permissionStatus = PermissionStatusValue.getSuspended()
      expect(permissionStatus.getValue()).toBe(PermissionStatus.SUSPENDED)
      expect(permissionStatus.isSuspended()).toBe(true)
    })

    it('应该通过静态方法创建过期状态', () => {
      const permissionStatus = PermissionStatusValue.getExpired()
      expect(permissionStatus.getValue()).toBe(PermissionStatus.EXPIRED)
      expect(permissionStatus.isExpired()).toBe(true)
    })
  })
})
