import { TenantStatus } from '../../entities/tenant.entity'
import { TenantCode } from '../../value-objects/tenant-code.vo'
import { TenantName } from '../../value-objects/tenant-name.vo'
/**
 * @file tenant-created.event.spec.ts
 * @description 租户创建事件的单元测试文件
 */
import { TenantCreatedEvent } from '../tenant-created.event'

describe('TenantCreatedEvent', () => {
  let event: TenantCreatedEvent
  let tenantName: TenantName
  let tenantCode: TenantCode

  beforeEach(() => {
    tenantName = new TenantName('测试租户')
    tenantCode = new TenantCode('test_tenant')
    event = new TenantCreatedEvent(
      '123e4567-e89b-12d3-a456-426614174000',
      tenantName,
      tenantCode,
      '123e4567-e89b-12d3-a456-426614174001',
      '测试租户描述',
      { theme: 'dark', language: 'zh-CN' },
      '123e4567-e89b-12d3-a456-426614174002',
      { source: 'web', ip: '192.168.1.1' },
    )
  })

  describe('构造函数', () => {
    it('应该正确初始化事件属性', () => {
      expect(event.eventId).toBeDefined()
      expect(event.eventType).toBe('TenantCreatedEvent')
      expect(event.aggregateId).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(event.tenantId).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(event.occurredAt).toBeInstanceOf(Date)
      expect(event.version).toBe(1)
    })

    it('应该正确初始化事件数据', () => {
      expect(event.data.tenantName).toBe('测试租户')
      expect(event.data.tenantCode).toBe('test_tenant')
      expect(event.data.description).toBe('测试租户描述')
      expect(event.data.adminUserId).toBe('123e4567-e89b-12d3-a456-426614174001')
      expect(event.data.status).toBe(TenantStatus.PENDING)
      expect(event.data.settings).toEqual({ theme: 'dark', language: 'zh-CN' })
      expect(event.data.createdBy).toBe('123e4567-e89b-12d3-a456-426614174002')
    })

    it('应该添加默认元数据', () => {
      expect(event.getMetadata('eventCategory')).toBe('TENANT_LIFECYCLE')
      expect(event.getMetadata('eventPriority')).toBe('HIGH')
      expect(event.getMetadata('requiresNotification')).toBe(true)
    })

    it('应该保留自定义元数据', () => {
      expect(event.getMetadata('source')).toBe('web')
      expect(event.getMetadata('ip')).toBe('192.168.1.1')
    })
  })

  describe('数据访问方法', () => {
    it('应该正确获取租户名称', () => {
      expect(event.getTenantName()).toBe('测试租户')
    })

    it('应该正确获取租户编码', () => {
      expect(event.getTenantCode()).toBe('test_tenant')
    })

    it('应该正确获取管理员用户ID', () => {
      expect(event.getAdminUserId()).toBe('123e4567-e89b-12d3-a456-426614174001')
    })

    it('应该正确获取租户描述', () => {
      expect(event.getDescription()).toBe('测试租户描述')
    })

    it('应该正确获取租户配置', () => {
      expect(event.getSettings()).toEqual({ theme: 'dark', language: 'zh-CN' })
    })

    it('应该正确获取租户状态', () => {
      expect(event.getStatus()).toBe(TenantStatus.PENDING)
    })

    it('应该正确获取创建者ID', () => {
      expect(event.getCreatedBy()).toBe('123e4567-e89b-12d3-a456-426614174002')
    })
  })

  describe('toJSON', () => {
    it('应该返回正确的JSON对象', () => {
      const json = event.toJSON()
      expect(json).toEqual({
        eventId: event.eventId,
        eventType: 'TenantCreatedEvent',
        aggregateId: '123e4567-e89b-12d3-a456-426614174000',
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        occurredAt: event.occurredAt,
        version: 1,
        metadata: expect.any(Object),
        data: {
          tenantName: '测试租户',
          tenantCode: 'test_tenant',
          description: '测试租户描述',
          adminUserId: '123e4567-e89b-12d3-a456-426614174001',
          status: TenantStatus.PENDING,
          settings: { theme: 'dark', language: 'zh-CN' },
          createdBy: '123e4567-e89b-12d3-a456-426614174002',
        },
      })
    })
  })

  describe('toString', () => {
    it('应该返回正确的字符串表示', () => {
      expect(event.toString()).toBe('TenantCreatedEvent(123e4567-e89b-12d3-a456-426614174000, 测试租户)')
    })
  })

  describe('边界条件测试', () => {
    it('应该处理可选的描述参数', () => {
      const eventWithoutDescription = new TenantCreatedEvent(
        '123e4567-e89b-12d3-a456-426614174003',
        tenantName,
        tenantCode,
        '123e4567-e89b-12d3-a456-426614174004',
      )
      expect(eventWithoutDescription.getDescription()).toBeUndefined()
    })

    it('应该处理空的配置', () => {
      const eventWithoutSettings = new TenantCreatedEvent(
        '123e4567-e89b-12d3-a456-426614174005',
        tenantName,
        tenantCode,
        '123e4567-e89b-12d3-a456-426614174006',
      )
      expect(eventWithoutSettings.getSettings()).toEqual({})
    })

    it('应该处理空的创建者', () => {
      const eventWithoutCreator = new TenantCreatedEvent(
        '123e4567-e89b-12d3-a456-426614174007',
        tenantName,
        tenantCode,
        '123e4567-e89b-12d3-a456-426614174008',
      )
      expect(eventWithoutCreator.getCreatedBy()).toBeUndefined()
    })
  })

  describe('事件键生成', () => {
    it('应该生成正确的事件键', () => {
      const eventKey = event.getEventKey()
      expect(eventKey).toBe('123e4567-e89b-12d3-a456-426614174000:TenantCreatedEvent:123e4567-e89b-12d3-a456-426614174000')
    })
  })

  describe('事件比较', () => {
    it('应该正确比较两个相等的事件', () => {
      // 由于eventId是只读的，我们通过创建相同的事件来测试相等性
      // 在实际使用中，相同的事件应该具有相同的eventId
      const event1 = new TenantCreatedEvent(
        '123e4567-e89b-12d3-a456-426614174000',
        tenantName,
        tenantCode,
        '123e4567-e89b-12d3-a456-426614174001',
      )
      const event2 = new TenantCreatedEvent(
        '123e4567-e89b-12d3-a456-426614174000',
        tenantName,
        tenantCode,
        '123e4567-e89b-12d3-a456-426614174001',
      )

      // 由于eventId是自动生成的，两个事件通常不相等
      // 这里我们测试equals方法的基本逻辑
      expect(event1.equals(event1)).toBe(true) // 自身比较
      expect(event1.equals(event2)).toBe(false) // 不同实例比较
    })

    it('应该正确比较两个不相等的事件', () => {
      const otherEvent = new TenantCreatedEvent(
        '123e4567-e89b-12d3-a456-426614174003',
        tenantName,
        tenantCode,
        '123e4567-e89b-12d3-a456-426614174004',
      )
      expect(event.equals(otherEvent)).toBe(false)
    })

    it('应该基于eventId进行相等性比较', () => {
      // 创建一个模拟的事件对象，具有相同的eventId
      const mockEvent = {
        eventId: event.eventId,
      } as TenantCreatedEvent

      expect(event.equals(mockEvent)).toBe(true)
    })
  })
})
