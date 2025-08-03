import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RoleCacheService } from '../cache/role-cache.service';
import { Role } from '@/modules/iam/roles/domain/entities/role.entity';
import type { Cache } from 'cache-manager';

describe('RoleCacheService', () => {
  let service: RoleCacheService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RoleCacheService>(RoleCacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('generateCacheKey', () => {
    it('应该生成正确的缓存键', () => {
      const tenantId = 'tenant-1';
      const roleId = 'role-1';
      const expectedKey = 'role:tenant-1:role-1';

      // 通过反射访问私有方法
      const generateCacheKey = (service as any).generateCacheKey.bind(service);
      const result = generateCacheKey(tenantId, roleId);

      expect(result).toBe(expectedKey);
    });
  });

  describe('get', () => {
    it('应该从缓存中获取角色', async () => {
      const tenantId = 'tenant-1';
      const roleId = 'role-1';
      const mockRole = new Role(roleId, '测试角色', 'TEST_ROLE', tenantId, 'admin-1');
      const serializedRole = {
        id: roleId,
        name: '测试角色',
        code: 'TEST_ROLE',
        status: 'ACTIVE',
        tenantId,
        adminUserId: 'admin-1',
        priority: 100,
        permissionIds: [],
        userIds: [],
        isSystemRole: false,
        isDefaultRole: false,
        childRoleIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      cacheManager.get.mockResolvedValue(JSON.stringify(serializedRole));

      const result = await service.get(tenantId, roleId);

      expect(cacheManager.get).toHaveBeenCalledWith('role:tenant-1:role-1');
      expect(result).toBeInstanceOf(Role);
      expect(result?.id).toBe(roleId);
      expect(result?.getName()).toBe('测试角色');
    });

    it('应该在缓存未命中时返回null', async () => {
      const tenantId = 'tenant-1';
      const roleId = 'role-1';

      cacheManager.get.mockResolvedValue(null);

      const result = await service.get(tenantId, roleId);

      expect(result).toBeNull();
    });

    it('应该在缓存数据损坏时删除缓存并返回null', async () => {
      const tenantId = 'tenant-1';
      const roleId = 'role-1';

      cacheManager.get.mockResolvedValue('invalid-json');

      const result = await service.get(tenantId, roleId);

      expect(cacheManager.del).toHaveBeenCalledWith('role:tenant-1:role-1');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('应该将角色存储到缓存中', async () => {
      const tenantId = 'tenant-1';
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', tenantId, 'admin-1');

      await service.set(tenantId, role);

      expect(cacheManager.set).toHaveBeenCalledWith(
        'role:tenant-1:role-1',
        expect.any(String),
        3600
      );
    });

    it('应该正确序列化角色数据', async () => {
      const tenantId = 'tenant-1';
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', tenantId, 'admin-1');

      await service.set(tenantId, role);

      const setCall = cacheManager.set.mock.calls[0];
      const serializedData = JSON.parse(setCall[1] as string);

      expect(serializedData).toMatchObject({
        id: 'role-1',
        name: '测试角色',
        code: 'TEST_ROLE',
        status: 'ACTIVE',
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        priority: 100,
        isSystemRole: false,
        isDefaultRole: false,
      });
    });
  });

  describe('delete', () => {
    it('应该从缓存中删除角色', async () => {
      const tenantId = 'tenant-1';
      const roleId = 'role-1';

      await service.delete(tenantId, roleId);

      expect(cacheManager.del).toHaveBeenCalledWith('role:tenant-1:role-1');
    });
  });

  describe('serializeRole', () => {
    it('应该正确序列化角色实体', () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      role.permissionIds = ['perm-1', 'perm-2'];
      role.userIds = ['user-1', 'user-2'];
      role.childRoleIds = ['child-1'];

      const serialized = (service as any).serializeRole(role);

      expect(serialized).toMatchObject({
        id: 'role-1',
        name: '测试角色',
        code: 'TEST_ROLE',
        status: 'ACTIVE',
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        priority: 100,
        permissionIds: ['perm-1', 'perm-2'],
        userIds: ['user-1', 'user-2'],
        childRoleIds: ['child-1'],
        isSystemRole: false,
        isDefaultRole: false,
      });
    });
  });

  describe('deserializeRole', () => {
    it('应该正确反序列化角色数据', () => {
      const roleData = {
        id: 'role-1',
        name: '测试角色',
        code: 'TEST_ROLE',
        status: 'ACTIVE',
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        priority: 100,
        permissionIds: ['perm-1', 'perm-2'],
        userIds: ['user-1', 'user-2'],
        childRoleIds: ['child-1'],
        isSystemRole: false,
        isDefaultRole: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      };

      const role = (service as any).deserializeRole(roleData);

      expect(role).toBeInstanceOf(Role);
      expect(role.id).toBe('role-1');
      expect(role.getName()).toBe('测试角色');
      expect(role.getCode()).toBe('TEST_ROLE');
      expect(role.getStatus()).toBe('ACTIVE');
      expect(role.tenantId).toBe('tenant-1');
      expect(role.adminUserId).toBe('admin-1');
      expect(role.getPriority()).toBe(100);
      expect(role.permissionIds).toEqual(['perm-1', 'perm-2']);
      expect(role.userIds).toEqual(['user-1', 'user-2']);
      expect(role.childRoleIds).toEqual(['child-1']);
      expect(role.getIsSystemRole()).toBe(false);
      expect(role.getIsDefaultRole()).toBe(false);
    });

    it('应该处理空的数组属性', () => {
      const roleData = {
        id: 'role-1',
        name: '测试角色',
        code: 'TEST_ROLE',
        status: 'ACTIVE',
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        priority: 100,
        permissionIds: null,
        userIds: null,
        childRoleIds: null,
        isSystemRole: false,
        isDefaultRole: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const role = (service as any).deserializeRole(roleData);

      expect(role.permissionIds).toEqual([]);
      expect(role.userIds).toEqual([]);
      expect(role.childRoleIds).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('应该在缓存操作失败时正确处理错误', async () => {
      const tenantId = 'tenant-1';
      const roleId = 'role-1';

      cacheManager.get.mockRejectedValue(new Error('Cache error'));

      await expect(service.get(tenantId, roleId)).rejects.toThrow('Cache error');
    });

    it('应该在设置缓存失败时正确处理错误', async () => {
      const tenantId = 'tenant-1';
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', tenantId, 'admin-1');

      cacheManager.set.mockRejectedValue(new Error('Cache set error'));

      await expect(service.set(tenantId, role)).rejects.toThrow('Cache set error');
    });
  });
}); 