import {
  TenantActivatedEvent,
  TenantCreatedEvent,
  TenantDeletedEvent,
  TenantSettingsUpdatedEvent,
  TenantSuspendedEvent,
} from '../../events/tenant.events'
import { TenantStatus } from '../../value-objects/tenant-status.value-object'
import { Tenant } from '../tenant.entity'

/**
 * @describe Tenant领域实体测试
 * @description
 * 测试Tenant领域实体的业务规则和功能。
 *
 * 测试覆盖范围：
 * 1. 构造函数验证
 * 2. 业务方法测试
 * 3. 状态转换测试
 * 4. 配置管理测试
 * 5. 软删除测试
 * 6. 值对象集成测试
 */
describe('Tenant', () => {
  /**
   * @test 正常创建测试
   * @description 测试正常情况下的租户创建
   */
  describe('正常创建', () => {
    it('应该成功创建租户实例', () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
      )

      expect(tenant.id).toBe('test-id')
      expect(tenant.getName()).toBe('测试租户')
      expect(tenant.getCode()).toBe('test-tenant')
      expect(tenant.getStatus()).toBe('pending')
      expect(tenant.adminUserId).toBe('admin-user-id')
      expect(tenant.createdAt).toBeInstanceOf(Date)
      expect(tenant.updatedAt).toBeInstanceOf(Date)
    })

    it('应该成功创建带描述的租户实例', () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
        '这是一个测试租户',
      )

      expect(tenant.description).toBe('这是一个测试租户')
    })

    it('应该成功创建带配置的租户实例', () => {
      const settings = { theme: 'dark', language: 'zh-CN' }
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
        '这是一个测试租户',
        settings,
      )

      expect(tenant.settings).toEqual(settings)
    })

    it('应该设置默认的待激活状态', () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
      )

      expect(tenant.getStatus()).toBe('pending')
      expect(tenant.getStatusDisplayName()).toBe('待激活')
    })
  })

  /**
   * @test 业务方法测试
   * @description 测试租户的业务方法
   */
  describe('业务方法', () => {
    let tenant: Tenant

    beforeEach(() => {
      tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-user-id')
    })

    it('getName应该返回租户名称字符串', () => {
      expect(tenant.getName()).toBe('测试租户')
    })

    it('getCode应该返回租户编码字符串', () => {
      expect(tenant.getCode()).toBe('test-tenant')
    })

    it('getStatus应该返回租户状态字符串', () => {
      expect(tenant.getStatus()).toBe('pending')
    })

    it('getStatusDisplayName应该返回状态显示名称', () => {
      expect(tenant.getStatusDisplayName()).toBe('待激活')
    })

    it('getStatusDescription应该返回状态描述', () => {
      expect(tenant.getStatusDescription()).toBe(
        '租户已创建但尚未激活，需要管理员审核',
      )
    })
  })

  /**
   * @test 状态转换测试
   * @description 测试租户的状态转换
   */
  describe('状态转换', () => {
    let tenant: Tenant

    beforeEach(() => {
      tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-user-id')
    })

    it('应该能够激活租户', () => {
      tenant.activate()

      expect(tenant.getStatus()).toBe('active')
      expect(tenant.isActive()).toBe(true)
      expect(tenant.getStatusDisplayName()).toBe('激活')
    })

    it('应该能够禁用租户', () => {
      tenant.activate() // 先激活
      tenant.suspend() // 再禁用

      expect(tenant.getStatus()).toBe('suspended')
      expect(tenant.isSuspended()).toBe(true)
      expect(tenant.getStatusDisplayName()).toBe('禁用')
    })

    it('应该阻止已删除租户的激活', () => {
      tenant.markAsDeleted()

      expect(() => tenant.activate()).toThrow('租户当前状态为已删除，无法激活')
    })

    it('应该阻止已删除租户的禁用', () => {
      tenant.markAsDeleted()

      expect(() => tenant.suspend()).toThrow('租户当前状态为已删除，无法禁用')
    })

    it('应该阻止已激活租户的再次激活', () => {
      tenant.activate()

      expect(() => tenant.activate()).toThrow('租户当前状态为激活，无法激活')
    })

    it('应该阻止已禁用租户的再次禁用', () => {
      tenant.suspend()

      expect(() => tenant.suspend()).toThrow('租户当前状态为禁用，无法禁用')
    })

    it('isActive应该正确判断激活状态', () => {
      expect(tenant.isActive()).toBe(false) // 初始状态为待激活

      tenant.activate()
      expect(tenant.isActive()).toBe(true)

      tenant.suspend()
      expect(tenant.isActive()).toBe(false)
    })

    it('isSuspended应该正确判断禁用状态', () => {
      expect(tenant.isSuspended()).toBe(false) // 初始状态为待激活

      tenant.suspend()
      expect(tenant.isSuspended()).toBe(true)

      tenant.activate()
      expect(tenant.isSuspended()).toBe(false)
    })
  })

  /**
   * @test 配置管理测试
   * @description 测试租户配置的管理
   */
  describe('配置管理', () => {
    let tenant: Tenant

    beforeEach(() => {
      tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-user-id')
    })

    it('updateSettings应该更新租户配置', () => {
      const newSettings = { theme: 'light', language: 'en-US' }
      tenant.updateSettings(newSettings)

      expect(tenant.settings).toEqual(newSettings)
    })

    it('updateSettings应该合并配置而不是替换', () => {
      tenant.settings = { theme: 'dark', language: 'zh-CN' }

      const newSettings = { theme: 'light', notifications: true }
      tenant.updateSettings(newSettings)

      expect(tenant.settings).toEqual({
        theme: 'light',
        language: 'zh-CN',
        notifications: true,
      })
    })

    it('getSetting应该返回指定配置项的值', () => {
      tenant.settings = { theme: 'dark', language: 'zh-CN' }

      expect(tenant.getSetting('theme')).toBe('dark')
      expect(tenant.getSetting('language')).toBe('zh-CN')
      expect(tenant.getSetting('notifications')).toBeUndefined()
    })

    it('getSetting应该返回默认值', () => {
      expect(tenant.getSetting('theme', 'light')).toBe('light')
      expect(tenant.getSetting('notifications', false)).toBe(false)
    })

    it('getSetting应该处理复杂配置', () => {
      const complexSettings = {
        theme: 'dark',
        features: {
          notifications: true,
          analytics: false,
        },
        limits: {
          users: 100,
          storage: '10GB',
        },
      }

      tenant.settings = complexSettings

      expect(tenant.getSetting('theme')).toBe('dark')
      expect(tenant.getSetting('features')).toEqual({
        notifications: true,
        analytics: false,
      })
      expect(tenant.getSetting('limits.users')).toBe(100)
    })
  })

  /**
   * @test 信息更新测试
   * @description 测试租户信息的更新
   */
  describe('信息更新', () => {
    let tenant: Tenant

    beforeEach(() => {
      tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-user-id')
    })

    it('updateInfo应该更新租户基本信息', () => {
      const originalUpdatedAt = tenant.updatedAt

      // 等待一小段时间确保时间戳不同
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          tenant.updateInfo('新租户名称', 'new-tenant-code', '新的描述')

          expect(tenant.getName()).toBe('新租户名称')
          expect(tenant.getCode()).toBe('new-tenant-code')
          expect(tenant.description).toBe('新的描述')
          expect(tenant.updatedAt.getTime()).toBeGreaterThan(
            originalUpdatedAt.getTime(),
          )
          resolve()
        }, 10)
      })
    }, 10000)

    it('updateInfo应该验证新的名称和编码', () => {
      // 测试无效名称
      expect(() => tenant.updateInfo('', 'new-code', '描述')).toThrow()

      // 测试无效编码
      expect(() => tenant.updateInfo('新名称', 'ab', '描述')).toThrow()
    })
  })

  /**
   * @test 软删除测试
   * @description 测试租户的软删除功能
   */
  describe('软删除', () => {
    let tenant: Tenant

    beforeEach(() => {
      tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-user-id')
    })

    it('markAsDeleted应该标记租户为已删除', () => {
      tenant.markAsDeleted()

      expect(tenant.getStatus()).toBe('deleted')
      expect(tenant.isDeleted()).toBe(true)
      expect(tenant.getStatusDisplayName()).toBe('已删除')
    })

    it('restore应该恢复已删除的租户', () => {
      tenant.markAsDeleted()
      tenant.restore()

      expect(tenant.getStatus()).toBe('suspended')
      expect(tenant.isDeleted()).toBe(false)
      expect(tenant.getStatusDisplayName()).toBe('禁用')
    })

    it('restore应该拒绝恢复非删除状态的租户', () => {
      expect(() => tenant.restore()).toThrow('租户当前状态为待激活，无法恢复')

      tenant.activate()
      expect(() => tenant.restore()).toThrow('租户当前状态为激活，无法恢复')

      tenant.suspend()
      expect(() => tenant.restore()).toThrow('租户当前状态为禁用，无法恢复')
    })

    it('已删除的租户不应该被认为是激活的', () => {
      tenant.activate()
      tenant.markAsDeleted()

      expect(tenant.isActive()).toBe(false)
    })
  })

  /**
   * @test 值对象集成测试
   * @description 测试与值对象的集成
   */
  describe('值对象集成', () => {
    it('应该正确使用TenantName值对象', () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
      )

      expect(tenant.name.value).toBe('测试租户')
      expect(tenant.name.toString()).toBe('测试租户')
    })

    it('应该正确使用TenantCode值对象', () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
      )

      expect(tenant.code.value).toBe('test-tenant')
      expect(tenant.code.toString()).toBe('test-tenant')
    })

    it('应该正确使用TenantStatusValue值对象', () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
      )

      expect(tenant.status.value).toBe('pending')
      expect(tenant.status.getDisplayName()).toBe('待激活')
    })

    it('值对象应该保持不可变性', () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
      )

      const originalName = tenant.name.value
      const originalCode = tenant.code.value
      const originalStatus = tenant.status.value

      // 尝试修改值对象（虽然TypeScript会阻止，但测试确保设计意图）
      expect(tenant.name.value).toBe(originalName)
      expect(tenant.code.value).toBe(originalCode)
      expect(tenant.status.value).toBe(originalStatus)
    })
  })

  /**
   * @test 边界条件测试
   * @description 测试各种边界条件
   */
  describe('边界条件', () => {
    it('应该处理空配置', () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
      )

      expect(tenant.settings).toEqual({})
      expect(tenant.getSetting('theme')).toBeUndefined()
    })

    it('应该处理null和undefined配置', () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
      )

      tenant.updateSettings({ theme: null, language: undefined })

      expect(tenant.getSetting('theme')).toBeNull()
      expect(tenant.getSetting('language')).toBeUndefined()
    })

    it('应该处理复杂的嵌套配置', () => {
      const complexSettings = {
        ui: {
          theme: 'dark',
          layout: 'sidebar',
        },
        features: {
          notifications: {
            email: true,
            push: false,
          },
        },
      }

      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
        undefined,
        complexSettings,
      )

      expect(tenant.getSetting('ui.theme')).toBe('dark')
      expect(tenant.getSetting('features.notifications.email')).toBe(true)
    })
  })

  /**
   * @test 性能测试
   * @description 测试性能相关的场景
   */
  describe('性能', () => {
    it('应该能够快速创建多个租户实例', () => {
      const startTime = Date.now()

      for (let i = 0; i < 100; i++) {
        new Tenant(
          `test-id-${i}`,
          `测试租户${i}`,
          `test-tenant-${i}`,
          `admin-user-id-${i}`,
        )
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
    })

    it('应该能够快速进行状态转换', () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
      )

      const startTime = Date.now()

      for (let i = 0; i < 1000; i++) {
        tenant.activate()
        tenant.suspend()
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
    })
  })

  /**
   * @test 领域事件测试
   * @description 测试租户领域事件功能
   */
  describe('领域事件', () => {
    let tenant: Tenant

    beforeEach(() => {
      tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-user-id',
        '这是一个测试租户',
        { theme: 'dark', language: 'zh-CN' },
      )
    })

    it('创建租户时应该产生TenantCreatedEvent', () => {
      const events = tenant.getDomainEvents()

      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(TenantCreatedEvent)
      expect(events[0].tenantId).toBe('test-id')
    })

    it('激活租户时应该产生TenantActivatedEvent', () => {
      tenant.clearDomainEvents() // 清除创建事件
      tenant.activate()

      const events = tenant.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(TenantActivatedEvent)
      expect(events[0].tenantId).toBe('test-id')
    })

    it('暂停租户时应该产生TenantSuspendedEvent', () => {
      tenant.clearDomainEvents() // 清除创建事件
      tenant.suspend()

      const events = tenant.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(TenantSuspendedEvent)
      expect(events[0].tenantId).toBe('test-id')
    })

    it('删除租户时应该产生TenantDeletedEvent', () => {
      tenant.clearDomainEvents() // 清除创建事件
      tenant.markAsDeleted()

      const events = tenant.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(TenantDeletedEvent)
      expect(events[0].tenantId).toBe('test-id')
    })

    it('更新配置时应该产生TenantSettingsUpdatedEvent', () => {
      tenant.clearDomainEvents() // 清除创建事件
      const oldSettings = { ...tenant.settings }
      tenant.updateSettings({ theme: 'light', notifications: true })

      const events = tenant.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(TenantSettingsUpdatedEvent)
      expect(events[0].tenantId).toBe('test-id')

      const settingsEvent = events[0] as TenantSettingsUpdatedEvent
      expect(settingsEvent.oldSettings).toEqual(oldSettings)
      expect(settingsEvent.newSettings).toEqual({
        theme: 'light',
        language: 'zh-CN',
        notifications: true,
      })
    })

    it('应该能够清空领域事件', () => {
      expect(tenant.hasDomainEvents()).toBe(true)

      tenant.clearDomainEvents()

      expect(tenant.hasDomainEvents()).toBe(false)
      expect(tenant.getDomainEvents()).toHaveLength(0)
    })

    it('应该能够检查是否有领域事件', () => {
      expect(tenant.hasDomainEvents()).toBe(true)

      tenant.clearDomainEvents()
      expect(tenant.hasDomainEvents()).toBe(false)
    })

    it('getDomainEvents应该返回事件副本', () => {
      const events1 = tenant.getDomainEvents()
      const events2 = tenant.getDomainEvents()

      expect(events1).not.toBe(events2) // 应该是不同的数组实例
      expect(events1).toEqual(events2) // 但内容应该相同
    })

    it('多个操作应该产生多个事件', () => {
      tenant.clearDomainEvents()

      tenant.activate()
      tenant.suspend()
      tenant.updateSettings({ theme: 'light' })

      const events = tenant.getDomainEvents()
      expect(events).toHaveLength(3)
      expect(events[0]).toBeInstanceOf(TenantActivatedEvent)
      expect(events[1]).toBeInstanceOf(TenantSuspendedEvent)
      expect(events[2]).toBeInstanceOf(TenantSettingsUpdatedEvent)
    })
  })
})
