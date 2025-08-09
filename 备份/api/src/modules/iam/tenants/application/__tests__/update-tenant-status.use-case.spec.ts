import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { UpdateTenantStatusUseCase } from '../use-cases/update-tenant-status.use-case'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantRepository } from '../../domain/repositories/tenant.repository'

describe('UpdateTenantStatusUseCase', () => {
  let useCase: UpdateTenantStatusUseCase
  let mockTenantRepository: jest.Mocked<TenantRepository>

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTenantStatusUseCase,
        {
          provide: 'TenantRepository',
          useValue: mockRepository,
        },
      ],
    }).compile()

    useCase = module.get<UpdateTenantStatusUseCase>(UpdateTenantStatusUseCase)
    mockTenantRepository = module.get('TenantRepository') as jest.Mocked<TenantRepository>
  })

  describe('executeActivate', () => {
    it('应该成功激活租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.save.mockResolvedValue(tenant)

      const result = await useCase.executeActivate('test-id')

      expect(result).toBe(tenant)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant)
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(useCase.executeActivate('test-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeSuspend', () => {
    it('应该成功禁用租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.save.mockResolvedValue(tenant)

      const result = await useCase.executeSuspend('test-id', '测试原因')

      expect(result).toBe(tenant)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant)
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(useCase.executeSuspend('test-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeUpdateStatus', () => {
    it('应该成功更新租户状态为激活', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.save.mockResolvedValue(tenant)

      const result = await useCase.executeUpdateStatus('test-id', 'ACTIVE')

      expect(result).toBe(tenant)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant)
    })

    it('应该成功更新租户状态为禁用', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.save.mockResolvedValue(tenant)

      const result = await useCase.executeUpdateStatus('test-id', 'SUSPENDED')

      expect(result).toBe(tenant)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant)
    })

    it('应该成功更新租户状态为删除', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.save.mockResolvedValue(tenant)

      const result = await useCase.executeUpdateStatus('test-id', 'DELETED')

      expect(result).toBe(tenant)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant)
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(useCase.executeUpdateStatus('test-id', 'ACTIVE')).rejects.toThrow(NotFoundException)
    })

    it('应该抛出异常当状态无效时', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)

      await expect(useCase.executeUpdateStatus('test-id', 'INVALID')).rejects.toThrow('无效的租户状态')
    })
  })
}) 