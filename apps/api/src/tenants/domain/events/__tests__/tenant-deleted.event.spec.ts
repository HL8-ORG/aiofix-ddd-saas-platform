/**
 * @file tenant-deleted.event.spec.ts
 * @description 租户删除事件的单元测试文件
 */
import { TenantDeletedEvent } from '../tenant-deleted.event'

describe('TenantDeletedEvent', () => {
  let event: TenantDeletedEvent

  beforeEach(() => {
    event = new TenantDeletedEvent(
      '123e4567-e89b-12d3-a456-426614174000',
      '测试租户',
      'test_tenant',
      '123e4567-e89b-12d3-a456-426614174001',
      '业务调整',
      'ACTIVE',
      true,
      30,
      { source: 'web', ip: '192.168.1.1' },
    )
  })

  describe('构造函数', () => {
    it('应该正确初始化事件属性', () => {
      expect(event.eventId).toBeDefined()
      expect(event.eventType).toBe('TenantDeletedEvent')
      expect(event.aggregateId).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(event.tenantId).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(event.occurredAt).toBeInstanceOf(Date)
      expect(event.version).toBe(1)
    })

    it('应该正确初始化事件数据', () => {
      expect(event.data.tenantId).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(event.data.tenantName).toBe('测试租户')
      expect(event.data.tenantCode).toBe('test_tenant')
      expect(event.data.deletedBy).toBe('123e4567-e89b-12d3-a456-426614174001')
      expect(event.data.reason).toBe('业务调整')
      expect(event.data.previousStatus).toBe('ACTIVE')
      expect(event.data.softDelete).toBe(true)
      expect(event.data.dataRetentionDays).toBe(30)
    })

    it('应该添加默认元数据', () => {
      expect(event.getMetadata('eventCategory')).toBe('TENANT_LIFECYCLE')
      expect(event.getMetadata('eventPriority')).toBe('HIGH')
      expect(event.getMetadata('requiresNotification')).toBe(true)
      expect(event.getMetadata('requiresAudit')).toBe(true)
    })

    it('应该保留自定义元数据', () => {
      expect(event.getMetadata('source')).toBe('web')
      expect(event.getMetadata('ip')).toBe('192.168.1.1')
    })
  })

  describe('数据访问方法', () => {
    it('应该正确获取租户ID', () => {
      expect(event.getTenantId()).toBe('123e4567-e89b-12d3-a456-426614174000')
    })

    it('应该正确获取租户名称', () => {
      expect(event.getTenantName()).toBe('测试租户')
    })

    it('应该正确获取租户编码', () => {
      expect(event.getTenantCode()).toBe('test_tenant')
    })

    it('应该正确获取删除操作者ID', () => {
      expect(event.getDeletedBy()).toBe('123e4567-e89b-12d3-a456-426614174001')
    })

    it('应该正确获取删除原因', () => {
      expect(event.getReason()).toBe('业务调整')
    })

    it('应该正确获取删除时间', () => {
      expect(event.getDeletedAt()).toBeInstanceOf(Date)
    })

    it('应该正确获取删除前的状态', () => {
      expect(event.getPreviousStatus()).toBe('ACTIVE')
    })

    it('应该正确判断是否为软删除', () => {
      expect(event.isSoftDelete()).toBe(true)
    })

    it('应该正确获取数据保留天数', () => {
      expect(event.getDataRetentionDays()).toBe(30)
    })
  })

  describe('toJSON', () => {
    it('应该返回正确的JSON对象', () => {
      const json = event.toJSON()
      expect(json).toEqual({
        eventId: event.eventId,
        eventType: 'TenantDeletedEvent',
        aggregateId: '123e4567-e89b-12d3-a456-426614174000',
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        occurredAt: event.occurredAt,
        version: 1,
        metadata: expect.any(Object),
        data: {
          tenantId: '123e4567-e89b-12d3-a456-426614174000',
          tenantName: '测试租户',
          tenantCode: 'test_tenant',
          deletedBy: '123e4567-e89b-12d3-a456-426614174001',
          reason: '业务调整',
          deletedAt: event.data.deletedAt,
          previousStatus: 'ACTIVE',
          softDelete: true,
          dataRetentionDays: 30,
        },
      })
    })
  })

  describe('toString', () => {
    it('应该返回正确的字符串表示', () => {
      expect(event.toString()).toBe('TenantDeletedEvent(123e4567-e89b-12d3-a456-426614174000, 测试租户)')
    })
  })

  describe('边界条件测试', () => {
    it('应该处理可选的删除原因', () => {
      const eventWithoutReason = new TenantDeletedEvent(
        '123e4567-e89b-12d3-a456-426614174003',
        '测试租户2',
        'test_tenant2',
        '123e4567-e89b-12d3-a456-426614174004',
        undefined,
        'SUSPENDED',
        true,
      )
      expect(eventWithoutReason.getReason()).toBeUndefined()
    })

    it('应该处理硬删除', () => {
      const hardDeleteEvent = new TenantDeletedEvent(
        '123e4567-e89b-12d3-a456-426614174005',
        '测试租户3',
        'test_tenant3',
        '123e4567-e89b-12d3-a456-426614174006',
        '违规操作',
        'ACTIVE',
        false,
      )
      expect(hardDeleteEvent.isSoftDelete()).toBe(false)
    })

    it('应该处理可选的数据保留天数', () => {
      const eventWithoutRetention = new TenantDeletedEvent(
        '123e4567-e89b-12d3-a456-426614174007',
        '测试租户4',
        'test_tenant4',
        '123e4567-e89b-12d3-a456-426614174008',
        '测试删除',
        'ACTIVE',
        true,
      )
      expect(eventWithoutRetention.getDataRetentionDays()).toBeUndefined()
    })
  })

  describe('事件键生成', () => {
    it('应该生成正确的事件键', () => {
      const eventKey = event.getEventKey()
      expect(eventKey).toBe('123e4567-e89b-12d3-a456-426614174000:TenantDeletedEvent:123e4567-e89b-12d3-a456-426614174000')
    })
  })

  describe('事件比较', () => {
    it('应该正确比较两个相等的事件', () => {
      // 由于eventId是只读的，我们需要创建一个具有相同数据的事件
      // 然后通过其他方式验证相等性
      const otherEvent = new TenantDeletedEvent(
        '123e4567-e89b-12d3-a456-426614174000',
        '测试租户',
        'test_tenant',
        '123e4567-e89b-12d3-a456-426614174001',
        '业务调整',
        'ACTIVE',
        true,
        30,
      )

      // 验证事件数据相等性
      expect(otherEvent.getTenantId()).toBe(event.getTenantId())
      expect(otherEvent.getTenantName()).toBe(event.getTenantName())
      expect(otherEvent.getTenantCode()).toBe(event.getTenantCode())
      expect(otherEvent.getDeletedBy()).toBe(event.getDeletedBy())
      expect(otherEvent.getReason()).toBe(event.getReason())
      expect(otherEvent.getPreviousStatus()).toBe(event.getPreviousStatus())
      expect(otherEvent.isSoftDelete()).toBe(event.isSoftDelete())
      expect(otherEvent.getDataRetentionDays()).toBe(
        event.getDataRetentionDays(),
      )

      // 验证事件类型相等性
      expect(otherEvent.eventType).toBe(event.eventType)
      expect(otherEvent.aggregateId).toBe(event.aggregateId)
      expect(otherEvent.tenantId).toBe(event.tenantId)
      expect(otherEvent.version).toBe(event.version)
    })

    it('应该正确比较两个不相等的事件', () => {
      const otherEvent = new TenantDeletedEvent(
        'tenant-456',
        '测试租户2',
        'test_tenant2',
        'admin-456',
        '其他原因',
        'SUSPENDED',
        true,
        30,
      )

      // 验证事件数据不相等性
      expect(otherEvent.getTenantId()).not.toBe(event.getTenantId())
      expect(otherEvent.getTenantName()).not.toBe(event.getTenantName())
      expect(otherEvent.getTenantCode()).not.toBe(event.getTenantCode())
      expect(otherEvent.getDeletedBy()).not.toBe(event.getDeletedBy())
      expect(otherEvent.getReason()).not.toBe(event.getReason())
      expect(otherEvent.getPreviousStatus()).not.toBe(event.getPreviousStatus())

      // 验证事件类型相等性（相同类型的事件）
      expect(otherEvent.eventType).toBe(event.eventType)
      expect(otherEvent.version).toBe(event.version)
    })
  })
})
