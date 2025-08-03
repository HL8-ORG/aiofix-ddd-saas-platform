import { Test, TestingModule } from '@nestjs/testing';
import { TenantInfrastructureModule } from '../config/tenant-infrastructure.config';
import { TenantRepositoryMemory } from '../repositories/tenant.repository.memory';
import { TenantNotificationService } from '../external/tenant-notification.service';
import { TenantCacheService } from '../cache/tenant-cache.service';
import { Tenant } from '../../domain/entities/tenant.entity';
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object';
import { generateUuid } from '../../../../../shared/domain/utils/uuid.util';

/**
 * @description 租户基础设施层单元测试
 * 测试基础设施层的各个组件是否正常工作
 */
describe('租户基础设施层单元测试', () => {
  let module: TestingModule;
  let tenantRepository: TenantRepositoryMemory;
  let notificationService: TenantNotificationService;
  let cacheService: TenantCacheService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TenantInfrastructureModule],
    }).compile();

    tenantRepository = module.get<TenantRepositoryMemory>('TenantRepository');
    notificationService = module.get<TenantNotificationService>(TenantNotificationService);
    cacheService = module.get<TenantCacheService>(TenantCacheService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('仓储实现', () => {
    it('应该能够保存和查找租户', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid(),
        '这是一个测试租户',
        { theme: 'dark', language: 'zh-CN' }
      );

      const savedTenant = await tenantRepository.save(tenant);
      expect(savedTenant.id).toBe(tenant.id);

      const foundTenant = await tenantRepository.findById(tenant.id);
      expect(foundTenant).toBeDefined();
      expect(foundTenant?.getName()).toBe('测试租户');
    });

    it('应该能够根据编码查找租户', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid()
      );

      await tenantRepository.save(tenant);

      const foundTenant = await tenantRepository.findByCodeString('test-tenant');
      expect(foundTenant).toBeDefined();
      expect(foundTenant?.getCode()).toBe('test-tenant');
    });

    it('应该能够检查租户是否存在', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid()
      );

      expect(await tenantRepository.exists(tenant.id)).toBe(false);
      expect(await tenantRepository.existsByCodeString('test-tenant')).toBe(false);

      await tenantRepository.save(tenant);

      expect(await tenantRepository.exists(tenant.id)).toBe(true);
      expect(await tenantRepository.existsByCodeString('test-tenant')).toBe(true);
    });

    it('应该能够统计租户数量', async () => {
      const tenant1 = new Tenant(
        generateUuid(),
        '租户A',
        'tenant-a',
        generateUuid()
      );
      const tenant2 = new Tenant(
        generateUuid(),
        '租户B',
        'tenant-b',
        generateUuid()
      );

      await tenantRepository.save(tenant1);
      await tenantRepository.save(tenant2);

      const count = await tenantRepository.count();
      expect(count).toBe(2);

      const pendingCount = await tenantRepository.countByStatus(TenantStatus.PENDING);
      expect(pendingCount).toBe(2);
    });
  });

  describe('通知服务', () => {
    it('应该能够发送欢迎邮件', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid()
      );

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendWelcomeEmail(tenant);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('发送欢迎邮件给租户: 测试租户 (test-tenant)')
      );

      consoleSpy.mockRestore();
    });

    it('应该能够发送激活通知', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid()
      );

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendActivationNotification(tenant, 'admin-user-id');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('发送激活通知给租户: 测试租户 (test-tenant)')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('缓存服务', () => {
    it('应该能够设置和获取租户缓存', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid()
      );

      await cacheService.setTenant(tenant);

      const cachedTenant = await cacheService.getTenant(tenant.id);
      expect(cachedTenant).toBeDefined();
      expect(cachedTenant?.getName()).toBe('测试租户');
    });

    it('应该能够删除租户缓存', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid()
      );

      await cacheService.setTenant(tenant);

      const exists = await cacheService.exists(`tenant:${tenant.id}`);
      expect(exists).toBe(true);

      await cacheService.deleteTenant(tenant.id);

      const notExists = await cacheService.exists(`tenant:${tenant.id}`);
      expect(notExists).toBe(false);
    });

    it('应该能够清除所有缓存', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '测试租户',
        'test-tenant',
        generateUuid()
      );

      await cacheService.setTenant(tenant);

      expect(await cacheService.exists(`tenant:${tenant.id}`)).toBe(true);

      await cacheService.clear();

      expect(await cacheService.exists(`tenant:${tenant.id}`)).toBe(false);
    });
  });

  describe('模块集成', () => {
    it('应该能够正确注入所有服务', () => {
      expect(tenantRepository).toBeDefined();
      expect(notificationService).toBeDefined();
      expect(cacheService).toBeDefined();
    });

    it('应该能够进行完整的业务流程测试', async () => {
      // 1. 创建租户
      const tenant = new Tenant(
        generateUuid(),
        '集成测试租户',
        'integration-test-tenant',
        generateUuid(),
        '这是一个集成测试租户',
        { theme: 'dark', language: 'zh-CN' }
      );

      // 2. 保存租户
      const savedTenant = await tenantRepository.save(tenant);
      expect(savedTenant.id).toBe(tenant.id);

      // 3. 缓存租户
      await cacheService.setTenant(savedTenant);

      // 4. 发送欢迎邮件
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await notificationService.sendWelcomeEmail(savedTenant);
      expect(consoleSpy).toHaveBeenCalled();

      // 5. 验证缓存
      const cachedTenant = await cacheService.getTenant(tenant.id);
      expect(cachedTenant?.getName()).toBe('集成测试租户');

      consoleSpy.mockRestore();
    });
  });
}); 