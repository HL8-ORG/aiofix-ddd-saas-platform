import { Test, TestingModule } from '@nestjs/testing';
import { UserRepositoryMemory } from '../user.repository.memory';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { Email } from '../../../../domain/value-objects/email.vo';
import { UserName } from '../../../../domain/value-objects/username.vo';
import { Password } from '../../../../domain/value-objects/password.vo';
import { PhoneNumber } from '../../../../domain/value-objects/phone-number.vo';
import { UserStatus, UserStatusType } from '../../../../domain/value-objects/user-status.vo';
import { generateUuid } from '@/shared/utils/uuid.util';

/**
 * @describe UserRepositoryMemory
 * @description 用户仓储内存实现的测试套件
 */
describe('UserRepositoryMemory', () => {
  let repository: UserRepositoryMemory;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [UserRepositoryMemory],
    }).compile();

    repository = module.get<UserRepositoryMemory>(UserRepositoryMemory);
  });

  afterEach(() => {
    repository.clear();
  });

  afterAll(async () => {
    await module.close();
  });

  /**
   * @function createTestUser
   * @description 创建测试用户
   */
  const createTestUser = (overrides: Partial<{
    id: string;
    email: string;
    username: string;
    password: string;
    phoneNumber: string;
    tenantId: string;
    status: string;
  }> = {}) => {
    const defaults = {
      id: generateUuid(),
      email: 'test@example.com',
      username: 'testuser',
      password: 'ValidP@ssw0rd',
      phoneNumber: '+8613800138000',
      tenantId: 'test-tenant',
      status: 'ACTIVE',
    };

    const config = { ...defaults, ...overrides };

    // 根据状态字符串创建正确的UserStatus
    const createUserStatus = (status: string) => {
      switch (status.toUpperCase()) {
        case 'PENDING':
          return UserStatus.pending();
        case 'ACTIVE':
          return UserStatus.active();
        case 'INACTIVE':
          return UserStatus.inactive();
        case 'LOCKED':
          return UserStatus.locked();
        case 'SUSPENDED':
          return UserStatus.suspended();
        case 'DELETED':
          return UserStatus.deleted();
        default:
          return UserStatus.active();
      }
    };

    return User.create({
      email: new Email(config.email),
      username: new UserName(config.username),
      password: Password.create(config.password),
      phoneNumber: new PhoneNumber(config.phoneNumber),
      tenantId: config.tenantId,
      status: createUserStatus(config.status),
    });
  };

  describe('save', () => {
    it('应该成功保存用户', async () => {
      const user = createTestUser();
      const savedUser = await repository.save(user);

      expect(savedUser).toBe(user);
      expect(await repository.findById(user.getId(), user.getTenantId())).toBe(user);
    });

    it('应该支持更新用户', async () => {
      const user = createTestUser({ status: 'PENDING' });
      await repository.save(user);

      // 模拟用户状态变更
      user.activate();
      const updatedUser = await repository.save(user);

      expect(updatedUser.getStatus().getValue()).toBe(UserStatusType.ACTIVE);
    });
  });

  describe('findById', () => {
    it('应该根据ID找到用户', async () => {
      const user = createTestUser();
      await repository.save(user);

      const foundUser = await repository.findById(user.getId(), user.getTenantId());
      expect(foundUser).toBe(user);
    });

    it('当用户不存在时应该返回null', async () => {
      const userId = UserId.fromString(generateUuid());
      const foundUser = await repository.findById(userId, 'test-tenant');
      expect(foundUser).toBeNull();
    });

    it('应该支持多租户隔离', async () => {
      const user1 = createTestUser({ tenantId: 'tenant1' });
      const user2 = createTestUser({ tenantId: 'tenant2' });

      await repository.save(user1);
      await repository.save(user2);

      // 在tenant1中查找user2应该返回null
      const foundUser = await repository.findById(user2.getId(), 'tenant1');
      expect(foundUser).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('应该根据邮箱找到用户', async () => {
      const user = createTestUser();
      await repository.save(user);

      const foundUser = await repository.findByEmail(user.getEmail(), user.getTenantId());
      expect(foundUser).toBe(user);
    });

    it('当邮箱不存在时应该返回null', async () => {
      const email = new Email('nonexistent@example.com');
      const foundUser = await repository.findByEmail(email, 'test-tenant');
      expect(foundUser).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('应该根据用户名找到用户', async () => {
      const user = createTestUser();
      await repository.save(user);

      const foundUser = await repository.findByUsername(user.getUsername(), user.getTenantId());
      expect(foundUser).toBe(user);
    });

    it('当用户名不存在时应该返回null', async () => {
      const username = new UserName('nonexistent');
      const foundUser = await repository.findByUsername(username, 'test-tenant');
      expect(foundUser).toBeNull();
    });
  });

  describe('findByEmailOrUsername', () => {
    it('应该根据邮箱找到用户', async () => {
      const user = createTestUser();
      await repository.save(user);

      const foundUser = await repository.findByEmailOrUsername(
        user.getEmail().getValue(),
        user.getTenantId()
      );
      expect(foundUser).toBe(user);
    });

    it('应该根据用户名找到用户', async () => {
      const user = createTestUser();
      await repository.save(user);

      const foundUser = await repository.findByEmailOrUsername(
        user.getUsername().getValue(),
        user.getTenantId()
      );
      expect(foundUser).toBe(user);
    });

    it('应该忽略大小写', async () => {
      const user = createTestUser({ email: 'Test@Example.com', username: 'TestUser' });
      await repository.save(user);

      const foundUser = await repository.findByEmailOrUsername('test@example.com', user.getTenantId());
      expect(foundUser).toBe(user);

      const foundUser2 = await repository.findByEmailOrUsername('testuser', user.getTenantId());
      expect(foundUser2).toBe(user);
    });
  });

  describe('exists', () => {
    it('当用户存在时应该返回true', async () => {
      const user = createTestUser();
      await repository.save(user);

      const exists = await repository.exists(user.getId(), user.getTenantId());
      expect(exists).toBe(true);
    });

    it('当用户不存在时应该返回false', async () => {
      const userId = UserId.fromString(generateUuid());
      const exists = await repository.exists(userId, 'test-tenant');
      expect(exists).toBe(false);
    });
  });

  describe('existsByEmail', () => {
    it('当邮箱存在时应该返回true', async () => {
      const user = createTestUser();
      await repository.save(user);

      const exists = await repository.existsByEmail(user.getEmail(), user.getTenantId());
      expect(exists).toBe(true);
    });

    it('当邮箱不存在时应该返回false', async () => {
      const email = new Email('nonexistent@example.com');
      const exists = await repository.existsByEmail(email, 'test-tenant');
      expect(exists).toBe(false);
    });

    it('应该支持排除指定用户ID', async () => {
      const user1 = createTestUser({ email: 'test@example.com' });
      const user2 = createTestUser({ email: 'test@example.com' });
      await repository.save(user1);
      await repository.save(user2);

      // 排除user1，应该返回true（因为user2存在）
      const exists = await repository.existsByEmail(
        user1.getEmail(),
        user1.getTenantId(),
        user1.getId()
      );
      expect(exists).toBe(true);

      // 排除user2，应该返回true（因为user1存在）
      const exists2 = await repository.existsByEmail(
        user2.getEmail(),
        user2.getTenantId(),
        user2.getId()
      );
      expect(exists2).toBe(true);
    });
  });

  describe('existsByUsername', () => {
    it('当用户名存在时应该返回true', async () => {
      const user = createTestUser();
      await repository.save(user);

      const exists = await repository.existsByUsername(user.getUsername(), user.getTenantId());
      expect(exists).toBe(true);
    });

    it('当用户名不存在时应该返回false', async () => {
      const username = new UserName('nonexistent');
      const exists = await repository.existsByUsername(username, 'test-tenant');
      expect(exists).toBe(false);
    });
  });

  describe('delete', () => {
    it('应该软删除用户', async () => {
      const user = createTestUser();
      await repository.save(user);

      await repository.delete(user.getId(), user.getTenantId());

      const foundUser = await repository.findById(user.getId(), user.getTenantId());
      expect(foundUser?.getStatus().getValue()).toBe(UserStatusType.DELETED);
    });
  });

  describe('findActiveUsers', () => {
    it('应该只返回活跃用户', async () => {
      const activeUser1 = createTestUser({ status: 'ACTIVE' });
      const activeUser2 = createTestUser({ status: 'ACTIVE' });
      const inactiveUser = createTestUser({ status: 'INACTIVE' });

      await repository.save(activeUser1);
      await repository.save(activeUser2);
      await repository.save(inactiveUser);

      const activeUsers = await repository.findActiveUsers('test-tenant');
      expect(activeUsers).toHaveLength(2);
      expect(activeUsers).toContain(activeUser1);
      expect(activeUsers).toContain(activeUser2);
      expect(activeUsers).not.toContain(inactiveUser);
    });
  });

  describe('findUsersByStatus', () => {
    it('应该根据状态查找用户', async () => {
      const lockedUser1 = createTestUser({ status: 'LOCKED' });
      const lockedUser2 = createTestUser({ status: 'LOCKED' });
      const activeUser = createTestUser({ status: 'ACTIVE' });

      await repository.save(lockedUser1);
      await repository.save(lockedUser2);
      await repository.save(activeUser);

      const lockedUsers = await repository.findUsersByStatus(UserStatusType.LOCKED, 'test-tenant');
      expect(lockedUsers).toHaveLength(2);
      expect(lockedUsers).toContain(lockedUser1);
      expect(lockedUsers).toContain(lockedUser2);
    });
  });

  describe('count', () => {
    it('应该正确统计用户数量', async () => {
      const user1 = createTestUser();
      const user2 = createTestUser();
      const user3 = createTestUser();

      await repository.save(user1);
      await repository.save(user2);
      await repository.save(user3);

      const count = await repository.count('test-tenant');
      expect(count).toBe(3);
    });

    it('应该支持状态过滤', async () => {
      const activeUser = createTestUser({ status: 'ACTIVE' });
      const inactiveUser = createTestUser({ status: 'INACTIVE' });

      await repository.save(activeUser);
      await repository.save(inactiveUser);

      const activeCount = await repository.count('test-tenant', { status: UserStatusType.ACTIVE });
      expect(activeCount).toBe(1);
    });

    it('应该支持搜索过滤', async () => {
      const user1 = createTestUser({ email: 'john@example.com' });
      const user2 = createTestUser({ email: 'jane@example.com' });
      const user3 = createTestUser({ email: 'bob@example.com' });

      await repository.save(user1);
      await repository.save(user2);
      await repository.save(user3);

      const count = await repository.count('test-tenant', { search: 'john' });
      expect(count).toBe(1);
    });
  });

  describe('findUsersForTenant', () => {
    it('应该返回租户下的所有用户', async () => {
      const user1 = createTestUser({ tenantId: 'tenant1' });
      const user2 = createTestUser({ tenantId: 'tenant1' });
      const user3 = createTestUser({ tenantId: 'tenant2' });

      await repository.save(user1);
      await repository.save(user2);
      await repository.save(user3);

      const tenant1Users = await repository.findUsersForTenant('tenant1');
      expect(tenant1Users).toHaveLength(2);
      expect(tenant1Users).toContain(user1);
      expect(tenant1Users).toContain(user2);
      expect(tenant1Users).not.toContain(user3);
    });

    it('应该支持分页', async () => {
      const users = Array.from({ length: 10 }, (_, i) =>
        createTestUser({ username: `user${i}` })
      );

      for (const user of users) {
        await repository.save(user);
      }

      const firstPage = await repository.findUsersForTenant('test-tenant', { limit: 5, offset: 0 });
      const secondPage = await repository.findUsersForTenant('test-tenant', { limit: 5, offset: 5 });

      expect(firstPage).toHaveLength(5);
      expect(secondPage).toHaveLength(5);
      expect(firstPage).not.toEqual(secondPage);
    });

    it('应该支持排序', async () => {
      const user1 = createTestUser({ username: 'alice' });
      const user2 = createTestUser({ username: 'bob' });
      const user3 = createTestUser({ username: 'charlie' });

      await repository.save(user3);
      await repository.save(user1);
      await repository.save(user2);

      const sortedUsers = await repository.findUsersForTenant('test-tenant', {
        sortBy: 'username',
        sortOrder: 'asc',
      });

      expect(sortedUsers[0].getUsername().getValue()).toBe('alice');
      expect(sortedUsers[1].getUsername().getValue()).toBe('bob');
      expect(sortedUsers[2].getUsername().getValue()).toBe('charlie');
    });
  });
});
