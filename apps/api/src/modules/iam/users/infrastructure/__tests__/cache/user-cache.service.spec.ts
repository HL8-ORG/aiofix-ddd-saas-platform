import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UserCacheService } from '../../cache/user-cache.service';
import { User } from '../../../domain/entities/user.entity';
import { UserStatusValue } from '../../../domain/value-objects/user-status.value-object';

describe('UserCacheService', () => {
  let service: UserCacheService;
  let configService: ConfigService;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    username: 'john_doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    tenantId: '550e8400-e29b-41d4-a716-446655440001',
    adminUserId: '550e8400-e29b-41d4-a716-446655440002',
    passwordHash: 'hashedPassword',
    phone: '+86-138-0013-8000',
    displayName: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    organizationIds: ['org-1', 'org-2'],
    roleIds: ['role-1', 'role-2'],
    preferences: { theme: 'dark' },
    status: UserStatusValue.active(),
    loginAttempts: 0,
    emailVerified: true,
    phoneVerified: false,
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    getUsername: () => 'john_doe',
    getEmail: () => 'john.doe@example.com',
    getPhone: () => '+86-138-0013-8000',
    getStatus: () => 'ACTIVE',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCacheService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              cache: {
                enabled: true,
                ttl: 3600,
                maxSize: 1000,
              },
              database: {
                connectionTimeout: 5000,
                queryTimeout: 30000,
                maxConnections: 10,
              },
              external: {
                notification: {
                  enabled: false,
                  endpoint: 'http://localhost:3001/notifications',
                  timeout: 5000,
                },
                email: {
                  enabled: false,
                  provider: 'smtp',
                  templatePath: './templates/emails',
                },
              },
              security: {
                passwordMinLength: 8,
                passwordMaxLength: 128,
                passwordRequireSpecialChar: true,
                maxLoginAttempts: 5,
                lockoutDuration: 30,
                sessionTimeout: 1440,
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UserCacheService>(UserCacheService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });

  describe('基本缓存操作', () => {
    it('应该能够设置和获取缓存', () => {
      const key = 'test-key';
      const data = { test: 'data' };

      service.set(key, data);
      const result = service.get(key);

      expect(result).toEqual(data);
    });

    it('应该能够删除缓存', () => {
      const key = 'test-key';
      const data = { test: 'data' };

      service.set(key, data);
      service.delete(key);
      const result = service.get(key);

      expect(result).toBeNull();
    });

    it('应该能够清空所有缓存', () => {
      service.set('key1', 'data1');
      service.set('key2', 'data2');

      service.clear();

      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
    });
  });

  describe('用户缓存操作', () => {
    it('应该能够缓存用户数据', () => {
      service.setUser(mockUser);

      const cachedUser = service.getUser(mockUser.id, mockUser.tenantId);

      expect(cachedUser).toBeDefined();
      expect(cachedUser?.id).toBe(mockUser.id);
      expect(cachedUser?.username).toBe(mockUser.username);
    });

    it('应该能够删除用户缓存', () => {
      service.setUser(mockUser);
      service.deleteUser(mockUser.id, mockUser.tenantId);

      const cachedUser = service.getUser(mockUser.id, mockUser.tenantId);

      expect(cachedUser).toBeNull();
    });
  });

  describe('用户列表缓存操作', () => {
    it('应该能够缓存用户列表数据', () => {
      const tenantId = 'tenant-1';
      const page = 1;
      const limit = 10;
      const filters = { status: 'ACTIVE' };
      const data = {
        users: [mockUser],
        total: 1,
      };

      service.setUserList(tenantId, page, limit, filters, data);

      const cachedData = service.getUserList(tenantId, page, limit, filters);

      expect(cachedData).toEqual(data);
    });

    it('应该能够使租户下的所有用户列表缓存失效', () => {
      const tenantId = 'tenant-1';
      const data = { users: [mockUser], total: 1 };

      // 设置多个用户列表缓存
      service.setUserList(tenantId, 1, 10, undefined, data);
      service.setUserList(tenantId, 2, 10, undefined, data);

      // 验证缓存已设置
      expect(service.getUserList(tenantId, 1, 10, undefined)).toEqual(data);
      expect(service.getUserList(tenantId, 2, 10, undefined)).toEqual(data);

      service.invalidateUserList(tenantId);

      // 验证缓存已被清除
      expect(service.getUserList(tenantId, 1, 10, undefined)).toBeNull();
      expect(service.getUserList(tenantId, 2, 10, undefined)).toBeNull();
    });
  });

  describe('缓存统计', () => {
    it('应该能够获取缓存统计信息', () => {
      service.set('key1', 'data1');
      service.set('key2', 'data2');

      const stats = service.getStats();

      expect(stats.size).toBe(2);
      expect(stats.enabled).toBe(true);
      expect(stats.ttl).toBe(3600);
      expect(stats.maxSize).toBe(1000);
    });
  });

  describe('缓存过期', () => {
    it('应该能够处理缓存过期', () => {
      const key = 'test-key';
      const data = { test: 'data' };

      // 设置一个很短的TTL
      service.set(key, data, 1);

      // 等待过期
      setTimeout(() => {
        const result = service.get(key);
        expect(result).toBeNull();
      }, 1100);
    });
  });

  describe('缓存大小限制', () => {
    it('应该能够处理缓存大小限制', () => {
      // 模拟达到最大缓存大小
      for (let i = 0; i < 1001; i++) {
        service.set(`key-${i}`, `data-${i}`);
      }

      const stats = service.getStats();
      expect(stats.size).toBeLessThanOrEqual(1000);
    });
  });

  describe('缓存禁用', () => {
    it('当缓存被禁用时应该返回null', () => {
      // 模拟缓存被禁用
      jest.spyOn(configService, 'get').mockReturnValue({
        cache: {
          enabled: false,
          ttl: 3600,
          maxSize: 1000,
        },
      } as any);

      const disabledService = new UserCacheService(configService);

      disabledService.set('key', 'data');
      const result = disabledService.get('key');

      expect(result).toBeNull();
    });
  });
}); 