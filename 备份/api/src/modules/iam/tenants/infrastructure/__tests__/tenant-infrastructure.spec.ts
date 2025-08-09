import { Test, type TestingModule } from '@nestjs/testing'
import { generateUuid } from '../../../../../shared/domain/utils/uuid.util'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantCacheService } from '../cache/tenant-cache.service'
import { TenantInfrastructureModule } from '../config/tenant-infrastructure.config'
import { TenantNotificationService } from '../external/tenant-notification.service'
import type { TenantRepositoryMemory } from '../repositories/tenant.repository.memory'

/**
 * @description 租户基础设施层集成测试
 * 测试基础设施层的各个组件是否正常工作
 */
describe('租户基础设施层', () => {
  let module: TestingModule
  let tenantRepository: TenantRepositoryMemory
  let notificationService: TenantNotificationService
  let cacheService: TenantCacheService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TenantInfrastructureModule],
    }).compile()

    tenantRepository = module.get<TenantRepositoryMemory>('TenantRepository')
    notificationService = module.get<TenantNotificationService>(
      TenantNotificationService,
    )
    cacheService = module.get<TenantCacheService>(TenantCacheService)
  })

  afterEach(async () => {
    await module.close()
  })

  describe('仓储实现', () => {
    it('应该能够保存和查找租户', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid(),
        '这是一个测试租户',
        { theme: 'dark', language: 'zh-CN' },
      )

      const savedTenant = await tenantRepository.save(tenant)
      expect(savedTenant.id).toBe(tenant.id)

      const foundTenant = await tenantRepository.findById(tenant.id)
      expect(foundTenant).toBeDefined()
      expect(foundTenant?.getName()).toBe('测试租户')
    })

    it('应该能够根据编码查找租户', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid(),
      )

      await tenantRepository.save(tenant)

      const foundTenant = await tenantRepository.findByCodeString('test-tenant')
      expect(foundTenant).toBeDefined()
      expect(foundTenant?.getCode()).toBe('test-tenant')
    })
  })

  describe('通知服务', () => {
    it('应该能够发送欢迎邮件', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid(),
      )

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await notificationService.sendWelcomeEmail(tenant)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('发送欢迎邮件给租户: 测试租户 (test-tenant)'),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('缓存服务', () => {
    it('应该能够设置和获取缓存', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid(),
      )

      await cacheService.setTenant(tenant)

      const cachedTenant = await cacheService.getTenant(tenant.id)
      expect(cachedTenant).toBeDefined()
      expect(cachedTenant?.getName()).toBe('测试租户')
    })

    it('应该能够删除缓存', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid(),
      )

      await cacheService.setTenant(tenant)

      const exists = await cacheService.exists(`tenant:${tenant.id}`)
      expect(exists).toBe(true)

      await cacheService.deleteTenant(tenant.id)

      const notExists = await cacheService.exists(`tenant:${tenant.id}`)
      expect(notExists).toBe(false)
    })
  })

  describe('模块集成', () => {
    it('应该能够正确注入所有服务', () => {
      expect(tenantRepository).toBeDefined()
      expect(notificationService).toBeDefined()
      expect(cacheService).toBeDefined()
    })
  })
})
