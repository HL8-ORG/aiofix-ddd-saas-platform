import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { DeleteTenantUseCase } from '../use-cases/delete-tenant.use-case'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantRepository } from '../../domain/repositories/tenant.repository'

describe('DeleteTenantUseCase', () => {
  let useCase: DeleteTenantUseCase
  let mockTenantRepository: jest.Mocked<TenantRepository>

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTenantUseCase,
        {
          provide: 'TenantRepository',
          useValue: mockRepository,
        },
      ],
    }).compile()

    useCase = module.get<DeleteTenantUseCase>(DeleteTenantUseCase)
    mockTenantRepository = module.get('TenantRepository') as jest.Mocked<TenantRepository>
  })

  describe('execute', () => {
    it('应该成功软删除租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.save.mockResolvedValue(tenant)

      const result = await useCase.execute('test-id')

      expect(result).toBe(true)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant)
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(useCase.execute('test-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeHardDelete', () => {
    it('应该成功硬删除租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.delete.mockResolvedValue(true)

      const result = await useCase.executeHardDelete('test-id')

      expect(result).toBe(true)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.delete).toHaveBeenCalledWith('test-id')
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(useCase.executeHardDelete('test-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeRestore', () => {
    it('应该成功恢复租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      // 先将租户标记为已删除状态
      tenant.markAsDeleted()
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.save.mockResolvedValue(tenant)

      const result = await useCase.executeRestore('test-id')

      expect(result).toBe(true)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant)
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(useCase.executeRestore('test-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeBatchDelete', () => {
    it('应该成功批量软删除租户', async () => {
      const tenant1 = new Tenant('test-1', '租户1', 'tenant-1', 'admin-1')
      const tenant2 = new Tenant('test-2', '租户2', 'tenant-2', 'admin-2')

      mockTenantRepository.findById
        .mockResolvedValueOnce(tenant1)
        .mockResolvedValueOnce(tenant2)
      mockTenantRepository.save.mockResolvedValue(tenant1)

      const result = await useCase.executeBatchDelete(['test-1', 'test-2'])

      expect(result.success).toEqual(['test-1', 'test-2'])
      expect(result.failed).toEqual([])
    })

    it('应该处理部分失败的批量删除', async () => {
      const tenant1 = new Tenant('test-1', '租户1', 'tenant-1', 'admin-1')

      mockTenantRepository.findById
        .mockResolvedValueOnce(tenant1)
        .mockResolvedValueOnce(null)
      mockTenantRepository.save.mockResolvedValue(tenant1)

      const result = await useCase.executeBatchDelete(['test-1', 'test-2'])

      expect(result.success).toEqual(['test-1'])
      expect(result.failed).toEqual(['test-2'])
    })
  })

  describe('executeBatchHardDelete', () => {
    it('应该成功批量硬删除租户', async () => {
      const tenant1 = new Tenant('test-1', '租户1', 'tenant-1', 'admin-1')
      const tenant2 = new Tenant('test-2', '租户2', 'tenant-2', 'admin-2')

      mockTenantRepository.findById
        .mockResolvedValueOnce(tenant1)
        .mockResolvedValueOnce(tenant2)
      mockTenantRepository.delete.mockResolvedValue(true)

      const result = await useCase.executeBatchHardDelete(['test-1', 'test-2'])

      expect(result.success).toEqual(['test-1', 'test-2'])
      expect(result.failed).toEqual([])
    })

    it('应该处理部分失败的批量硬删除', async () => {
      const tenant1 = new Tenant('test-1', '租户1', 'tenant-1', 'admin-1')

      mockTenantRepository.findById
        .mockResolvedValueOnce(tenant1)
        .mockResolvedValueOnce(null)
      mockTenantRepository.delete.mockResolvedValue(true)

      const result = await useCase.executeBatchHardDelete(['test-1', 'test-2'])

      expect(result.success).toEqual(['test-1'])
      expect(result.failed).toEqual(['test-2'])
    })
  })
}) 