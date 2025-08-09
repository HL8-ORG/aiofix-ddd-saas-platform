import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { UpdateTenantUseCase } from '../use-cases/update-tenant.use-case'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantRepository } from '../../domain/repositories/tenant.repository'

describe('UpdateTenantUseCase', () => {
  let useCase: UpdateTenantUseCase
  let mockTenantRepository: jest.Mocked<TenantRepository>

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTenantUseCase,
        {
          provide: 'TenantRepository',
          useValue: mockRepository,
        },
      ],
    }).compile()

    useCase = module.get<UpdateTenantUseCase>(UpdateTenantUseCase)
    mockTenantRepository = module.get('TenantRepository') as jest.Mocked<TenantRepository>
  })

  describe('execute', () => {
    it('应该成功更新租户基本信息', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.save.mockResolvedValue(tenant)

      const updateData = {
        name: '新租户名称',
        code: 'new-tenant-code',
        description: '新的描述',
      }

      const result = await useCase.execute('test-id', updateData)

      expect(result).toBe(tenant)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant)
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(
        useCase.execute('test-id', { name: '新名称' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeSettings', () => {
    it('应该成功更新租户设置', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.save.mockResolvedValue(tenant)

      const settings = { theme: 'dark', language: 'zh-CN' }

      const result = await useCase.executeSettings('test-id', settings)

      expect(result).toBe(tenant)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant)
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(
        useCase.executeSettings('test-id', { theme: 'dark' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('executePartialSettings', () => {
    it('应该成功部分更新租户设置', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      tenant.settings = { theme: 'light', language: 'en' }
      mockTenantRepository.findById.mockResolvedValue(tenant)
      mockTenantRepository.save.mockResolvedValue(tenant)

      const partialSettings = { theme: 'dark' }

      const result = await useCase.executePartialSettings('test-id', partialSettings)

      expect(result).toBe(tenant)
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id')
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant)
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(
        useCase.executePartialSettings('test-id', { theme: 'dark' }),
      ).rejects.toThrow(NotFoundException)
    })
  })
}) 