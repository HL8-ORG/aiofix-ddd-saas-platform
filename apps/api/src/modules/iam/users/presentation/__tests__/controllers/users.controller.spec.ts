import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../controllers/users.controller';
import { UsersService } from '../../../application/users.service';
import { User } from '../../../domain/entities/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { PaginationQueryDto } from '../../dto/pagination.dto';
import { UserResponseDto } from '../../dto/user-response.dto';
import {
  ConflictException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';

/**
 * @test UsersController控制器测试
 * @description 测试用户控制器的HTTP接口和响应处理
 */
describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const mockService = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      getUserByUsername: jest.fn(),
      getUserByEmail: jest.fn(),
      getAllUsers: jest.fn(),
      getUsersWithPagination: jest.fn(),
      updateUserInfo: jest.fn(),
      activateUser: jest.fn(),
      suspendUser: jest.fn(),
      deleteUser: jest.fn(),
      restoreUser: jest.fn(),
      getUserStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    mockUsersService = module.get(UsersService);
  });

  describe('createUser', () => {
    it('应该成功创建用户', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        username: 'john_doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedPassword123',
        phone: '13800138000',
        displayName: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        organizationIds: ['550e8400-e29b-41d4-a716-446655440003'],
        roleIds: ['550e8400-e29b-41d4-a716-446655440004'],
      };

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

      mockUsersService.createUser.mockResolvedValue(user);

      // Act
      const result = await controller.createUser(createUserDto);

      // Assert
      expect(result).toEqual({
        success: true,
        data: expect.any(UserResponseDto),
        message: '用户创建成功',
      });
      expect(mockUsersService.createUser).toHaveBeenCalledWith(
        createUserDto.username,
        createUserDto.email,
        createUserDto.firstName,
        createUserDto.lastName,
        'default-tenant-id',
        'default-admin-id',
        createUserDto.password,
        createUserDto.phone,
        createUserDto.displayName,
        createUserDto.avatar,
        createUserDto.organizationIds,
        createUserDto.roleIds,
        createUserDto.preferences
      );
      expect(result.data).toBeInstanceOf(UserResponseDto);
    });

    it('应该处理创建用户时的冲突异常', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        username: 'existing_user',
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedPassword123',
      };

      mockUsersService.createUser.mockRejectedValue(new ConflictException('用户名已存在'));

      // Act & Assert
      await expect(controller.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getUserById', () => {
    it('应该成功获取用户', async () => {
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

      mockUsersService.getUserById.mockResolvedValue(user);

      // Act
      const result = await controller.getUserById('550e8400-e29b-41d4-a716-446655440000');

      // Assert
      expect(result).toEqual({
        success: true,
        data: expect.any(UserResponseDto),
        message: '获取用户成功',
      });
      expect(mockUsersService.getUserById).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', 'default-tenant-id');
      expect(result.data).toBeInstanceOf(UserResponseDto);
    });

    it('应该处理用户不存在的情况', async () => {
      // Arrange
      mockUsersService.getUserById.mockRejectedValue(new NotFoundException('用户不存在'));

      // Act & Assert
      await expect(controller.getUserById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserByUsername', () => {
    it('应该成功根据用户名获取用户', async () => {
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

      mockUsersService.getUserByUsername.mockResolvedValue(user);

      // Act
      const result = await controller.getUserByUsername('john_doe');

      // Assert
      expect(result).toEqual({
        success: true,
        data: expect.any(UserResponseDto),
        message: '获取用户成功',
      });
      expect(mockUsersService.getUserByUsername).toHaveBeenCalledWith('john_doe', 'default-tenant-id');
      expect(result.data).toBeInstanceOf(UserResponseDto);
    });

    it('应该处理用户名不存在的情况', async () => {
      // Arrange
      mockUsersService.getUserByUsername.mockRejectedValue(new NotFoundException('用户不存在'));

      // Act & Assert
      await expect(controller.getUserByUsername('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserByEmail', () => {
    it('应该成功根据邮箱获取用户', async () => {
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

      mockUsersService.getUserByEmail.mockResolvedValue(user);

      // Act
      const result = await controller.getUserByEmail('john.doe@example.com');

      // Assert
      expect(result).toEqual({
        success: true,
        data: expect.any(UserResponseDto),
        message: '获取用户成功',
      });
      expect(mockUsersService.getUserByEmail).toHaveBeenCalledWith('john.doe@example.com', 'default-tenant-id');
      expect(result.data).toBeInstanceOf(UserResponseDto);
    });

    it('应该处理邮箱不存在的情况', async () => {
      // Arrange
      mockUsersService.getUserByEmail.mockRejectedValue(new NotFoundException('用户不存在'));

      // Act & Assert
      await expect(controller.getUserByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('应该成功获取用户列表', async () => {
      // Arrange
      const paginationDto: PaginationQueryDto = {
        page: 1,
        limit: 10,
        search: 'john',
        status: 'ACTIVE',
      };

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

      const mockResult = {
        users: [user1, user2],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUsersService.getUsersWithPagination.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getAllUsers(paginationDto);

      // Assert
      expect(result).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.any(UserResponseDto),
          expect.any(UserResponseDto),
        ]),
        message: '获取用户列表成功',
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockUsersService.getUsersWithPagination).toHaveBeenCalledWith(
        'default-tenant-id',
        paginationDto.page,
        paginationDto.limit,
        {
          status: paginationDto.status,
          organizationId: paginationDto.organizationId,
          roleId: paginationDto.roleId,
          search: paginationDto.search,
        },
        {
          field: paginationDto.sortBy || 'createdAt',
          order: paginationDto.sortOrder || 'desc',
        }
      );
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(UserResponseDto);
      expect(result.data[1]).toBeInstanceOf(UserResponseDto);
    });
  });

  describe('updateUser', () => {
    it('应该成功更新用户信息', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        displayName: 'John Doe Updated',
        avatar: 'https://example.com/new-avatar.jpg',
        phone: '13900139000',
        organizationIds: ['550e8400-e29b-41d4-a716-446655440005'],
        roleIds: ['550e8400-e29b-41d4-a716-446655440006'],
      };

      const user = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John Updated',
        'Doe Updated',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );

      mockUsersService.updateUserInfo.mockResolvedValue(user);

      // Act
      const result = await controller.updateUser('550e8400-e29b-41d4-a716-446655440000', updateUserDto);

      // Assert
      expect(result).toEqual({
        success: true,
        data: expect.any(UserResponseDto),
        message: '用户更新成功',
      });
      expect(mockUsersService.updateUserInfo).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'default-tenant-id',
        updateUserDto.firstName,
        updateUserDto.lastName,
        updateUserDto.displayName,
        updateUserDto.avatar
      );
      expect(result.data).toBeInstanceOf(UserResponseDto);
    });

    it('应该处理用户不存在的情况', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        firstName: 'John Updated',
        lastName: 'Doe Updated',
      };

      mockUsersService.updateUserInfo.mockRejectedValue(new NotFoundException('用户不存在'));

      // Act & Assert
      await expect(controller.updateUser('non-existent-id', updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('activateUser', () => {
    it('应该成功激活用户', async () => {
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

      mockUsersService.activateUser.mockResolvedValue(user);

      // Act
      const result = await controller.activateUser('550e8400-e29b-41d4-a716-446655440000');

      // Assert
      expect(result).toEqual({
        success: true,
        data: expect.any(UserResponseDto),
        message: '用户激活成功',
      });
      expect(mockUsersService.activateUser).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', 'default-tenant-id');
      expect(result.data).toBeInstanceOf(UserResponseDto);
    });
  });

  describe('suspendUser', () => {
    it('应该成功暂停用户', async () => {
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

      mockUsersService.suspendUser.mockResolvedValue(user);

      // Act
      const result = await controller.suspendUser('550e8400-e29b-41d4-a716-446655440000');

      // Assert
      expect(result).toEqual({
        success: true,
        data: expect.any(UserResponseDto),
        message: '用户暂停成功',
      });
      expect(mockUsersService.suspendUser).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', 'default-tenant-id');
      expect(result.data).toBeInstanceOf(UserResponseDto);
    });
  });

  describe('deleteUser', () => {
    it('应该成功删除用户', async () => {
      // Arrange
      mockUsersService.deleteUser.mockResolvedValue(undefined);

      // Act
      const result = await controller.deleteUser('550e8400-e29b-41d4-a716-446655440000');

      // Assert
      expect(result).toEqual({
        success: true,
        message: '用户删除成功',
      });
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', 'default-tenant-id');
    });

    it('应该处理用户不存在的情况', async () => {
      // Arrange
      mockUsersService.deleteUser.mockRejectedValue(new NotFoundException('用户不存在'));

      // Act & Assert
      await expect(controller.deleteUser('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restoreUser', () => {
    it('应该成功恢复用户', async () => {
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

      mockUsersService.restoreUser.mockResolvedValue(user);

      // Act
      const result = await controller.restoreUser('550e8400-e29b-41d4-a716-446655440000');

      // Assert
      expect(result).toEqual({
        success: true,
        data: expect.any(UserResponseDto),
        message: '用户恢复成功',
      });
      expect(mockUsersService.restoreUser).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', 'default-tenant-id');
      expect(result.data).toBeInstanceOf(UserResponseDto);
    });
  });

  describe('getUserStats', () => {
    it('应该成功获取用户统计信息', async () => {
      // Arrange
      const mockStats = {
        total: 100,
        active: 80,
        pending: 15,
        suspended: 3,
        deleted: 2,
      };

      mockUsersService.getUserStats.mockResolvedValue(mockStats);

      // Act
      const result = await controller.getUserStats();

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockStats,
        message: '获取统计信息成功',
      });
      expect(mockUsersService.getUserStats).toHaveBeenCalledWith('default-tenant-id');
    });
  });
}); 