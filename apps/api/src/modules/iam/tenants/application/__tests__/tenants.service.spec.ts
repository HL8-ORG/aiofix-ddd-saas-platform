import { Test, TestingModule } from '@nestjs/testing';
import { TenantsService } from '../tenants.service';
import { Tenant } from '../../domain/entities/tenant.entity';
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantRepository } from '../../domain/repositories/tenant.repository';

/**
 * @test TenantsService应用服务测试
 * @description 测试租户应用服务的业务用例和异常处理
 */
describe('TenantsService', () => {
  let service: TenantsService;
  let mockTenantRepository: jest.Mocked<TenantRepository>;

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCodeString: jest.fn(),
      findAll: jest.fn(),
      findActive: jest.fn(),
      findPending: jest.fn(),
      findSuspended: jest.fn(),
      findDeleted: jest.fn(),
      findByStatus: jest.fn(),
      findByAdminUserId: jest.fn(),
      findBySearch: jest.fn(),
      findRecent: jest.fn(),
      findByDateRange: jest.fn(),
      findWithPagination: jest.fn(),
      exists: jest.fn(),
      existsByCode: jest.fn(),
      existsByCodeString: jest.fn(),
      count: jest.fn(),
      countByStatus: jest.fn(),
      delete: jest.fn(),
      hardDelete: jest.fn(),
      restore: jest.fn(),
      updateStatus: jest.fn(),
      updateSettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: 'TenantRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    mockTenantRepository = module.get('TenantRepository') as jest.Mocked<TenantRepository>;
  });

  describe('createTenant', () => {
    it('应该成功创建租户', async () => {
      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      mockTenantRepository.existsByCodeString.mockResolvedValue(false);
      mockTenantRepository.save.mockResolvedValue(tenant);

      const result = await service.createTenant('测试租户', 'test-tenant', 'admin-id');

      expect(result).toBeInstanceOf(Tenant);
      expect(result.getName()).toBe('测试租户');
      expect(result.getCode()).toBe('test-tenant');
      expect(mockTenantRepository.existsByCodeString).toHaveBeenCalledWith('test-tenant');
      expect(mockTenantRepository.save).toHaveBeenCalled();
    });

    it('应该拒绝创建重复编码的租户', async () => {
      mockTenantRepository.existsByCodeString.mockResolvedValue(true);

      await expect(
        service.createTenant('测试租户', 'test-tenant', 'admin-id')
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getTenantById', () => {
    it('应该成功获取租户', async () => {
      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      mockTenantRepository.findById.mockResolvedValue(tenant);

      const result = await service.getTenantById('test-id');

      expect(result).toBe(tenant);
      expect(mockTenantRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);

      await expect(service.getTenantById('test-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTenantByCode', () => {
    it('应该成功根据编码获取租户', async () => {
      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      mockTenantRepository.findByCodeString.mockResolvedValue(tenant);

      const result = await service.getTenantByCode('test-tenant');

      expect(result).toBe(tenant);
      expect(mockTenantRepository.findByCodeString).toHaveBeenCalledWith('test-tenant');
    });

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findByCodeString.mockResolvedValue(null);

      await expect(service.getTenantByCode('test-tenant')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllTenants', () => {
    it('应该返回所有租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-2'),
      ];
      mockTenantRepository.findAll.mockResolvedValue(tenants);

      const result = await service.getAllTenants();

      expect(result).toEqual(tenants);
      expect(mockTenantRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getActiveTenants', () => {
    it('应该返回激活状态的租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-2'),
      ];
      mockTenantRepository.findActive.mockResolvedValue(tenants);

      const result = await service.getActiveTenants();

      expect(result).toEqual(tenants);
      expect(mockTenantRepository.findActive).toHaveBeenCalled();
    });
  });

  describe('activateTenant', () => {
    it('应该成功激活租户', async () => {
      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockTenantRepository.save.mockResolvedValue(tenant);

      const result = await service.activateTenant('test-id');

      expect(result).toBe(tenant);
      expect(tenant.isActive()).toBe(true);
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant);
    });

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);

      await expect(service.activateTenant('test-id')).rejects.toThrow(NotFoundException);
    });

    it('应该抛出异常当租户无法激活时', async () => {
      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      tenant.markAsDeleted(); // 设置为已删除状态，无法激活
      mockTenantRepository.findById.mockResolvedValue(tenant);

      await expect(service.activateTenant('test-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('suspendTenant', () => {
    it('应该成功禁用租户', async () => {
      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      tenant.activate(); // 先激活，然后禁用
      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockTenantRepository.save.mockResolvedValue(tenant);

      const result = await service.suspendTenant('test-id');

      expect(result).toBe(tenant);
      expect(tenant.isSuspended()).toBe(true);
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant);
    });

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);

      await expect(service.suspendTenant('test-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTenantSettings', () => {
    it('应该成功更新租户配置', async () => {
      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      const newSettings = { theme: 'dark', language: 'zh-CN' };
      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockTenantRepository.save.mockResolvedValue(tenant);

      const result = await service.updateTenantSettings('test-id', newSettings);

      expect(result).toBe(tenant);
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant);
    });

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateTenantSettings('test-id', { theme: 'dark' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTenant', () => {
    it('应该成功删除租户', async () => {
      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      mockTenantRepository.findById.mockResolvedValue(tenant);
      mockTenantRepository.save.mockResolvedValue(tenant);

      const result = await service.deleteTenant('test-id');

      expect(result).toBe(true);
      expect(mockTenantRepository.save).toHaveBeenCalledWith(tenant);
    });

    it('应该抛出异常当租户不存在时', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);

      await expect(service.deleteTenant('test-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTenantStats', () => {
    it('应该返回租户统计信息', async () => {
      mockTenantRepository.count.mockResolvedValue(100);
      mockTenantRepository.countByStatus
        .mockResolvedValueOnce(50) // ACTIVE
        .mockResolvedValueOnce(20) // PENDING
        .mockResolvedValueOnce(20) // SUSPENDED
        .mockResolvedValueOnce(10); // DELETED

      const result = await service.getTenantStats();

      expect(result).toEqual({
        total: 100,
        active: 50,
        pending: 20,
        suspended: 20,
        deleted: 10,
      });

      expect(mockTenantRepository.count).toHaveBeenCalled();
      expect(mockTenantRepository.countByStatus).toHaveBeenCalledWith(TenantStatus.ACTIVE);
      expect(mockTenantRepository.countByStatus).toHaveBeenCalledWith(TenantStatus.PENDING);
      expect(mockTenantRepository.countByStatus).toHaveBeenCalledWith(TenantStatus.SUSPENDED);
      expect(mockTenantRepository.countByStatus).toHaveBeenCalledWith(TenantStatus.DELETED);
    });
  });
}); 