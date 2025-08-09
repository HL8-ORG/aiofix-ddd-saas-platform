/**
 * @file get-tenant-by-id.query.spec.ts
 * @description 根据ID查询租户的单元测试文件
 */
import { GetTenantByIdQuery, GetTenantByIdQueryDto } from '../get-tenant-by-id.query'

describe('GetTenantByIdQuery', () => {
  let validQueryData: any

  beforeEach(() => {
    validQueryData = {
      tenantId: 'tenant-123',
      requestedBy: 'user-456',
      requestId: 'req-789',
    }
  })

  describe('构造函数', () => {
    it('应该正确创建查询对象', () => {
      const query = new GetTenantByIdQuery(validQueryData)

      expect(query.queryId).toBeDefined()
      expect(query.queryId).toMatch(/^GetTenantById_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)
      expect(query.timestamp).toBeInstanceOf(Date)
      expect(query.data).toEqual(validQueryData)
    })

    it('应该生成唯一的查询ID', () => {
      const query1 = new GetTenantByIdQuery(validQueryData)
      const query2 = new GetTenantByIdQuery(validQueryData)

      expect(query1.queryId).not.toBe(query2.queryId)
    })
  })

  describe('validate方法', () => {
    it('应该验证有效的查询数据', () => {
      const query = new GetTenantByIdQuery(validQueryData)
      expect(() => query.validate()).not.toThrow()
    })

    it('应该拒绝空的租户ID', () => {
      const invalidData = { ...validQueryData, tenantId: '' }
      const query = new GetTenantByIdQuery(invalidData)

      expect(() => query.validate()).toThrow('租户ID不能为空')
    })

    it('应该拒绝空的请求者ID', () => {
      const invalidData = { ...validQueryData, requestedBy: '' }
      const query = new GetTenantByIdQuery(invalidData)

      expect(() => query.validate()).toThrow('请求者ID不能为空')
    })

    it('应该拒绝无效的租户ID格式', () => {
      const invalidData = { ...validQueryData, tenantId: 'invalid-id!' }
      const query = new GetTenantByIdQuery(invalidData)

      expect(() => query.validate()).toThrow('租户ID格式不正确')
    })
  })

  describe('toJSON方法', () => {
    it('应该返回正确的JSON对象', () => {
      const query = new GetTenantByIdQuery(validQueryData)
      const json = query.toJSON()

      expect(json).toEqual({
        queryId: query.queryId,
        timestamp: query.timestamp,
        data: validQueryData,
      })
    })
  })

  describe('toString方法', () => {
    it('应该返回正确的字符串表示', () => {
      const query = new GetTenantByIdQuery(validQueryData)
      expect(query.toString()).toBe('GetTenantByIdQuery(tenant-123)')
    })
  })
})

describe('GetTenantByIdQueryDto', () => {
  let validDtoData: any

  beforeEach(() => {
    validDtoData = {
      tenantId: 'tenant-123',
      includeAdminUser: true,
      includeSettings: false,
      includeStatistics: true,
    }
  })

  describe('数据验证', () => {
    it('应该接受有效的DTO数据', () => {
      const dto = new GetTenantByIdQueryDto()
      Object.assign(dto, validDtoData)

      expect(dto.tenantId).toBe('tenant-123')
      expect(dto.includeAdminUser).toBe(true)
      expect(dto.includeSettings).toBe(false)
      expect(dto.includeStatistics).toBe(true)
    })
  })
})
