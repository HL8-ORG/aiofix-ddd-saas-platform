import { generateUuid } from '../../../../../../shared/domain/utils/uuid.util'
import { Tenant } from '../../entities/tenant.entity'
import {
  TenantActivatedEvent,
  TenantCreatedEvent,
  TenantDeletedEvent,
  TenantDomainEvent,
  TenantSettingsUpdatedEvent,
  TenantSuspendedEvent,
} from '../tenant.events'

describe('租户领域事件', () => {
  let tenant: Tenant

  beforeEach(() => {
    tenant = new Tenant(
      generateUuid(),
      '测试租户',
      'test-tenant',
      generateUuid(),
      '这是一个测试租户',
      { theme: 'dark', language: 'zh-CN' },
    )
  })

  describe('TenantDomainEvent基类', () => {
    it('应该创建基础领域事件', () => {
      const event = new TenantCreatedEvent(tenant)

      expect(event.eventId).toBeDefined()
      expect(event.occurredOn).toBeInstanceOf(Date)
      expect(event.tenantId).toBe(tenant.id)
      expect(event.eventType).toBe('TenantCreatedEvent')
    })

    it('应该生成唯一的事件ID', () => {
      const event1 = new TenantCreatedEvent(tenant)
      const event2 = new TenantCreatedEvent(tenant)

      expect(event1.eventId).not.toBe(event2.eventId)
    })

    it('应该正确序列化为JSON', () => {
      const event = new TenantCreatedEvent(tenant)
      const json = event.toJSON() as any

      expect(json).toHaveProperty('eventId')
      expect(json).toHaveProperty('occurredOn')
      expect(json).toHaveProperty('tenantId')
      expect(json).toHaveProperty('eventType')
      expect(json.eventType).toBe('TenantCreatedEvent')
    })
  })

  describe('TenantCreatedEvent', () => {
    it('应该创建租户创建事件', () => {
      const event = new TenantCreatedEvent(tenant)

      expect(event.tenantData).toBeDefined()
      expect(event.tenantData.name).toBe('测试租户')
      expect(event.tenantData.code).toBe('test-tenant')
      expect(event.tenantData.adminUserId).toBeDefined()
      expect(event.tenantData.description).toBe('这是一个测试租户')
      expect(event.tenantData.settings).toEqual({
        theme: 'dark',
        language: 'zh-CN',
      })
    })
  })

  describe('TenantActivatedEvent', () => {
    it('应该创建租户激活事件', () => {
      const activatedBy = generateUuid()
      const reason = '管理员审核通过'
      const event = new TenantActivatedEvent(tenant, activatedBy, reason)

      expect(event.activatedBy).toBe(activatedBy)
      expect(event.reason).toBe(reason)
    })

    it('应该支持可选的激活信息', () => {
      const event = new TenantActivatedEvent(tenant)

      expect(event.activatedBy).toBeUndefined()
      expect(event.reason).toBeUndefined()
    })
  })

  describe('TenantSuspendedEvent', () => {
    it('应该创建租户暂停事件', () => {
      const suspendedBy = generateUuid()
      const reason = '违反使用条款'
      const event = new TenantSuspendedEvent(tenant, suspendedBy, reason)

      expect(event.suspendedBy).toBe(suspendedBy)
      expect(event.reason).toBe(reason)
    })
  })

  describe('TenantDeletedEvent', () => {
    it('应该创建租户删除事件', () => {
      const deletedBy = generateUuid()
      const reason = '用户主动删除'
      const event = new TenantDeletedEvent(tenant, deletedBy, reason)

      expect(event.deletedBy).toBe(deletedBy)
      expect(event.reason).toBe(reason)
    })
  })

  describe('TenantSettingsUpdatedEvent', () => {
    it('应该创建租户配置更新事件', () => {
      const oldSettings = { theme: 'light', language: 'en-US' }
      const newSettings = {
        theme: 'dark',
        language: 'zh-CN',
        notifications: true,
      }
      const updatedBy = generateUuid()
      const event = new TenantSettingsUpdatedEvent(
        tenant,
        oldSettings,
        newSettings,
        updatedBy,
      )

      expect(event.oldSettings).toEqual(oldSettings)
      expect(event.newSettings).toEqual(newSettings)
      expect(event.updatedBy).toBe(updatedBy)
    })
  })

  describe('事件继承关系', () => {
    it('所有事件都应该继承TenantDomainEvent', () => {
      const events = [
        new TenantCreatedEvent(tenant),
        new TenantActivatedEvent(tenant),
        new TenantSuspendedEvent(tenant),
        new TenantDeletedEvent(tenant),
        new TenantSettingsUpdatedEvent(tenant, {}, {}),
      ]

      events.forEach((event) => {
        expect(event).toBeInstanceOf(TenantDomainEvent)
      })
    })
  })
})
