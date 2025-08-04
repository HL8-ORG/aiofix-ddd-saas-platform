import { PermissionStatus, PermissionStatusValue } from '../../value-objects/permission-status.value-object'

/**
 * @description 权限状态值对象测试
 * 测试权限状态枚举和值对象的创建、验证和比较功能
 */
describe('权限状态值对象测试', () => {
  describe('PermissionStatus枚举', () => {
    it('应该包含所有预定义的权限状态', () => {
      expect(PermissionStatus.ACTIVE).toBe('active')
      expect(PermissionStatus.INACTIVE).toBe('inactive')
      expect(PermissionStatus.SUSPENDED).toBe('suspended')
      expect(PermissionStatus.EXPIRED).toBe('expired')
    })

    it('应该包含所有权限状态值', () => {
      const allStatuses = Object.values(PermissionStatus)
      expect(allStatuses).toContain('active')
      expect(allStatuses).toContain('inactive')
      expect(allStatuses).toContain('suspended')
      expect(allStatuses).toContain('expired')
    })

    it('应该包含4个权限状态', () => {
      const allStatuses = Object.values(PermissionStatus)
      expect(allStatuses).toHaveLength(4)
    })
  })

  describe('PermissionStatusValue类', () => {
    it('应该正确创建权限状态值对象', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      expect(activeStatus.getValue()).toBe(PermissionStatus.ACTIVE)
      expect(activeStatus.toString()).toBe('active')
    })

    it('应该正确创建所有权限状态', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(PermissionStatus.INACTIVE)
      const suspendedStatus = new PermissionStatusValue(PermissionStatus.SUSPENDED)
      const expiredStatus = new PermissionStatusValue(PermissionStatus.EXPIRED)

      expect(activeStatus.getValue()).toBe('active')
      expect(inactiveStatus.getValue()).toBe('inactive')
      expect(suspendedStatus.getValue()).toBe('suspended')
      expect(expiredStatus.getValue()).toBe('expired')
    })

    it('应该正确比较权限状态', () => {
      const status1 = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const status2 = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const status3 = new PermissionStatusValue(PermissionStatus.INACTIVE)

      expect(status1.equals(status2)).toBe(true)
      expect(status1.equals(status3)).toBe(false)
    })

    it('应该正确转换为字符串', () => {
      const status = new PermissionStatusValue(PermissionStatus.SUSPENDED)
      expect(status.toString()).toBe('suspended')
      expect(String(status)).toBe('suspended')
    })

    it('应该正确进行JSON序列化', () => {
      const status = new PermissionStatusValue(PermissionStatus.EXPIRED)
      const serialized = JSON.stringify(status)
      expect(serialized).toBe('"expired"')
    })

    it('应该正确获取显示名称', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(PermissionStatus.INACTIVE)
      const suspendedStatus = new PermissionStatusValue(PermissionStatus.SUSPENDED)
      const expiredStatus = new PermissionStatusValue(PermissionStatus.EXPIRED)

      expect(activeStatus.getDisplayName()).toBe('启用')
      expect(inactiveStatus.getDisplayName()).toBe('禁用')
      expect(suspendedStatus.getDisplayName()).toBe('暂停')
      expect(expiredStatus.getDisplayName()).toBe('过期')
    })

    it('应该正确获取描述', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(PermissionStatus.INACTIVE)

      expect(activeStatus.getDescription()).toBe('权限已启用，可以正常使用')
      expect(inactiveStatus.getDescription()).toBe('权限已禁用，暂时无法使用')
    })
  })

  describe('权限状态验证', () => {
    it('应该验证有效的权限状态', () => {
      const validStatuses = [
        PermissionStatus.ACTIVE,
        PermissionStatus.INACTIVE,
        PermissionStatus.SUSPENDED,
        PermissionStatus.EXPIRED,
      ]

      validStatuses.forEach(status => {
        expect(() => new PermissionStatusValue(status)).not.toThrow()
      })
    })

    it('应该拒绝无效的权限状态', () => {
      const invalidStatuses = ['invalid', 'test', 'unknown', '']

      invalidStatuses.forEach(status => {
        expect(() => {
          new PermissionStatusValue(status as PermissionStatus)
        }).toThrow()
      })
    })
  })

  describe('权限状态业务逻辑', () => {
    it('应该正确判断是否为激活状态', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(PermissionStatus.INACTIVE)

      expect(activeStatus.isActive()).toBe(true)
      expect(inactiveStatus.isActive()).toBe(false)
    })

    it('应该正确判断是否为禁用状态', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(PermissionStatus.INACTIVE)

      expect(activeStatus.isInactive()).toBe(false)
      expect(inactiveStatus.isInactive()).toBe(true)
    })

    it('应该正确判断是否为暂停状态', () => {
      const suspendedStatus = new PermissionStatusValue(PermissionStatus.SUSPENDED)
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)

      expect(suspendedStatus.isSuspended()).toBe(true)
      expect(activeStatus.isSuspended()).toBe(false)
    })

    it('应该正确判断是否为过期状态', () => {
      const expiredStatus = new PermissionStatusValue(PermissionStatus.EXPIRED)
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)

      expect(expiredStatus.isExpired()).toBe(true)
      expect(activeStatus.isExpired()).toBe(false)
    })
  })

  describe('权限状态转换检查', () => {
    it('应该正确检查是否可以激活', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(PermissionStatus.INACTIVE)
      const suspendedStatus = new PermissionStatusValue(PermissionStatus.SUSPENDED)

      expect(activeStatus.canBeActivated()).toBe(false)
      expect(inactiveStatus.canBeActivated()).toBe(true)
      expect(suspendedStatus.canBeActivated()).toBe(true)
    })

    it('应该正确检查是否可以暂停', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(PermissionStatus.INACTIVE)

      expect(activeStatus.canBeSuspended()).toBe(true)
      expect(inactiveStatus.canBeSuspended()).toBe(false)
    })

    it('应该正确检查是否可以禁用', () => {
      const activeStatus = new PermissionStatusValue(PermissionStatus.ACTIVE)
      const inactiveStatus = new PermissionStatusValue(PermissionStatus.INACTIVE)
      const suspendedStatus = new PermissionStatusValue(PermissionStatus.SUSPENDED)

      expect(activeStatus.canBeDeactivated()).toBe(true)
      expect(inactiveStatus.canBeDeactivated()).toBe(false)
      expect(suspendedStatus.canBeDeactivated()).toBe(true)
    })
  })

  describe('静态方法', () => {
    it('应该正确获取激活状态', () => {
      const activeStatus = PermissionStatusValue.getActive()
      expect(activeStatus.getValue()).toBe(PermissionStatus.ACTIVE)
    })

    it('应该正确获取禁用状态', () => {
      const inactiveStatus = PermissionStatusValue.getInactive()
      expect(inactiveStatus.getValue()).toBe(PermissionStatus.INACTIVE)
    })

    it('应该正确获取暂停状态', () => {
      const suspendedStatus = PermissionStatusValue.getSuspended()
      expect(suspendedStatus.getValue()).toBe(PermissionStatus.SUSPENDED)
    })

    it('应该正确获取过期状态', () => {
      const expiredStatus = PermissionStatusValue.getExpired()
      expect(expiredStatus.getValue()).toBe(PermissionStatus.EXPIRED)
    })
  })

  describe('权限状态类型安全', () => {
    it('应该确保所有状态都是字符串类型', () => {
      Object.values(PermissionStatus).forEach(status => {
        expect(typeof status).toBe('string')
      })
    })

    it('应该确保所有状态都是小写', () => {
      Object.values(PermissionStatus).forEach(status => {
        expect(status).toBe(status.toLowerCase())
      })
    })
  })

  describe('权限状态错误处理', () => {
    it('应该拒绝无效的状态值', () => {
      expect(() => {
        new PermissionStatusValue('invalid' as PermissionStatus)
      }).toThrow('无效的权限状态: invalid')
    })

    it('应该处理空值', () => {
      expect(() => {
        new PermissionStatusValue('' as PermissionStatus)
      }).toThrow('无效的权限状态: ')
    })
  })
}) 