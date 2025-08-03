import { Tenant } from '../../entities/tenant.entity';
import { TenantCode } from '../../value-objects/tenant-code.value-object';
import { TenantStatus } from '../../value-objects/tenant-status.value-object';
import { TenantRepository } from '../tenant.repository';

/**
 * @test TenantRepository接口测试
 * @description 测试租户仓储接口的定义和类型正确性
 */
describe('TenantRepository Interface', () => {
  describe('接口定义', () => {
    it('应该定义save方法', () => {
      const mockRepository: TenantRepository = {
        save: jest.fn().mockResolvedValue(new Tenant('test-id', 'test', 'test', 'admin')),
        findById: jest.fn(),
        findByCode: jest.fn(),
        findByCodeString: jest.fn(),
        findByName: jest.fn(),
        findByStatus: jest.fn(),
        findByAdminUserId: jest.fn(),
        findActive: jest.fn(),
        findPending: jest.fn(),
        findSuspended: jest.fn(),
        findDeleted: jest.fn(),
        findAll: jest.fn(),
        findAllWithDeleted: jest.fn(),
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
        findWithPagination: jest.fn(),
        findBySearch: jest.fn(),
        findRecent: jest.fn(),
        findByDateRange: jest.fn(),
      };

      expect(mockRepository.save).toBeDefined();
      expect(typeof mockRepository.save).toBe('function');
    });

    it('应该包含所有必需的CRUD方法', () => {
      const requiredMethods = [
        'save', 'findById', 'findByCode', 'findByCodeString', 'findByName',
        'findByStatus', 'findByAdminUserId', 'findActive', 'findPending',
        'findSuspended', 'findDeleted', 'findAll', 'findAllWithDeleted',
        'exists', 'existsByCode', 'existsByCodeString', 'count', 'countByStatus',
        'delete', 'hardDelete', 'restore', 'updateStatus', 'updateSettings',
        'findWithPagination', 'findBySearch', 'findRecent', 'findByDateRange'
      ];

      const mockRepository: TenantRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findByCode: jest.fn(),
        findByCodeString: jest.fn(),
        findByName: jest.fn(),
        findByStatus: jest.fn(),
        findByAdminUserId: jest.fn(),
        findActive: jest.fn(),
        findPending: jest.fn(),
        findSuspended: jest.fn(),
        findDeleted: jest.fn(),
        findAll: jest.fn(),
        findAllWithDeleted: jest.fn(),
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
        findWithPagination: jest.fn(),
        findBySearch: jest.fn(),
        findRecent: jest.fn(),
        findByDateRange: jest.fn(),
      };

      requiredMethods.forEach(method => {
        expect(mockRepository).toHaveProperty(method);
        expect(typeof mockRepository[method as keyof TenantRepository]).toBe('function');
      });
    });
  });

  describe('类型安全', () => {
    it('应该正确使用TenantStatus枚举', () => {
      expect(TenantStatus.ACTIVE).toBe('active');
      expect(TenantStatus.PENDING).toBe('pending');
      expect(TenantStatus.SUSPENDED).toBe('suspended');
      expect(TenantStatus.DELETED).toBe('deleted');
    });

    it('应该正确使用TenantCode值对象', () => {
      const code = new TenantCode('test-tenant');
      expect(code).toBeInstanceOf(TenantCode);
    });

    it('应该正确使用Tenant实体', () => {
      const tenant = new Tenant('test-id', 'test', 'test', 'admin');
      expect(tenant).toBeInstanceOf(Tenant);
    });
  });
}); 