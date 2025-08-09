import { UserRepository, FindUsersOptions, CountUsersOptions } from '../user.repository.interface';
import { User } from '../../entities/user.entity';
import { UserId } from '../../value-objects/user-id.vo';
import { Email } from '../../value-objects/email.vo';
import { UserName } from '../../value-objects/username.vo';
import { Password } from '../../value-objects/password.vo';

/**
 * @class MockUserRepository
 * @description 用户仓储接口的模拟实现，用于测试接口契约
 */
class MockUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<User> {
    const key = `${user.getTenantId()}:${user.getId().getValue()}`;
    this.users.set(key, user);
    return user;
  }

  async findById(id: UserId, tenantId: string): Promise<User | null> {
    const key = `${tenantId}:${id.getValue()}`;
    return this.users.get(key) || null;
  }

  async findByEmail(email: Email, tenantId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.getTenantId() === tenantId && user.getEmail().equals(email)) {
        return user;
      }
    }
    return null;
  }

  async findByUsername(username: UserName, tenantId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.getTenantId() === tenantId && user.getUsername().equals(username)) {
        return user;
      }
    }
    return null;
  }

  async findByEmailOrUsername(identifier: string, tenantId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.getTenantId() === tenantId) {
        if (user.getEmail().getValue() === identifier || user.getUsername().getValue() === identifier) {
          return user;
        }
      }
    }
    return null;
  }

  async exists(id: UserId, tenantId: string): Promise<boolean> {
    const key = `${tenantId}:${id.getValue()}`;
    return this.users.has(key);
  }

  async existsByEmail(email: Email, tenantId: string, excludeId?: UserId): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.getTenantId() === tenantId && user.getEmail().equals(email)) {
        if (!excludeId || !user.getId().equals(excludeId)) {
          return true;
        }
      }
    }
    return false;
  }

  async existsByUsername(username: UserName, tenantId: string, excludeId?: UserId): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.getTenantId() === tenantId && user.getUsername().equals(username)) {
        if (!excludeId || !user.getId().equals(excludeId)) {
          return true;
        }
      }
    }
    return false;
  }

  async delete(id: UserId, tenantId: string): Promise<void> {
    const key = `${tenantId}:${id.getValue()}`;
    const user = this.users.get(key);
    if (user) {
      user.delete('Test deletion');
      this.users.set(key, user);
    }
  }

  async findActiveUsers(tenantId: string, options?: FindUsersOptions): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.getTenantId() === tenantId && user.getStatus().isActive()) {
        users.push(user);
      }
    }
    return this.applyOptions(users, options);
  }

  async findUsersByStatus(status: string, tenantId: string, options?: FindUsersOptions): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.getTenantId() === tenantId && user.getStatus().getValue() === status) {
        users.push(user);
      }
    }
    return this.applyOptions(users, options);
  }

  async count(tenantId: string, options?: CountUsersOptions): Promise<number> {
    let count = 0;
    for (const user of this.users.values()) {
      if (user.getTenantId() === tenantId) {
        if (options?.status && user.getStatus().getValue() !== options.status) {
          continue;
        }
        if (!options?.includeDeleted && user.getStatus().isDeleted()) {
          continue;
        }
        count++;
      }
    }
    return count;
  }

  async findUsersForTenant(tenantId: string, options?: FindUsersOptions): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.getTenantId() === tenantId) {
        if (!options?.includeDeleted && user.getStatus().isDeleted()) {
          continue;
        }
        users.push(user);
      }
    }
    return this.applyOptions(users, options);
  }

  private applyOptions(users: User[], options?: FindUsersOptions): User[] {
    let result = [...users];

    // 搜索过滤
    if (options?.search) {
      const search = options.search.toLowerCase();
      result = result.filter(user =>
        user.getEmail().getValue().toLowerCase().includes(search) ||
        user.getUsername().getValue().toLowerCase().includes(search)
      );
    }

    // 排序
    if (options?.sortBy) {
      result.sort((a, b) => {
        let aValue: any, bValue: any;
        switch (options.sortBy) {
          case 'createdAt':
            aValue = a.getCreatedAt().getTime();
            bValue = b.getCreatedAt().getTime();
            break;
          case 'updatedAt':
            aValue = a.getUpdatedAt().getTime();
            bValue = b.getUpdatedAt().getTime();
            break;
          case 'username':
            aValue = a.getUsername().getValue();
            bValue = b.getUsername().getValue();
            break;
          case 'email':
            aValue = a.getEmail().getValue();
            bValue = b.getEmail().getValue();
            break;
          default:
            return 0;
        }

        if (options.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // 分页
    if (options?.offset !== undefined) {
      result = result.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      result = result.slice(0, options.limit);
    }

    return result;
  }
}

describe('UserRepository Interface', () => {
  let repository: UserRepository;
  let testUser: User;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    repository = new MockUserRepository();
    testUser = User.create({
      email: new Email('test@example.com'),
      username: new UserName('testuser'),
      password: Password.create('ValidP@ssw0rd'),
      tenantId,
    });
  });

  describe('基本CRUD操作', () => {
    it('应该能够保存用户', async () => {
      const savedUser = await repository.save(testUser);
      expect(savedUser).toBe(testUser);
    });

    it('应该能够根据ID查找用户', async () => {
      await repository.save(testUser);
      const foundUser = await repository.findById(testUser.getId(), tenantId);
      expect(foundUser).toBe(testUser);
    });

    it('应该能够根据邮箱查找用户', async () => {
      await repository.save(testUser);
      const foundUser = await repository.findByEmail(testUser.getEmail(), tenantId);
      expect(foundUser).toBe(testUser);
    });

    it('应该能够根据用户名查找用户', async () => {
      await repository.save(testUser);
      const foundUser = await repository.findByUsername(testUser.getUsername(), tenantId);
      expect(foundUser).toBe(testUser);
    });

    it('应该能够根据邮箱或用户名查找用户', async () => {
      await repository.save(testUser);
      const foundByEmail = await repository.findByEmailOrUsername('test@example.com', tenantId);
      const foundByUsername = await repository.findByEmailOrUsername('testuser', tenantId);
      expect(foundByEmail).toBe(testUser);
      expect(foundByUsername).toBe(testUser);
    });

    it('应该能够检查用户是否存在', async () => {
      expect(await repository.exists(testUser.getId(), tenantId)).toBe(false);
      await repository.save(testUser);
      expect(await repository.exists(testUser.getId(), tenantId)).toBe(true);
    });

    it('应该能够删除用户', async () => {
      await repository.save(testUser);
      await repository.delete(testUser.getId(), tenantId);
      const foundUser = await repository.findById(testUser.getId(), tenantId);
      expect(foundUser?.getStatus().isDeleted()).toBe(true);
    });
  });

  describe('唯一性检查', () => {
    it('应该能够检查邮箱唯一性', async () => {
      expect(await repository.existsByEmail(testUser.getEmail(), tenantId)).toBe(false);
      await repository.save(testUser);
      expect(await repository.existsByEmail(testUser.getEmail(), tenantId)).toBe(true);
    });

    it('应该能够检查用户名唯一性', async () => {
      expect(await repository.existsByUsername(testUser.getUsername(), tenantId)).toBe(false);
      await repository.save(testUser);
      expect(await repository.existsByUsername(testUser.getUsername(), tenantId)).toBe(true);
    });

    it('应该支持排除特定用户ID的唯一性检查', async () => {
      await repository.save(testUser);
      const anotherUser = User.create({
        email: new Email('another@example.com'),
        username: new UserName('anotheruser'),
        password: Password.create('ValidP@ssw0rd'),
        tenantId,
      });
      await repository.save(anotherUser);

      // 检查邮箱唯一性时排除当前用户
      expect(await repository.existsByEmail(testUser.getEmail(), tenantId, testUser.getId())).toBe(false);
      expect(await repository.existsByEmail(testUser.getEmail(), tenantId, anotherUser.getId())).toBe(true);
    });
  });

  describe('查询操作', () => {
    beforeEach(async () => {
      // 创建多个测试用户
      const users = [
        User.create({
          email: new Email('user1@example.com'),
          username: new UserName('user1'),
          password: Password.create('ValidP@ssw0rd'),
          tenantId,
        }),
        User.create({
          email: new Email('user2@example.com'),
          username: new UserName('user2'),
          password: Password.create('ValidP@ssw0rd'),
          tenantId,
        }),
        User.create({
          email: new Email('user3@example.com'),
          username: new UserName('user3'),
          password: Password.create('ValidP@ssw0rd'),
          tenantId,
        }),
      ];

      for (const user of users) {
        user.activate();
        await repository.save(user);
      }
    });

    it('应该能够查找活跃用户', async () => {
      const activeUsers = await repository.findActiveUsers(tenantId);
      expect(activeUsers).toHaveLength(3);
      activeUsers.forEach(user => {
        expect(user.getStatus().isActive()).toBe(true);
      });
    });

    it('应该能够根据状态查找用户', async () => {
      const pendingUsers = await repository.findUsersByStatus('pending', tenantId);
      expect(pendingUsers).toHaveLength(0);

      const activeUsers = await repository.findUsersByStatus('active', tenantId);
      expect(activeUsers).toHaveLength(3);
    });

    it('应该能够统计用户数量', async () => {
      const count = await repository.count(tenantId);
      expect(count).toBe(3);
    });

    it('应该能够查找租户下的所有用户', async () => {
      const users = await repository.findUsersForTenant(tenantId);
      expect(users).toHaveLength(3);
    });
  });

  describe('查询选项', () => {
    beforeEach(async () => {
      const users = [
        User.create({
          email: new Email('alice@example.com'),
          username: new UserName('alice'),
          password: Password.create('ValidP@ssw0rd'),
          tenantId,
        }),
        User.create({
          email: new Email('bob@example.com'),
          username: new UserName('bob'),
          password: Password.create('ValidP@ssw0rd'),
          tenantId,
        }),
        User.create({
          email: new Email('charlie@example.com'),
          username: new UserName('charlie'),
          password: Password.create('ValidP@ssw0rd'),
          tenantId,
        }),
      ];

      for (const user of users) {
        user.activate();
        await repository.save(user);
      }
    });

    it('应该支持分页', async () => {
      const users = await repository.findActiveUsers(tenantId, { limit: 2, offset: 1 });
      expect(users).toHaveLength(2);
    });

    it('应该支持搜索', async () => {
      const users = await repository.findActiveUsers(tenantId, { search: 'alice' });
      expect(users).toHaveLength(1);
      expect(users[0].getUsername().getValue()).toBe('alice');
    });

    it('应该支持排序', async () => {
      const users = await repository.findActiveUsers(tenantId, {
        sortBy: 'username',
        sortOrder: 'asc'
      });
      expect(users[0].getUsername().getValue()).toBe('alice');
      expect(users[2].getUsername().getValue()).toBe('charlie');
    });

    it('应该支持包含已删除用户', async () => {
      const user = await repository.findById(
        (await repository.findActiveUsers(tenantId))[0].getId(),
        tenantId
      );
      if (user) {
        await repository.delete(user.getId(), tenantId);
      }

      const allUsers = await repository.findUsersForTenant(tenantId, { includeDeleted: true });
      expect(allUsers).toHaveLength(3);

      const activeUsers = await repository.findUsersForTenant(tenantId, { includeDeleted: false });
      expect(activeUsers).toHaveLength(2);
    });
  });

  describe('多租户隔离', () => {
    const tenant1 = 'tenant-1';
    const tenant2 = 'tenant-2';

    beforeEach(async () => {
      const user1 = User.create({
        email: new Email('user1@example.com'),
        username: new UserName('user1'),
        password: Password.create('ValidP@ssw0rd'),
        tenantId: tenant1,
      });
      const user2 = User.create({
        email: new Email('user2@example.com'),
        username: new UserName('user2'),
        password: Password.create('ValidP@ssw0rd'),
        tenantId: tenant2,
      });

      await repository.save(user1);
      await repository.save(user2);
    });

    it('应该正确隔离不同租户的用户', async () => {
      const tenant1Users = await repository.findUsersForTenant(tenant1);
      const tenant2Users = await repository.findUsersForTenant(tenant2);

      expect(tenant1Users).toHaveLength(1);
      expect(tenant2Users).toHaveLength(1);
      expect(tenant1Users[0].getTenantId()).toBe(tenant1);
      expect(tenant2Users[0].getTenantId()).toBe(tenant2);
    });

    it('应该正确隔离邮箱唯一性检查', async () => {
      const email = new Email('same@example.com');
      const user1 = User.create({
        email,
        username: new UserName('user1'),
        password: Password.create('ValidP@ssw0rd'),
        tenantId: tenant1,
      });
      const user2 = User.create({
        email,
        username: new UserName('user2'),
        password: Password.create('ValidP@ssw0rd'),
        tenantId: tenant2,
      });

      await repository.save(user1);
      await repository.save(user2);

      expect(await repository.existsByEmail(email, tenant1)).toBe(true);
      expect(await repository.existsByEmail(email, tenant2)).toBe(true);
    });
  });
});
