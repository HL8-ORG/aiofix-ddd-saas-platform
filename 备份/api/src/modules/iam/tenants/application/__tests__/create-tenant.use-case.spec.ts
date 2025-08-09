import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException } from '@nestjs/common'
import { CreateTenantUseCase } from '../use-cases/create-tenant.use-case'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantRepository } from '../../domain/repositories/tenant.repository'

describe('CreateTenantUseCase', () => {
  let useCase: CreateTenantUseCase
  let mockTenantRepository: jest.Mocked<TenantRepository>

  beforeEach(async () => {
    const mockRepository = {
      existsByCodeString: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTenantUseCase,
        {
          provide: 'TenantRepository',
          useValue: mockRepository,
        },
      ],
    }).compile()

    useCase = module.get<CreateTenantUseCase>(CreateTenantUseCase)
    mockTenantRepository = module.get('TenantRepository') as jest.Mocked<TenantRepository>
  })

  describe('execute', () => {
    it('应该成功创建租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.existsByCodeString.mockResolvedValue(false)
      mockTenantRepository.findByName.mockResolvedValue([])
      mockTenantRepository.save.mockResolvedValue(tenant)

      const result = await useCase.execute({
        name: '测试租户',
        code: 'test-tenant',
        adminUserId: 'admin-id',
      })

      expect(result).toBeInstanceOf(Tenant)
      expect(result.getName()).toBe('测试租户')
      expect(result.getCode()).toBe('test-tenant')
      expect(mockTenantRepository.existsByCodeString).toHaveBeenCalledWith('test-tenant')
      expect(mockTenantRepository.findByName).toHaveBeenCalledWith('测试租户')
      expect(mockTenantRepository.save).toHaveBeenCalled()
    })

    it('应该拒绝创建重复编码的租户', async () => {
      mockTenantRepository.existsByCodeString.mockResolvedValue(true)

      await expect(
        useCase.execute({
          name: '测试租户',
          code: 'test-tenant',
          adminUserId: 'admin-id',
        }),
      ).rejects.toThrow(ConflictException)
    })

    it('应该拒绝创建重复名称的租户', async () => {
      const existingTenant = new Tenant('existing-id', '测试租户', 'existing-tenant', 'admin-id')
      mockTenantRepository.existsByCodeString.mockResolvedValue(false)
      mockTenantRepository.findByName.mockResolvedValue([existingTenant])

      await expect(
        useCase.execute({
          name: '测试租户',
          code: 'test-tenant',
          adminUserId: 'admin-id',
        }),
      ).rejects.toThrow(ConflictException)
    })
  })
}) 