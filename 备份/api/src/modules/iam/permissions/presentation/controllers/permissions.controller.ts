import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'
import { CreatePermissionUseCase } from '../../application/use-cases/create-permission.use-case'
import { UpdatePermissionUseCase } from '../../application/use-cases/update-permission.use-case'
import { DeletePermissionUseCase } from '../../application/use-cases/delete-permission.use-case'
import { GetPermissionUseCase } from '../../application/use-cases/get-permission.use-case'
import { GetPermissionsUseCase } from '../../application/use-cases/get-permissions.use-case'
import { SearchPermissionsUseCase } from '../../application/use-cases/search-permissions.use-case'
import { CountPermissionsUseCase } from '../../application/use-cases/count-permissions.use-case'
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  QueryPermissionDto,
  PermissionResponseDto,
  PermissionListResponseDto,
} from '../dto'

/**
 * @controller PermissionsController
 * @description
 * 权限控制器，提供权限管理的REST API接口。
 * 
 * 主要原理与机制：
 * 1. 使用NestJS装饰器定义路由和HTTP方法
 * 2. 通过依赖注入获取应用层用例
 * 3. 使用DTO进行请求验证和响应格式化
 * 4. 提供完整的CRUD操作和查询功能
 * 5. 支持多租户架构，确保数据隔离
 * 6. 使用Swagger装饰器生成API文档
 */
@ApiTags('权限管理')
@Controller('v1/permissions')
export class PermissionsController {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
    private readonly getPermissionUseCase: GetPermissionUseCase,
    private readonly getPermissionsUseCase: GetPermissionsUseCase,
    private readonly searchPermissionsUseCase: SearchPermissionsUseCase,
    private readonly countPermissionsUseCase: CountPermissionsUseCase,
  ) { }

  /**
   * @method create
   * @description 创建权限
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建权限', description: '创建一个新的权限' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '权限创建成功',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '权限代码或名称已存在',
  })
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const permission = await this.createPermissionUseCase.execute({
      name: createPermissionDto.name,
      code: createPermissionDto.code,
      description: createPermissionDto.description,
      type: createPermissionDto.type,
      action: createPermissionDto.action,
      tenantId: createPermissionDto.tenantId,
      organizationId: createPermissionDto.organizationId,
      adminUserId: createPermissionDto.adminUserId,
      resource: createPermissionDto.resource,
      module: createPermissionDto.module,
      tags: createPermissionDto.tags,
      fields: createPermissionDto.fields,
      conditions: createPermissionDto.conditions,
      expiresAt: createPermissionDto.expiresAt,
      parentPermissionId: createPermissionDto.parentPermissionId,
    })

    return this.mapToResponseDto(permission)
  }

  /**
   * @method update
   * @description 更新权限
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新权限', description: '更新指定权限的信息' })
  @ApiParam({ name: 'id', description: '权限ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '权限更新成功',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '权限不存在',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数错误',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Query('tenantId') tenantId: string,
  ): Promise<PermissionResponseDto> {
    const permission = await this.updatePermissionUseCase.execute(id, updatePermissionDto, tenantId)
    return this.mapToResponseDto(permission)
  }

  /**
   * @method delete
   * @description 删除权限
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除权限', description: '软删除指定权限' })
  @ApiParam({ name: 'id', description: '权限ID' })
  @ApiQuery({ name: 'tenantId', description: '租户ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '权限删除成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '权限不存在',
  })
  async delete(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ): Promise<void> {
    await this.deletePermissionUseCase.execute(id, tenantId)
  }

  /**
   * @method findOne
   * @description 获取单个权限
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取权限', description: '根据ID获取权限详情' })
  @ApiParam({ name: 'id', description: '权限ID' })
  @ApiQuery({ name: 'tenantId', description: '租户ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取权限成功',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '权限不存在',
  })
  async findOne(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ): Promise<PermissionResponseDto> {
    const permission = await this.getPermissionUseCase.execute(id, tenantId)
    return this.mapToResponseDto(permission)
  }

  /**
   * @method findAll
   * @description 获取权限列表
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取权限列表', description: '分页获取权限列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取权限列表成功',
    type: PermissionListResponseDto,
  })
  async findAll(@Query() queryPermissionDto: QueryPermissionDto): Promise<PermissionListResponseDto> {
    const result = await this.getPermissionsUseCase.execute({
      tenantId: queryPermissionDto.tenantId,
      organizationId: queryPermissionDto.organizationId,
      page: queryPermissionDto.page,
      limit: queryPermissionDto.limit,
    })

    const totalPages = Math.ceil(result.total / queryPermissionDto.limit)
    const hasNext = queryPermissionDto.page < totalPages
    const hasPrev = queryPermissionDto.page > 1

    return {
      permissions: result.permissions.map(permission => this.mapToResponseDto(permission)),
      total: result.total,
      page: queryPermissionDto.page,
      limit: queryPermissionDto.limit,
      totalPages,
      hasNext,
      hasPrev,
    }
  }

  /**
   * @method search
   * @description 搜索权限
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '搜索权限', description: '根据关键词搜索权限' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '搜索权限成功',
    type: PermissionListResponseDto,
  })
  async search(@Query() queryPermissionDto: QueryPermissionDto): Promise<PermissionListResponseDto> {
    const permissions = await this.searchPermissionsUseCase.execute(
      queryPermissionDto.search!,
      queryPermissionDto.tenantId,
      queryPermissionDto.organizationId,
      queryPermissionDto.limit,
    )

    // 计算分页信息
    const total = permissions.length
    const totalPages = Math.ceil(total / queryPermissionDto.limit)
    const hasNext = queryPermissionDto.page < totalPages
    const hasPrev = queryPermissionDto.page > 1

    // 手动分页
    const startIndex = (queryPermissionDto.page - 1) * queryPermissionDto.limit
    const endIndex = startIndex + queryPermissionDto.limit
    const paginatedPermissions = permissions.slice(startIndex, endIndex)

    return {
      permissions: paginatedPermissions.map(permission => this.mapToResponseDto(permission)),
      total,
      page: queryPermissionDto.page,
      limit: queryPermissionDto.limit,
      totalPages,
      hasNext,
      hasPrev,
    }
  }

  /**
   * @method count
   * @description 统计权限数量
   */
  @Get('count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '统计权限数量', description: '统计指定条件的权限数量' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '统计成功',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
    },
  })
  async count(@Query() queryPermissionDto: QueryPermissionDto): Promise<{ count: number }> {
    const count = await this.countPermissionsUseCase.execute({
      tenantId: queryPermissionDto.tenantId,
      organizationId: queryPermissionDto.organizationId,
      type: queryPermissionDto.type,
      status: queryPermissionDto.status,
      action: queryPermissionDto.action,
      resource: queryPermissionDto.resource,
      module: queryPermissionDto.module,
      adminUserId: queryPermissionDto.adminUserId,
      parentPermissionId: queryPermissionDto.parentPermissionId,
      isSystemPermission: queryPermissionDto.isSystemPermission,
      isDefaultPermission: queryPermissionDto.isDefaultPermission,
    })

    return { count }
  }

  /**
   * @method mapToResponseDto
   * @description 将领域实体映射为响应DTO
   */
  private mapToResponseDto(permission: any): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.getName(),
      code: permission.getCode(),
      description: permission.getDescription(),
      type: permission.getType(),
      typeDisplayName: this.getTypeDisplayName(permission.getType()),
      action: permission.getAction(),
      actionDisplayName: this.getActionDisplayName(permission.getAction()),
      status: permission.getStatus(),
      statusDisplayName: this.getStatusDisplayName(permission.getStatus()),
      tenantId: permission.tenantId,
      organizationId: permission.organizationId,
      adminUserId: permission.adminUserId,
      roleIds: permission.getRoleIds(),
      isSystemPermission: permission.isSystemPermission,
      isDefaultPermission: permission.isDefaultPermission,
      resource: permission.getResource(),
      module: permission.getModule(),
      tags: permission.getTags(),
      fields: permission.getFields(),
      conditions: permission.getConditions(),
      expiresAt: permission.getExpiresAt(),
      parentPermissionId: permission.getParentPermissionId(),
      childPermissionIds: permission.getChildPermissionIds(),
      createdAt: permission.getCreatedAt(),
      updatedAt: permission.getUpdatedAt(),
      deletedAt: permission.getDeletedAt(),
    }
  }

  /**
   * @method getTypeDisplayName
   * @description 获取权限类型显示名称
   */
  private getTypeDisplayName(type: string): string {
    const typeMap: Record<string, string> = {
      api: 'API权限',
      menu: '菜单权限',
      button: '按钮权限',
      data: '数据权限',
      page: '页面权限',
    }
    return typeMap[type] || type
  }

  /**
   * @method getActionDisplayName
   * @description 获取权限操作显示名称
   */
  private getActionDisplayName(action: string): string {
    const actionMap: Record<string, string> = {
      create: '创建',
      read: '读取',
      update: '更新',
      delete: '删除',
      manage: '管理',
      approve: '审批',
      export: '导出',
      import: '导入',
    }
    return actionMap[action] || action
  }

  /**
   * @method getStatusDisplayName
   * @description 获取权限状态显示名称
   */
  private getStatusDisplayName(status: string): string {
    const statusMap: Record<string, string> = {
      active: '启用',
      inactive: '禁用',
      suspended: '暂停',
      expired: '过期',
    }
    return statusMap[status] || status
  }
} 