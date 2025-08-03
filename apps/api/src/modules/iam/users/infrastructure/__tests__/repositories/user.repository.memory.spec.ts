import { UserRepositoryMemory } from '../../repositories/user.repository.memory';
import { User } from '../../../domain/entities/user.entity';
import { UserStatusValue } from '../../../domain/value-objects/user-status.value-object';

/**
 * @description UserRepositoryMemory的单元测试
 */
describe('UserRepositoryMemory', () => {
  let repository: UserRepositoryMemory;

  beforeEach(() => {
    repository = new UserRepositoryMemory();
  });

  describe('save', () => {
    it('应该成功创建用户', async () => {
      // Arrange
      const user = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );

      // Act
      const result = await repository.save(user);

      // Assert
      expect(result).toBe(user);
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.username.toString()).toBe('john_doe');
      expect(result.email.toString()).toBe('john.doe@example.com');
    });

    it('应该处理重复用户名', async () => {
      // Arrange
      const user1 = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      const user2 = new User(
        '550e8400-e29b-41d4-a716-446655440003',
        'john_doe',
        'jane.doe@example.com',
        'Jane',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword456'
      );

      // Act
      await repository.save(user1);

      // Assert
      await expect(repository.save(user2)).rejects.toThrow('用户名已存在');
    });

    it('应该处理重复邮箱', async () => {
      // Arrange
      const user1 = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      const user2 = new User(
        '550e8400-e29b-41d4-a716-446655440003',
        'jane_doe',
        'john.doe@example.com',
        'Jane',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword456'
      );

      // Act
      await repository.save(user1);

      // Assert
      await expect(repository.save(user2)).rejects.toThrow('邮箱已存在');
    });
  });

  describe('findById', () => {
    it('应该根据ID找到用户', async () => {
      // Arrange
      const user = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      await repository.save(user);

      // Act
      const result = await repository.findById('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result?.username.toString()).toBe('john_doe');
    });

    it('应该返回null当用户不存在', async () => {
      // Act
      const result = await repository.findById('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByUsernameString', () => {
    it('应该根据用户名找到用户', async () => {
      // Arrange
      const user = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      await repository.save(user);

      // Act
      const result = await repository.findByUsernameString('john_doe', '550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toBeDefined();
      expect(result?.username.toString()).toBe('john_doe');
    });

    it('应该返回null当用户名不存在', async () => {
      // Act
      const result = await repository.findByUsernameString('nonexistent', '550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByEmailString', () => {
    it('应该根据邮箱找到用户', async () => {
      // Arrange
      const user = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      await repository.save(user);

      // Act
      const result = await repository.findByEmailString('john.doe@example.com', '550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toBeDefined();
      expect(result?.email.toString()).toBe('john.doe@example.com');
    });

    it('应该返回null当邮箱不存在', async () => {
      // Act
      const result = await repository.findByEmailString('nonexistent@example.com', '550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('应该返回所有用户', async () => {
      // Arrange
      const user1 = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      const user2 = new User(
        '550e8400-e29b-41d4-a716-446655440003',
        'jane_doe',
        'jane.doe@example.com',
        'Jane',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword456'
      );
      await repository.save(user1);
      await repository.save(user2);

      // Act
      const result = await repository.findAll('550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].username.toString()).toBe('john_doe');
      expect(result[1].username.toString()).toBe('jane_doe');
    });

    it('应该返回空数组当没有用户', async () => {
      // Act
      const result = await repository.findAll('550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('应该成功删除用户', async () => {
      // Arrange
      const user = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      await repository.save(user);

      // 激活用户，使其可以被删除
      await repository.updateStatus('550e8400-e29b-41d4-a716-446655440000', UserStatusValue.active(), '550e8400-e29b-41d4-a716-446655440001');

      // Act
      const result = await repository.delete('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toBe(true);
      const deletedUser = await repository.findById('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');
      expect(deletedUser).toBeNull();
    });

    it('应该返回false当用户不存在', async () => {
      // Act
      const result = await repository.delete('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('多租户支持', () => {
    it('应该支持多租户数据隔离', async () => {
      // Arrange
      const user1 = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001', // 租户1
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      const user2 = new User(
        '550e8400-e29b-41d4-a716-446655440003',
        'john_doe', // 相同用户名
        'jane.doe@example.com',
        'Jane',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440004', // 租户2
        '550e8400-e29b-41d4-a716-446655440005',
        'hashedPassword456'
      );

      // Act
      await repository.save(user1);
      await repository.save(user2);

      // Assert
      const allUsers = await repository.findAll('550e8400-e29b-41d4-a716-446655440001');
      expect(allUsers).toHaveLength(1);
      expect(allUsers[0].tenantId).toBe('550e8400-e29b-41d4-a716-446655440001');

      const allUsers2 = await repository.findAll('550e8400-e29b-41d4-a716-446655440004');
      expect(allUsers2).toHaveLength(1);
      expect(allUsers2[0].tenantId).toBe('550e8400-e29b-41d4-a716-446655440004');
    });

    it('应该在同一租户内验证用户名唯一性', async () => {
      // Arrange
      const user1 = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      const user2 = new User(
        '550e8400-e29b-41d4-a716-446655440003',
        'john_doe', // 相同用户名，相同租户
        'jane.doe@example.com',
        'Jane',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001', // 相同租户
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword456'
      );

      // Act
      await repository.save(user1);

      // Assert
      await expect(repository.save(user2)).rejects.toThrow('用户名已存在');
    });
  });
}); 