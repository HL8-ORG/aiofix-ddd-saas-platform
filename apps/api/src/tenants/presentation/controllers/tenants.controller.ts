import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { CreateTenantHandler } from '../../application/handlers/create-tenant.handler'
import { GetTenantByIdHandler } from '../../application/handlers/get-tenant-by-id.handler'
import { ActivateTenantHandler } from '../../application/handlers/activate-tenant.handler'
import { SuspendTenantHandler } from '../../application/handlers/suspend-tenant.handler'
import { CreateTenantCommand } from '../../application/commands/create-tenant.command'
import { GetTenantByIdQuery } from '../../application/queries/get-tenant-by-id.query'
import { ActivateTenantCommand } from '../../application/commands/activate-tenant.command'
import { SuspendTenantCommand } from '../../application/commands/suspend-tenant.command'
import { TenantDto } from '../../application/dto/tenant.dto'

/**
 * @class TenantsController
 * @description
 * 租户控制器，提供租户管理的REST API接口。
 * 该控制器采用CQRS模式，通过命令和查询处理器处理业务逻辑。
 * 
 * 主要原理与机制：
 * 1. 使用@Controller装饰器定义控制器路由
 * 2. 通过依赖注入获取命令和查询处理器
 * 3. 使用@ApiTags等装饰器生成Swagger文档
 * 4. 实现RESTful API设计规范
 * 5. 提供完整的租户生命周期管理接口
 */
@ApiTags('租户管理')
@Controller('v1/tenants')
export class TenantsController {
  constructor(
    private readonly createTenantHandler: CreateTenantHandler,
    private readonly getTenantByIdHandler: GetTenantByIdHandler,
    private readonly activateTenantHandler: ActivateTenantHandler,
    private readonly suspendTenantHandler: SuspendTenantHandler,
  ) { }

  /**
   * @method create
   * @description 创建租户
   * @param createTenantDto {CreateTenantCommandDto} 创建租户数据
   * @returns {Promise<TenantDto>} 创建的租户信息
   */
  @Post()
  @ApiOperation({ summary: '创建租户' })
  @ApiResponse({ status: 201, description: '租户创建成功', type: TenantDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '租户名称或编码已存在' })
  async create(@Body() createTenantDto: any): Promise<TenantDto> {
    const command = new CreateTenantCommand(createTenantDto)
    const result = await this.createTenantHandler.execute(command)

    if (!result.success) {
      throw new Error(result.error)
    }

    // 根据tenantId重新获取完整的租户信息
    const query = new GetTenantByIdQuery({ tenantId: result.tenantId, requestedBy: 'system' })
    const tenantResult = await this.getTenantByIdHandler.execute(query)
    return tenantResult.tenant
  }

  /**
   * @method findById
   * @description 根据ID获取租户
   * @param id {string} 租户ID
   * @returns {Promise<TenantDto>} 租户信息
   */
  @Get(':id')
  @ApiOperation({ summary: '根据ID获取租户' })
  @ApiResponse({ status: 200, description: '获取成功', type: TenantDto })
  @ApiResponse({ status: 404, description: '租户不存在' })
  async findById(@Param('id') id: string): Promise<TenantDto> {
    const query = new GetTenantByIdQuery({ tenantId: id, requestedBy: 'system' })
    const result = await this.getTenantByIdHandler.execute(query)

    if (!result.success) {
      throw new Error(result.error)
    }

    return result.tenant
  }

  /**
   * @method activate
   * @description 激活租户
   * @param id {string} 租户ID
   * @param activateTenantDto {ActivateTenantCommandDto} 激活租户数据
   * @returns {Promise<TenantDto>} 激活后的租户信息
   */
  @Put(':id/activate')
  @ApiOperation({ summary: '激活租户' })
  @ApiResponse({ status: 200, description: '激活成功', type: TenantDto })
  @ApiResponse({ status: 404, description: '租户不存在' })
  @ApiResponse({ status: 400, description: '租户状态不允许激活' })
  async activate(
    @Param('id') id: string,
    @Body() activateTenantDto: any,
  ): Promise<TenantDto> {
    const command = new ActivateTenantCommand({
      tenantId: id,
      activatedBy: activateTenantDto.activatedBy,
    })
    const result = await this.activateTenantHandler.execute(command)

    if (!result.success) {
      throw new Error(result.error)
    }

    // 根据tenantId重新获取完整的租户信息
    const query = new GetTenantByIdQuery({ tenantId: result.tenantId, requestedBy: 'system' })
    const tenantResult = await this.getTenantByIdHandler.execute(query)
    return tenantResult.tenant
  }

  /**
   * @method suspend
   * @description 暂停租户
   * @param id {string} 租户ID
   * @param suspendTenantDto {SuspendTenantCommandDto} 暂停租户数据
   * @returns {Promise<TenantDto>} 暂停后的租户信息
   */
  @Put(':id/suspend')
  @ApiOperation({ summary: '暂停租户' })
  @ApiResponse({ status: 200, description: '暂停成功', type: TenantDto })
  @ApiResponse({ status: 404, description: '租户不存在' })
  @ApiResponse({ status: 400, description: '租户状态不允许暂停' })
  async suspend(
    @Param('id') id: string,
    @Body() suspendTenantDto: any,
  ): Promise<TenantDto> {
    const command = new SuspendTenantCommand({
      tenantId: id,
      suspendedBy: suspendTenantDto.suspendedBy,
      reason: suspendTenantDto.reason,
    })
    const result = await this.suspendTenantHandler.execute(command)

    if (!result.success) {
      throw new Error(result.error)
    }

    // 根据tenantId重新获取完整的租户信息
    const query = new GetTenantByIdQuery({ tenantId: result.tenantId, requestedBy: 'system' })
    const tenantResult = await this.getTenantByIdHandler.execute(query)
    return tenantResult.tenant
  }
}
