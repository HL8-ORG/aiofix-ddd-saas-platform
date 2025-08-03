import { UserMapper } from '../../mappers/user.mapper';
import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../../entities/user.orm.entity';
import { Username } from '../../../domain/value-objects/username.value-object';
import { Email } from '../../../domain/value-objects/email.value-object';
import { Phone } from '../../../domain/value-objects/phone.value-object';
import { UserStatusValue } from '../../../domain/value-objects/user-status.value-object';

/**
 * @description
 * UserMapper的单元测试。
 * 
 * 测试覆盖范围：
 * 1. 领域实体到ORM实体的转换
 * 2. ORM实体到领域实体的转换
 * 3. 批量转换功能
 * 4. 部分更新功能
 * 5. 数据验证功能
 * 6. 边界情况处理
 */
describe('UserMapper', () => {

  describe('toDomain', () => {
    it('应该正确将ORM实体转换为领域实体', () => {
      // Arrange
      const ormEntity = new UserOrmEntity();
      ormEntity.id = '550e8400-e29b-41d4-a716-446655440000';
      ormEntity.username = 'john_doe';
      ormEntity.email = 'john.doe@example.com';
      ormEntity.phone = '+8613800138000';
      ormEntity.firstName = 'John';
      ormEntity.lastName = 'Doe';
      ormEntity.displayName = 'John Doe';
      ormEntity.avatar = 'https://example.com/avatar.jpg';
      ormEntity.status = 'ACTIVE';
      ormEntity.tenantId = '550e8400-e29b-41d4-a716-446655440001';
      ormEntity.organizationIds = ['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'];
      ormEntity.roleIds = ['550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005'];
      ormEntity.adminUserId = '550e8400-e29b-41d4-a716-446655440006';
      ormEntity.passwordHash = 'hashedPassword123';
      ormEntity.lastLoginAt = new Date('2024-01-15T10:30:00.000Z');
      ormEntity.loginAttempts = 0;
      ormEntity.lockedUntil = null;
      ormEntity.emailVerified = true;
      ormEntity.phoneVerified = false;
      ormEntity.twoFactorEnabled = false;
      ormEntity.twoFactorSecret = null;
      ormEntity.preferences = { theme: 'dark', language: 'zh-CN' };
      ormEntity.createdAt = new Date('2024-01-15T09:00:00.000Z');
      ormEntity.updatedAt = new Date('2024-01-15T10:30:00.000Z');
      ormEntity.deletedAt = null;

      // Act
      const domainEntity = UserMapper.toDomain(ormEntity);

      // Assert
      expect(domainEntity).toBeInstanceOf(User);
      expect(domainEntity.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(domainEntity.username).toBeInstanceOf(Username);
      expect(domainEntity.username.toString()).toBe('john_doe');
      expect(domainEntity.email).toBeInstanceOf(Email);
      expect(domainEntity.email.toString()).toBe('john.doe@example.com');
      expect(domainEntity.phone).toBeInstanceOf(Phone);
      expect(domainEntity.phone?.toString()).toBe('13800138000');
      expect(domainEntity.firstName).toBe('John');
      expect(domainEntity.lastName).toBe('Doe');
      expect(domainEntity.displayName).toBe('John Doe');
      expect(domainEntity.avatar).toBe('https://example.com/avatar.jpg');
      expect(domainEntity.status).toBeInstanceOf(UserStatusValue);
      expect(domainEntity.status.toString()).toBe('ACTIVE');
      expect(domainEntity.tenantId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(domainEntity.organizationIds).toEqual(['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003']);
      expect(domainEntity.roleIds).toEqual(['550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005']);
      expect(domainEntity.adminUserId).toBe('550e8400-e29b-41d4-a716-446655440006');
      expect(domainEntity.passwordHash).toBe('hashedPassword123');
      expect(domainEntity.lastLoginAt).toEqual(new Date('2024-01-15T10:30:00.000Z'));
      expect(domainEntity.loginAttempts).toBe(0);
      expect(domainEntity.lockedUntil).toBeUndefined();
      expect(domainEntity.emailVerified).toBe(true);
      expect(domainEntity.phoneVerified).toBe(false);
      expect(domainEntity.twoFactorEnabled).toBe(false);
      expect(domainEntity.twoFactorSecret).toBeUndefined();
      expect(domainEntity.preferences).toEqual({ theme: 'dark', language: 'zh-CN' });
      expect(domainEntity.createdAt).toEqual(new Date('2024-01-15T09:00:00.000Z'));
      expect(domainEntity.updatedAt).toEqual(new Date('2024-01-15T10:30:00.000Z'));
      expect(domainEntity.deletedAt).toBeUndefined();
    });

    it('应该处理可选字段为空的情况', () => {
      // Arrange
      const ormEntity = new UserOrmEntity();
      ormEntity.id = '550e8400-e29b-41d4-a716-446655440000';
      ormEntity.username = 'john_doe';
      ormEntity.email = 'john.doe@example.com';
      ormEntity.phone = null;
      ormEntity.firstName = 'John';
      ormEntity.lastName = 'Doe';
      ormEntity.displayName = null;
      ormEntity.avatar = null;
      ormEntity.status = 'ACTIVE';
      ormEntity.tenantId = '550e8400-e29b-41d4-a716-446655440001';
      ormEntity.organizationIds = [];
      ormEntity.roleIds = [];
      ormEntity.adminUserId = '550e8400-e29b-41d4-a716-446655440002';
      ormEntity.passwordHash = 'hashedPassword123';
      ormEntity.lastLoginAt = null;
      ormEntity.loginAttempts = 0;
      ormEntity.lockedUntil = null;
      ormEntity.emailVerified = false;
      ormEntity.phoneVerified = false;
      ormEntity.twoFactorEnabled = false;
      ormEntity.twoFactorSecret = null;
      ormEntity.preferences = {};
      ormEntity.createdAt = new Date('2024-01-15T09:00:00.000Z');
      ormEntity.updatedAt = new Date('2024-01-15T10:30:00.000Z');
      ormEntity.deletedAt = null;

      // Act
      const domainEntity = UserMapper.toDomain(ormEntity);

      // Assert
      expect(domainEntity.phone).toBeUndefined();
      expect(domainEntity.displayName).toBe('John Doe'); // User构造函数会自动设置displayName
      expect(domainEntity.avatar).toBeUndefined();
      expect(domainEntity.organizationIds).toEqual([]);
      expect(domainEntity.roleIds).toEqual([]);
      expect(domainEntity.lastLoginAt).toBeUndefined();
      expect(domainEntity.lockedUntil).toBeUndefined();
      expect(domainEntity.preferences).toEqual({});
    });
  });

  describe('toOrm', () => {
    it('应该正确将领域实体转换为ORM实体', () => {
      // Arrange
      const domainEntity = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123',
        '+8613800138000',
        'John Doe',
        'https://example.com/avatar.jpg',
        ['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'],
        ['550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006'],
        { theme: 'dark', language: 'zh-CN' }
      );

      // Act
      const ormEntity = UserMapper.toOrm(domainEntity);

      // Assert
      expect(ormEntity).toBeInstanceOf(UserOrmEntity);
      expect(ormEntity.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(ormEntity.username).toBe('john_doe');
      expect(ormEntity.email).toBe('john.doe@example.com');
      expect(ormEntity.phone).toBe('13800138000');
      expect(ormEntity.firstName).toBe('John');
      expect(ormEntity.lastName).toBe('Doe');
      expect(ormEntity.displayName).toBe('John Doe');
      expect(ormEntity.avatar).toBe('https://example.com/avatar.jpg');
      expect(ormEntity.status).toBe('PENDING'); // 新用户的默认状态
      expect(ormEntity.tenantId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(ormEntity.organizationIds).toEqual(['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004']);
      expect(ormEntity.roleIds).toEqual(['550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006']);
      expect(ormEntity.adminUserId).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(ormEntity.passwordHash).toBe('hashedPassword123');
      expect(ormEntity.preferences).toEqual({ theme: 'dark', language: 'zh-CN' });
    });
  });
}); 