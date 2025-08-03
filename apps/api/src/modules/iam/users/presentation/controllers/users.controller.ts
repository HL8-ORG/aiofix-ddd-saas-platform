import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../../application/users.service';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginationQueryDto } from '../dto/pagination.dto';
import { UserResponseDto } from '../dto/user-response.dto';

/**
 * @class UsersController
 * @description
 * 用户控制器，负责处理用户相关的HTTP请求和响应。
 * 这是表现层的核心组件，连接客户端和应用服务。
 * 
 * 主要功能：
 * 1. 用户CRUD操作
 * 2. 用户状态管理
 * 3. 用户搜索和分页
 * 4. 多租户支持
 */
@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * @method createUser
   * @description 创建新用户
   * @route POST /v1/users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建新用户', description: '创建一个新的用户账户' })
  @ApiResponse({ status: 201, description: '用户创建成功', type: UserResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async createUser(
    @Body() createUserDto: CreateUserDto
  ): Promise<{ success: boolean; data: UserResponseDto; message: string }> {
    // TODO: 从认证上下文获取tenantId和adminUserId
    const tenantId = 'default-tenant-id'; // 临时使用默认值
    const adminUserId = 'default-admin-id'; // 临时使用默认值

    // TODO: 在实际应用中，应该使用密码哈希服务
    const passwordHash = createUserDto.password; // 临时处理，实际应该哈希化

    const user = await this.usersService.createUser(
      createUserDto.username,
      createUserDto.email,
      createUserDto.firstName,
      createUserDto.lastName,
      tenantId,
      adminUserId,
      passwordHash,
      createUserDto.phone,
      createUserDto.displayName,
      createUserDto.avatar,
      createUserDto.organizationIds,
      createUserDto.roleIds,
      createUserDto.preferences
    );

    return {
      success: true,
      data: UserResponseDto.fromDomain(user),
      message: '用户创建成功',
    };
  }

  /**
   * @method getUserById
   * @description 根据ID获取用户
   * @route GET /v1/users/:id
   */
  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户', description: '根据用户ID获取用户详细信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取用户成功', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getUserById(
    @Param('id') id: string
  ): Promise<{ success: boolean; data: UserResponseDto; message: string }> {
    // TODO: 从认证上下文获取tenantId
    const tenantId = 'default-tenant-id'; // 临时使用默认值

    const user = await this.usersService.getUserById(id, tenantId);

    return {
      success: true,
      data: UserResponseDto.fromDomain(user),
      message: '获取用户成功',
    };
  }

  /**
   * @method getUserByUsername
   * @description 根据用户名获取用户
   * @route GET /v1/users/username/:username
   */
  @Get('username/:username')
  @ApiOperation({ summary: '根据用户名获取用户', description: '根据用户名获取用户详细信息' })
  @ApiParam({ name: 'username', description: '用户名' })
  @ApiResponse({ status: 200, description: '获取用户成功', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getUserByUsername(
    @Param('username') username: string
  ): Promise<{ success: boolean; data: UserResponseDto; message: string }> {
    // TODO: 从认证上下文获取tenantId
    const tenantId = 'default-tenant-id'; // 临时使用默认值

    const user = await this.usersService.getUserByUsername(username, tenantId);

    return {
      success: true,
      data: UserResponseDto.fromDomain(user),
      message: '获取用户成功',
    };
  }

  /**
   * @method getUserByEmail
   * @description 根据邮箱获取用户
   * @route GET /v1/users/email/:email
   */
  @Get('email/:email')
  @ApiOperation({ summary: '根据邮箱获取用户', description: '根据邮箱获取用户详细信息' })
  @ApiParam({ name: 'email', description: '邮箱地址' })
  @ApiResponse({ status: 200, description: '获取用户成功', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getUserByEmail(
    @Param('email') email: string
  ): Promise<{ success: boolean; data: UserResponseDto; message: string }> {
    // TODO: 从认证上下文获取tenantId
    const tenantId = 'default-tenant-id'; // 临时使用默认值

    const user = await this.usersService.getUserByEmail(email, tenantId);

    return {
      success: true,
      data: UserResponseDto.fromDomain(user),
      message: '获取用户成功',
    };
  }

  /**
   * @method getAllUsers
   * @description 获取所有用户（支持分页和搜索）
   * @route GET /v1/users
   */
  @Get()
  @ApiOperation({ summary: '获取所有用户', description: '获取所有用户的列表，支持分页和搜索' })
  @ApiQuery({ name: 'page', required: false, description: '页码', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', type: Number })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'status', required: false, description: '用户状态过滤' })
  @ApiResponse({ status: 200, description: '获取用户列表成功' })
  async getAllUsers(
    @Query() paginationDto: PaginationQueryDto
  ): Promise<{
    success: boolean;
    data: UserResponseDto[];
    message: string;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // TODO: 从认证上下文获取tenantId
    const tenantId = 'default-tenant-id'; // 临时使用默认值

    const result = await this.usersService.getUsersWithPagination(
      tenantId,
      paginationDto.page || 1,
      paginationDto.limit || 10,
      {
        status: paginationDto.status as any, // TODO: 需要正确的类型转换
        organizationId: paginationDto.organizationId,
        roleId: paginationDto.roleId,
        search: paginationDto.search,
      },
      {
        field: (paginationDto.sortBy || 'createdAt') as any, // TODO: 需要正确的类型转换
        order: paginationDto.sortOrder || 'desc',
      }
    );

    return {
      success: true,
      data: result.users.map(user => UserResponseDto.fromDomain(user)),
      message: '获取用户列表成功',
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * @method updateUser
   * @description 更新用户信息
   * @route PUT /v1/users/:id
   */
  @Put(':id')
  @ApiOperation({ summary: '更新用户信息', description: '更新指定用户的信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '用户更新成功', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<{ success: boolean; data: UserResponseDto; message: string }> {
    // TODO: 从认证上下文获取tenantId
    const tenantId = 'default-tenant-id'; // 临时使用默认值

    const user = await this.usersService.updateUserInfo(
      id,
      tenantId,
      updateUserDto.firstName,
      updateUserDto.lastName,
      updateUserDto.displayName,
      updateUserDto.avatar
    );

    return {
      success: true,
      data: UserResponseDto.fromDomain(user),
      message: '用户更新成功',
    };
  }

  /**
   * @method activateUser
   * @description 激活用户
   * @route PUT /v1/users/:id/activate
   */
  @Put(':id/activate')
  @ApiOperation({ summary: '激活用户', description: '激活指定用户账户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '用户激活成功', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async activateUser(
    @Param('id') id: string
  ): Promise<{ success: boolean; data: UserResponseDto; message: string }> {
    // TODO: 从认证上下文获取tenantId
    const tenantId = 'default-tenant-id'; // 临时使用默认值

    const user = await this.usersService.activateUser(id, tenantId);

    return {
      success: true,
      data: UserResponseDto.fromDomain(user),
      message: '用户激活成功',
    };
  }

  /**
   * @method suspendUser
   * @description 暂停用户
   * @route PUT /v1/users/:id/suspend
   */
  @Put(':id/suspend')
  @ApiOperation({ summary: '暂停用户', description: '暂停指定用户账户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '用户暂停成功', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async suspendUser(
    @Param('id') id: string
  ): Promise<{ success: boolean; data: UserResponseDto; message: string }> {
    // TODO: 从认证上下文获取tenantId
    const tenantId = 'default-tenant-id'; // 临时使用默认值

    const user = await this.usersService.suspendUser(id, tenantId);

    return {
      success: true,
      data: UserResponseDto.fromDomain(user),
      message: '用户暂停成功',
    };
  }

  /**
   * @method deleteUser
   * @description 删除用户（软删除）
   * @route DELETE /v1/users/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除用户', description: '软删除指定用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async deleteUser(
    @Param('id') id: string
  ): Promise<{ success: boolean; message: string }> {
    // TODO: 从认证上下文获取tenantId
    const tenantId = 'default-tenant-id'; // 临时使用默认值

    await this.usersService.deleteUser(id, tenantId);

    return {
      success: true,
      message: '用户删除成功',
    };
  }

  /**
   * @method restoreUser
   * @description 恢复用户
   * @route PUT /v1/users/:id/restore
   */
  @Put(':id/restore')
  @ApiOperation({ summary: '恢复用户', description: '恢复已删除的用户账户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '用户恢复成功', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async restoreUser(
    @Param('id') id: string
  ): Promise<{ success: boolean; data: UserResponseDto; message: string }> {
    // TODO: 从认证上下文获取tenantId
    const tenantId = 'default-tenant-id'; // 临时使用默认值

    const user = await this.usersService.restoreUser(id, tenantId);

    return {
      success: true,
      data: UserResponseDto.fromDomain(user),
      message: '用户恢复成功',
    };
  }

  /**
   * @method getUserStats
   * @description 获取用户统计信息
   * @route GET /v1/users/stats
   */
  @Get('stats')
  @ApiOperation({ summary: '获取用户统计信息', description: '获取用户相关的统计信息' })
  @ApiResponse({ status: 200, description: '获取统计信息成功' })
  async getUserStats(): Promise<{ success: boolean; data: any; message: string }> {
    // TODO: 从认证上下文获取tenantId
    const tenantId = 'default-tenant-id'; // 临时使用默认值

    const stats = await this.usersService.getUserStats(tenantId);

    return {
      success: true,
      data: stats,
      message: '获取统计信息成功',
    };
  }
} 