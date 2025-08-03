import { UserOrmEntity } from '../../entities/user.orm.entity';

/**
 * @description UserOrmEntity的单元测试
 */
describe('UserOrmEntity', () => {
  describe('基本属性', () => {
    it('应该正确创建ORM实体', () => {
      // Arrange & Act
      const ormEntity = new UserOrmEntity();
      ormEntity.id = '550e8400-e29b-41d4-a716-446655440000';
      ormEntity.username = 'john_doe';
      ormEntity.email = 'john.doe@example.com';
      ormEntity.firstName = 'John';
      ormEntity.lastName = 'Doe';
      ormEntity.status = 'ACTIVE';
      ormEntity.tenantId = '550e8400-e29b-41d4-a716-446655440001';
      ormEntity.adminUserId = '550e8400-e29b-41d4-a716-446655440002';
      ormEntity.passwordHash = 'hashedPassword123';

      // Assert
      expect(ormEntity.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(ormEntity.username).toBe('john_doe');
      expect(ormEntity.email).toBe('john.doe@example.com');
      expect(ormEntity.firstName).toBe('John');
      expect(ormEntity.lastName).toBe('Doe');
      expect(ormEntity.status).toBe('ACTIVE');
      expect(ormEntity.tenantId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(ormEntity.adminUserId).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(ormEntity.passwordHash).toBe('hashedPassword123');
    });
  });

  describe('属性设置', () => {
    it('应该正确设置所有属性', () => {
      // Arrange
      const ormEntity = createValidOrmEntity();

      // Assert
      expect(ormEntity.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(ormEntity.username).toBe('john_doe');
      expect(ormEntity.email).toBe('john.doe@example.com');
      expect(ormEntity.firstName).toBe('John');
      expect(ormEntity.lastName).toBe('Doe');
      expect(ormEntity.status).toBe('ACTIVE');
      expect(ormEntity.tenantId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(ormEntity.adminUserId).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(ormEntity.passwordHash).toBe('hashedPassword123');
      expect(ormEntity.phone).toBe('+8613800138000');
      expect(ormEntity.displayName).toBe('John Doe');
      expect(ormEntity.avatar).toBe('https://example.com/avatar.jpg');
      expect(ormEntity.organizationId).toBe('550e8400-e29b-41d4-a716-446655440003');
      expect(ormEntity.organizationIds).toEqual(['550e8400-e29b-41d4-a716-446655440003']);
      expect(ormEntity.roleIds).toEqual(['550e8400-e29b-41d4-a716-446655440004']);
      expect(ormEntity.lastLoginAt).toEqual(new Date('2024-01-15T10:30:00.000Z'));
      expect(ormEntity.loginAttempts).toBe(0);
      expect(ormEntity.lockedUntil).toBeNull();
      expect(ormEntity.emailVerified).toBe(false);
      expect(ormEntity.phoneVerified).toBe(false);
      expect(ormEntity.twoFactorEnabled).toBe(false);
      expect(ormEntity.twoFactorSecret).toBeNull();
      expect(ormEntity.preferences).toEqual({});
      expect(ormEntity.createdAt).toEqual(new Date('2024-01-15T09:00:00.000Z'));
      expect(ormEntity.updatedAt).toEqual(new Date('2024-01-15T10:30:00.000Z'));
      expect(ormEntity.deletedAt).toBeNull();
    });

    it('应该处理可选字段为空的情况', () => {
      // Arrange
      const ormEntity = new UserOrmEntity();
      ormEntity.id = '550e8400-e29b-41d4-a716-446655440000';
      ormEntity.username = 'john_doe';
      ormEntity.email = 'john.doe@example.com';
      ormEntity.firstName = 'John';
      ormEntity.lastName = 'Doe';
      ormEntity.status = 'ACTIVE';
      ormEntity.tenantId = '550e8400-e29b-41d4-a716-446655440001';
      ormEntity.adminUserId = '550e8400-e29b-41d4-a716-446655440002';
      ormEntity.passwordHash = 'hashedPassword123';
      ormEntity.phone = null;
      ormEntity.displayName = null;
      ormEntity.avatar = null;
      ormEntity.organizationId = null;
      ormEntity.organizationIds = null;
      ormEntity.roleIds = null;
      ormEntity.lastLoginAt = null;
      ormEntity.loginAttempts = 0;
      ormEntity.lockedUntil = null;
      ormEntity.emailVerified = false;
      ormEntity.phoneVerified = false;
      ormEntity.twoFactorEnabled = false;
      ormEntity.twoFactorSecret = null;
      ormEntity.preferences = null;
      ormEntity.createdAt = new Date('2024-01-15T09:00:00.000Z');
      ormEntity.updatedAt = new Date('2024-01-15T10:30:00.000Z');
      ormEntity.deletedAt = null;

      // Assert
      expect(ormEntity.phone).toBeNull();
      expect(ormEntity.displayName).toBeNull();
      expect(ormEntity.avatar).toBeNull();
      expect(ormEntity.organizationId).toBeNull();
      expect(ormEntity.organizationIds).toBeNull();
      expect(ormEntity.roleIds).toBeNull();
      expect(ormEntity.lastLoginAt).toBeNull();
      expect(ormEntity.lockedUntil).toBeNull();
      expect(ormEntity.twoFactorSecret).toBeNull();
      expect(ormEntity.preferences).toBeNull();
      expect(ormEntity.deletedAt).toBeNull();
    });
  });
});

/**
 * @description 创建有效的ORM实体用于测试
 */
function createValidOrmEntity(): UserOrmEntity {
  const ormEntity = new UserOrmEntity();
  ormEntity.id = '550e8400-e29b-41d4-a716-446655440000';
  ormEntity.username = 'john_doe';
  ormEntity.email = 'john.doe@example.com';
  ormEntity.firstName = 'John';
  ormEntity.lastName = 'Doe';
  ormEntity.status = 'ACTIVE';
  ormEntity.tenantId = '550e8400-e29b-41d4-a716-446655440001';
  ormEntity.adminUserId = '550e8400-e29b-41d4-a716-446655440002';
  ormEntity.passwordHash = 'hashedPassword123';
  ormEntity.phone = '+8613800138000';
  ormEntity.displayName = 'John Doe';
  ormEntity.avatar = 'https://example.com/avatar.jpg';
  ormEntity.organizationId = '550e8400-e29b-41d4-a716-446655440003';
  ormEntity.organizationIds = ['550e8400-e29b-41d4-a716-446655440003'];
  ormEntity.roleIds = ['550e8400-e29b-41d4-a716-446655440004'];
  ormEntity.lastLoginAt = new Date('2024-01-15T10:30:00.000Z');
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
  return ormEntity;
} 