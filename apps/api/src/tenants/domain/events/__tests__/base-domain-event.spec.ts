/**
 * @file base-domain-event.spec.ts
 * @description 基础领域事件的单元测试文件
 */
import { BaseDomainEvent } from '../base-domain-event'

// 创建一个测试用的具体事件类
class TestDomainEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    tenantId: string,
    metadata: Record<string, any> = {},
  ) {
    super(aggregateId, tenantId, metadata)
  }
}

describe('BaseDomainEvent', () => {
  let event: TestDomainEvent

  beforeEach(() => {
    event = new TestDomainEvent('test-aggregate-123', 'test-tenant-123', {
      testKey: 'testValue',
    })
  })

  describe('构造函数', () => {
    it('应该正确初始化基础属性', () => {
      expect(event.eventId).toBeDefined()
      expect(event.eventType).toBe('TestDomainEvent')
      expect(event.aggregateId).toBe('test-aggregate-123')
      expect(event.tenantId).toBe('test-tenant-123')
      expect(event.occurredAt).toBeInstanceOf(Date)
      expect(event.version).toBe(1)
      expect(event.metadata).toEqual({ testKey: 'testValue' })
    })

    it('应该生成唯一的事件ID', () => {
      const event1 = new TestDomainEvent('agg1', 'tenant1')
      const event2 = new TestDomainEvent('agg2', 'tenant2')

      expect(event1.eventId).not.toBe(event2.eventId)
      expect(event1.eventId).toMatch(/^TestDomainEvent_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)
    })

    it('应该使用默认元数据', () => {
      const eventWithoutMetadata = new TestDomainEvent('agg1', 'tenant1')
      expect(eventWithoutMetadata.metadata).toEqual({})
    })
  })

  describe('getEventKey', () => {
    it('应该返回正确的事件键', () => {
      const eventKey = event.getEventKey()
      expect(eventKey).toBe(
        'test-tenant-123:TestDomainEvent:test-aggregate-123',
      )
    })
  })

  describe('toJSON', () => {
    it('应该返回正确的JSON对象', () => {
      const json = event.toJSON()
      expect(json).toEqual({
        eventId: event.eventId,
        eventType: 'TestDomainEvent',
        aggregateId: 'test-aggregate-123',
        tenantId: 'test-tenant-123',
        occurredAt: event.occurredAt,
        version: 1,
        metadata: { testKey: 'testValue' },
      })
    })
  })

  describe('toString', () => {
    it('应该返回正确的字符串表示', () => {
      expect(event.toString()).toBe('TestDomainEvent(test-aggregate-123)')
    })
  })

  describe('equals', () => {
    it('应该正确比较两个相等的事件', () => {
      // 由于eventId是只读的，我们通过创建相同的事件来测试相等性
      // 在实际使用中，相同的事件应该具有相同的eventId
      const event1 = new TestDomainEvent(
        'test-aggregate-123',
        'test-tenant-123',
      )
      const event2 = new TestDomainEvent(
        'test-aggregate-123',
        'test-tenant-123',
      )

      // 由于eventId是自动生成的，两个事件通常不相等
      // 这里我们测试equals方法的基本逻辑
      expect(event1.equals(event1)).toBe(true) // 自身比较
      expect(event1.equals(event2)).toBe(false) // 不同实例比较
    })

    it('应该正确比较两个不相等的事件', () => {
      const otherEvent = new TestDomainEvent('other-aggregate', 'other-tenant')
      expect(event.equals(otherEvent)).toBe(false)
    })

    it('应该正确处理null值', () => {
      expect(event.equals(null as any)).toBe(false)
    })

    it('应该正确处理undefined值', () => {
      expect(event.equals(undefined as any)).toBe(false)
    })

    it('应该正确处理自身比较', () => {
      expect(event.equals(event)).toBe(true)
    })

    it('应该基于eventId进行相等性比较', () => {
      // 创建一个模拟的事件对象，具有相同的eventId
      const mockEvent = {
        eventId: event.eventId,
      } as BaseDomainEvent

      expect(event.equals(mockEvent)).toBe(true)
    })
  })

  describe('元数据操作', () => {
    it('应该能够添加元数据', () => {
      event.addMetadata('newKey', 'newValue')
      expect(event.metadata.newKey).toBe('newValue')
    })

    it('应该能够获取元数据', () => {
      expect(event.getMetadata('testKey')).toBe('testValue')
    })

    it('应该能够检查元数据是否存在', () => {
      expect(event.hasMetadata('testKey')).toBe(true)
      expect(event.hasMetadata('nonexistentKey')).toBe(false)
    })

    it('应该支持链式调用', () => {
      const result = event
        .addMetadata('key1', 'value1')
        .addMetadata('key2', 'value2')
      expect(result).toBe(event)
      expect(event.metadata.key1).toBe('value1')
      expect(event.metadata.key2).toBe('value2')
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空字符串ID', () => {
      const emptyEvent = new TestDomainEvent('', '')
      expect(emptyEvent.aggregateId).toBe('')
      expect(emptyEvent.tenantId).toBe('')
    })

    it('应该处理特殊字符ID', () => {
      const specialEvent = new TestDomainEvent('test@#$%', 'tenant@#$%')
      expect(specialEvent.aggregateId).toBe('test@#$%')
      expect(specialEvent.tenantId).toBe('tenant@#$%')
    })
  })
})
