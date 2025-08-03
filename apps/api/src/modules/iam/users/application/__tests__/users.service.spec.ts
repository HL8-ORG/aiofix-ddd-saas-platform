import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { UserStatusValue } from '../../domain/value-objects/user-status.value-object';
import { Username } from '../../domain/value-objects/username.value-object';
import { Email } from '../../domain/value-objects/email.value-object';
import { Phone } from '../../domain/value-objects/phone.value-object';
import { generateUuid } from '../../../../../shared/domain/utils/uuid.util';

/**
 * @description
 * 用户应用服务的单元测试。
 * 
 * 测试覆盖范围：
 * 1. 用户创建功能
 * 2. 用户查询功能
 * 3. 用户更新功能
 * 4. 用户状态管理
 * 5. 用户删除和恢复
 * 6. 错误处理
 * 7. 数据验证
 */
describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  /**
   * @description 创建测试用户数据
   */
  const createMockUser = (overrides: any = {}): User => {
    const defaultUser = {
      id: generateUuid(),
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      tenantId: 'tenant-123',
      adminUserId: 'admin-123',
      passwordHash: 'hashedPassword',
      phone: '+86-138-0013-8000',
      displayName: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      organizationIds: ['org-123'],
      roleIds: ['role-123'],
      loginAttempts: 0,
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      preferences: { theme: 'dark' },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    const user = new User(
      defaultUser.id,
      defaultUser.username,
      defaultUser.email,
      defaultUser.firstName,
      defaultUser.lastName,
      defaultUser.tenantId,
      defaultUser.adminUserId,
      defaultUser.passwordHash,
      defaultUser.phone,
      defaultUser.displayName,
      defaultUser.avatar,
      defaultUser.organizationIds,
      defaultUser.roleIds,
      defaultUser.preferences
    );

    // 设置状态（如果提供了自定义状态）
    if (overrides.status) {
      user.status = overrides.status;
    }

    return user;
  };

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUsernameString: jest.fn(),
      findByEmailString: jest.fn(),
      findByPhoneString: jest.fn(),
      findAll: jest.fn(),
      findActive: jest.fn(),
      existsByUsernameString: jest.fn(),
      existsByEmailString: jest.fn(),
      existsByPhoneString: jest.fn(),
      count: jest.fn(),
      countByStatus: jest.fn(),
      findWithPagination: jest.fn(),
      searchUsers: jest.fn(),
      getUsersWithPagination: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockUserRepository = module.get('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('应该成功创建用户', async () => {
      // Arrange
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        tenantId: 'tenant-123',
        adminUserId: 'admin-123',
        passwordHash: 'hashedPassword',
        phone: '+86-138-0013-8000',
        displayName: 'New User',
        avatar: 'https://example.com/avatar.jpg',
        organizationIds: ['org-123'],
        roleIds: ['role-123'],
        preferences: { theme: 'light' }
      };

      const expectedUser = createMockUser(userData);
      mockUserRepository.existsByUsernameString.mockResolvedValue(false);
      mockUserRepository.existsByEmailString.mockResolvedValue(false);
      mockUserRepository.existsByPhoneString.mockResolvedValue(false);
      mockUserRepository.save.mockResolvedValue(expectedUser);

      // Act
      const result = await service.createUser(
        userData.username,
        userData.email,
        userData.firstName,
        userData.lastName,
        userData.tenantId,
        userData.adminUserId,
        userData.passwordHash,
        userData.phone,
        userData.displayName,
        userData.avatar,
        userData.organizationIds,
        userData.roleIds,
        userData.preferences
      );

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.existsByUsernameString).toHaveBeenCalledWith(userData.username, userData.tenantId);
      expect(mockUserRepository.existsByEmailString).toHaveBeenCalledWith(userData.email, userData.tenantId);
      expect(mockUserRepository.existsByPhoneString).toHaveBeenCalledWith(userData.phone, userData.tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('当用户名已存在时应该抛出ConflictException', async () => {
      // Arrange
      mockUserRepository.existsByUsernameString.mockResolvedValue(true);

      // Act & Assert
      await expect(service.createUser(
        'existinguser',
        'test@example.com',
        'Test',
        'User',
        'tenant-123',
        'admin-123',
        'hashedPassword'
      )).rejects.toThrow(ConflictException);
    });

    it('当邮箱已存在时应该抛出ConflictException', async () => {
      // Arrange
      mockUserRepository.existsByUsernameString.mockResolvedValue(false);
      mockUserRepository.existsByEmailString.mockResolvedValue(true);

      // Act & Assert
      await expect(service.createUser(
        'newuser',
        'existing@example.com',
        'Test',
        'User',
        'tenant-123',
        'admin-123',
        'hashedPassword'
      )).rejects.toThrow(ConflictException);
    });

    it('当手机号已存在时应该抛出ConflictException', async () => {
      // Arrange
      mockUserRepository.existsByUsernameString.mockResolvedValue(false);
      mockUserRepository.existsByEmailString.mockResolvedValue(false);
      mockUserRepository.existsByPhoneString.mockResolvedValue(true);

      // Act & Assert
      await expect(service.createUser(
        'newuser',
        'test@example.com',
        'Test',
        'User',
        'tenant-123',
        'admin-123',
        'hashedPassword',
        '+86-138-0013-8000'
      )).rejects.toThrow(ConflictException);
    });
  });

  describe('getUserById', () => {
    it('应该成功获取用户', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const expectedUser = createMockUser({ id: userId, tenantId });
      mockUserRepository.findById.mockResolvedValue(expectedUser);

      // Act
      const result = await service.getUserById(userId, tenantId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
    });

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById('nonexistent', 'tenant-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserByUsername', () => {
    it('应该成功根据用户名获取用户', async () => {
      // Arrange
      const username = 'testuser';
      const tenantId = 'tenant-123';
      const expectedUser = createMockUser({ username, tenantId });
      mockUserRepository.findByUsernameString.mockResolvedValue(expectedUser);

      // Act
      const result = await service.getUserByUsername(username, tenantId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findByUsernameString).toHaveBeenCalledWith(username, tenantId);
    });

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockUserRepository.findByUsernameString.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserByUsername('nonexistent', 'tenant-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserByEmail', () => {
    it('应该成功根据邮箱获取用户', async () => {
      // Arrange
      const email = 'test@example.com';
      const tenantId = 'tenant-123';
      const expectedUser = createMockUser({ email, tenantId });
      mockUserRepository.findByEmailString.mockResolvedValue(expectedUser);

      // Act
      const result = await service.getUserByEmail(email, tenantId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findByEmailString).toHaveBeenCalledWith(email, tenantId);
    });

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockUserRepository.findByEmailString.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserByEmail('nonexistent@example.com', 'tenant-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('应该成功获取所有用户', async () => {
      // Arrange
      const tenantId = 'tenant-123';
      const expectedUsers = [
        createMockUser({ id: 'user-1', tenantId }),
        createMockUser({ id: 'user-2', tenantId }),
      ];
      mockUserRepository.findAll.mockResolvedValue(expectedUsers);

      // Act
      const result = await service.getAllUsers(tenantId);

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('getActiveUsers', () => {
    it('应该成功获取激活状态的用户', async () => {
      // Arrange
      const tenantId = 'tenant-123';
      const expectedUsers = [
        createMockUser({ id: 'user-1', tenantId, status: UserStatusValue.active() }),
        createMockUser({ id: 'user-2', tenantId, status: UserStatusValue.active() }),
      ];
      mockUserRepository.findActive.mockResolvedValue(expectedUsers);

      // Act
      const result = await service.getActiveUsers(tenantId);

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockUserRepository.findActive).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('activateUser', () => {
    it('应该成功激活用户', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const user = createMockUser({ id: userId, tenantId, status: UserStatusValue.pending() });
      const activatedUser = createMockUser({ id: userId, tenantId, status: UserStatusValue.active() });

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(activatedUser);

      // Act
      const result = await service.activateUser(userId, tenantId);

      // Assert
      expect(result).toEqual(activatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.activateUser('nonexistent', 'tenant-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('suspendUser', () => {
    it('应该成功禁用用户', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const user = createMockUser({ id: userId, tenantId });
      // 确保用户状态为激活状态
      user.status = UserStatusValue.active();
      const suspendedUser = createMockUser({ id: userId, tenantId });
      suspendedUser.status = UserStatusValue.suspended();

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(suspendedUser);

      // Act
      const result = await service.suspendUser(userId, tenantId);

      // Assert
      expect(result).toEqual(suspendedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateUserInfo', () => {
    it('应该成功更新用户信息', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const user = createMockUser({ id: userId, tenantId });
      const updatedUser = createMockUser({
        id: userId,
        tenantId,
        firstName: 'Updated',
        lastName: 'Name',
        displayName: 'Updated Name',
        avatar: 'https://example.com/new-avatar.jpg'
      });

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateUserInfo(
        userId,
        tenantId,
        'Updated',
        'Name',
        'Updated Name',
        'https://example.com/new-avatar.jpg'
      );

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateUserContactInfo', () => {
    it('应该成功更新用户联系信息', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const user = createMockUser({ id: userId, tenantId });
      const updatedUser = createMockUser({
        id: userId,
        tenantId,
        email: 'newemail@example.com',
        phone: '+86-139-0013-9000'
      });

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.existsByEmailString.mockResolvedValue(false);
      mockUserRepository.existsByPhoneString.mockResolvedValue(false);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateUserContactInfo(
        userId,
        tenantId,
        'newemail@example.com',
        '+86-139-0013-9000'
      );

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.existsByEmailString).toHaveBeenCalledWith('newemail@example.com', tenantId, userId);
      expect(mockUserRepository.existsByPhoneString).toHaveBeenCalledWith('+86-139-0013-9000', tenantId, userId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('当新邮箱已存在时应该抛出ConflictException', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const user = createMockUser({ id: userId, tenantId });

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.existsByEmailString.mockResolvedValue(true);

      // Act & Assert
      await expect(service.updateUserContactInfo(
        userId,
        tenantId,
        'existing@example.com',
        '+86-139-0013-9000'
      )).rejects.toThrow(ConflictException);
    });
  });

  describe('updateUserPassword', () => {
    it('应该成功更新用户密码', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const user = createMockUser({ id: userId, tenantId });
      const updatedUser = createMockUser({
        id: userId,
        tenantId,
        passwordHash: 'newHashedPassword'
      });

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateUserPassword(userId, tenantId, 'newHashedPassword');

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('应该成功删除用户', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const user = createMockUser({ id: userId, tenantId });
      // 确保用户状态为激活状态，可以删除
      user.status = UserStatusValue.active();

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(user);

      // Act
      const result = await service.deleteUser(userId, tenantId);

      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('restoreUser', () => {
    it('应该成功恢复用户', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const user = createMockUser({ id: userId, tenantId });
      // 确保用户状态为已删除状态，可以恢复
      user.status = UserStatusValue.deleted();
      const restoredUser = createMockUser({ id: userId, tenantId });
      restoredUser.status = UserStatusValue.suspended();

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(restoredUser);

      // Act
      const result = await service.restoreUser(userId, tenantId);

      // Assert
      expect(result).toEqual(restoredUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('assignUserToOrganization', () => {
    it('应该成功将用户分配到组织', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const organizationId = 'org-456';
      const user = createMockUser({ id: userId, tenantId });
      const updatedUser = createMockUser({
        id: userId,
        tenantId,
        organizationIds: ['org-123', organizationId]
      });

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.assignUserToOrganization(userId, tenantId, organizationId);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('removeUserFromOrganization', () => {
    it('应该成功从组织移除用户', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const organizationId = 'org-123';
      const user = createMockUser({ id: userId, tenantId, organizationIds: ['org-123', 'org-456'] });
      const updatedUser = createMockUser({
        id: userId,
        tenantId,
        organizationIds: ['org-456']
      });

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.removeUserFromOrganization(userId, tenantId, organizationId);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('assignRoleToUser', () => {
    it('应该成功为用户分配角色', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const roleId = 'role-456';
      const user = createMockUser({ id: userId, tenantId });
      const updatedUser = createMockUser({
        id: userId,
        tenantId,
        roleIds: ['role-123', roleId]
      });

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.assignRoleToUser(userId, tenantId, roleId);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('removeRoleFromUser', () => {
    it('应该成功移除用户角色', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantId = 'tenant-123';
      const roleId = 'role-123';
      const user = createMockUser({ id: userId, tenantId, roleIds: ['role-123', 'role-456'] });
      const updatedUser = createMockUser({
        id: userId,
        tenantId,
        roleIds: ['role-456']
      });

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.removeRoleFromUser(userId, tenantId, roleId);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('应该成功获取用户统计信息', async () => {
      // Arrange
      const tenantId = 'tenant-123';
      const expectedStats = {
        total: 100,
        active: 80,
        pending: 10,
        suspended: 5,
        deleted: 5
      };

      mockUserRepository.count.mockResolvedValue(expectedStats.total);
      mockUserRepository.countByStatus.mockResolvedValueOnce(expectedStats.active);
      mockUserRepository.countByStatus.mockResolvedValueOnce(expectedStats.pending);
      mockUserRepository.countByStatus.mockResolvedValueOnce(expectedStats.suspended);
      mockUserRepository.countByStatus.mockResolvedValueOnce(expectedStats.deleted);

      // Act
      const result = await service.getUserStats(tenantId);

      // Assert
      expect(result).toEqual(expectedStats);
      expect(mockUserRepository.count).toHaveBeenCalledWith(tenantId);
      expect(mockUserRepository.countByStatus).toHaveBeenCalledTimes(4);
    });
  });

  describe('searchUsers', () => {
    it('应该成功搜索用户', async () => {
      // Arrange
      const searchTerm = 'test';
      const tenantId = 'tenant-123';
      const page = 1;
      const limit = 10;
      const expectedResult = {
        users: [createMockUser({ tenantId })],
        total: 1,
        page,
        limit,
        totalPages: 1
      };

      mockUserRepository.findWithPagination.mockResolvedValue(expectedResult);

      // Act
      const result = await service.searchUsers(searchTerm, tenantId, page, limit);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockUserRepository.findWithPagination).toHaveBeenCalledWith(
        page,
        limit,
        tenantId,
        { search: searchTerm }
      );
    });
  });

  describe('getUsersWithPagination', () => {
    it('应该成功分页获取用户列表', async () => {
      // Arrange
      const tenantId = 'tenant-123';
      const page = 1;
      const limit = 10;
      const filters = {
        status: UserStatusValue.active(),
        organizationId: 'org-123',
        roleId: 'role-123',
        search: 'test'
      };
      const sort = {
        field: 'createdAt' as const,
        order: 'desc' as const
      };
      const expectedResult = {
        users: [createMockUser({ tenantId })],
        total: 1,
        page,
        limit,
        totalPages: 1
      };

      mockUserRepository.findWithPagination.mockResolvedValue(expectedResult);

      // Act
      const result = await service.getUsersWithPagination(tenantId, page, limit, filters, sort);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockUserRepository.findWithPagination).toHaveBeenCalledWith(
        page,
        limit,
        tenantId,
        filters,
        sort
      );
    });
  });
}); 