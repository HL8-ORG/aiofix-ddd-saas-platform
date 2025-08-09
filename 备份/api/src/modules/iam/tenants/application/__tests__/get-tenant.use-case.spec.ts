import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { GetTenantUseCase } from '../use-cases/get-tenant.use-case'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantRepository } from '../../domain/repositories/tenant.repository'

describe('GetTenantUseCase', () => {
  let useCase: GetTenantUseCase
  let mockTenantRepository: jest.Mocked<TenantRepository>

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByCodeString: jest.fn(),
      findByName: jest.fn(),
      findByAdminUserId: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTenantUseCase,
        {
          provide: 'TenantRepository',
          useValue: mockRepository,
        },
      ],
    }).compile()

    useCase = module.get<GetTenantUseCase>(GetTenantUseCase)
    mockTenantRepository = module.get('TenantRepository') as jest.Mocked<TenantRepository>
  })

  describe('execute', () => {
    it('应该成功根据ID获取租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)

      const result = await useCase.execute('test-id')

      expect(result).toBe(tenant)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(useCase.execute('test-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeByCode', () => {
    it('应该成功根据编码获取租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findByCodeString.mockResolvedValue(tenant)

      const result = await useCase.executeByCode('test-tenant')

      expect(result).toBe(tenant)
      expect(mockTenantRepository.findByCodeString).toHaveBeenCalledWith('test-tenant')
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findByCodeString.mockResolvedValue(null)

      await expect(useCase.executeByCode('test-tenant')).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeByName', () => {
    it('应该成功根据名称获取租户列表', async () => {
      const tenants = [
        new Tenant('test-1', '测试租户', 'test-tenant-1', 'admin-1'),
        new Tenant('test-2', '测试租户', 'test-tenant-2', 'admin-2'),
      ]
      mockTenantRepository.findByName.mockResolvedValue(tenants)

      const result = await useCase.executeByName('测试租户')

      expect(result).toEqual(tenants)
      expect(mockTenantRepository.findByName).toHaveBeenCalledWith('测试租户')
    })
  })

  describe('executeByAdminUserId', () => {
    it('应该成功根据管理员用户ID获取租户列表', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-id'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-id'),
      ]
      mockTenantRepository.findByAdminUserId.mockResolvedValue(tenants)

      const result = await useCase.executeByAdminUserId('admin-id')

      expect(result).toEqual(tenants)
      expect(mockTenantRepository.findByAdminUserId).toHaveBeenCalledWith('admin-id')
    })
  })
}) 