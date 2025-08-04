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
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger'
import { TenantsService } from '../application/tenants.service'
import type { Tenant } from '../domain/entities/tenant.entity'

/**
 * @class TenantsController
 * @description
 * 租户控制器，负责处理租户相关的HTTP请求和响应。
 * 这是表现层的核心组件，连接客户端和应用服务。
 */
@ApiTags('租户管理')
@Controller('v1/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  /**
   * @method createTenant
   * @description 创建新租户
   * @route POST /v1/tenants
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建新租户', description: '创建一个新的租户账户' })
  @ApiResponse({ status: 201, description: '租户创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '租户编码已存在' })
  async createTenant(
    @Body() createTenantDto: {
      name: string
      code: string
      adminUserId: string
      description?: string
      settings?: Record<string, any>
    },
  ): Promise<{ success: boolean; data: Tenant; message: string }> {
    const tenant = await this.tenantsService.createTenant(
      createTenantDto.name,
      createTenantDto.code,
      createTenantDto.adminUserId,
      createTenantDto.description,
      createTenantDto.settings,
    )

    return {
      success: true,
      data: tenant,
      message: '租户创建成功',
    }
  }

  /**
   * @method getTenantById
   * @description 根据ID获取租户
   * @route GET /v1/tenants/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取租户',
    description: '根据租户ID获取租户详细信息',
  })
  @ApiParam({ name: 'id', description: '租户ID' })
  @ApiResponse({ status: 200, description: '获取租户成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  async getTenantById(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: Tenant; message: string }> {
    const tenant = await this.tenantsService.getTenantById(id)

    return {
      success: true,
      data: tenant,
      message: '获取租户成功',
    }
  }

  /**
   * @method getTenantByCode
   * @description 根据编码获取租户
   * @route GET /v1/tenants/code/:code
   */
  @Get('code/:code')
  @ApiOperation({
    summary: '根据编码获取租户',
    description: '根据租户编码获取租户详细信息',
  })
  @ApiParam({ name: 'code', description: '租户编码' })
  @ApiResponse({ status: 200, description: '获取租户成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  async getTenantByCode(
    @Param('code') code: string,
  ): Promise<{ success: boolean; data: Tenant; message: string }> {
    const tenant = await this.tenantsService.getTenantByCode(code)

    return {
      success: true,
      data: tenant,
      message: '获取租户成功',
    }
  }

  /**
   * @method getAllTenants
   * @description 获取所有租户
   * @route GET /v1/tenants
   */
  @Get()
  @ApiOperation({ summary: '获取所有租户', description: '获取所有租户的列表' })
  @ApiResponse({ status: 200, description: '获取租户列表成功' })
  async getAllTenants(): Promise<{
    success: boolean
    data: Tenant[]
    message: string
    total: number
  }> {
    const tenants = await this.tenantsService.getAllTenants()

    return {
      success: true,
      data: tenants,
      message: '获取租户列表成功',
      total: tenants.length,
    }
  }

  /**
   * @method getActiveTenants
   * @description 获取激活状态的租户
   * @route GET /v1/tenants/active
   */
  @Get('active')
  @ApiOperation({ summary: '获取激活状态的租户', description: '获取所有激活状态的租户列表' })
  @ApiResponse({ status: 200, description: '获取激活租户列表成功' })
  async getActiveTenants(): Promise<{
    success: boolean
    data: Tenant[]
    message: string
    total: number
  }> {
    const tenants = await this.tenantsService.getActiveTenants()

    return {
      success: true,
      data: tenants,
      message: '获取激活租户列表成功',
      total: tenants.length,
    }
  }

  /**
   * @method getTenantsWithPagination
   * @description 分页获取租户列表
   * @route GET /v1/tenants/paginated
   */
  @Get('paginated')
  @ApiOperation({ summary: '分页获取租户列表', description: '支持分页、过滤和排序的租户列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', type: Number })
  @ApiQuery({ name: 'status', required: false, description: '状态过滤' })
  @ApiQuery({ name: 'adminUserId', required: false, description: '管理员用户ID过滤' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiResponse({ status: 200, description: '获取租户列表成功' })
  async getTenantsWithPagination(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('adminUserId') adminUserId?: string,
    @Query('search') search?: string,
  ): Promise<{
    success: boolean
    data: {
      tenants: Tenant[]
      total: number
      page: number
      limit: number
      totalPages: number
    }
    message: string
  }> {
    const filters = { status, adminUserId, search }
    const result = await this.tenantsService.getTenantsWithPagination(page, limit, filters)

    return {
      success: true,
      data: result,
      message: '获取租户列表成功',
    }
  }

  /**
   * @method activateTenant
   * @description 激活租户
   * @route PUT /v1/tenants/:id/activate
   */
  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '激活租户', description: '将租户状态改为激活' })
  @ApiParam({ name: 'id', description: '租户ID' })
  @ApiResponse({ status: 200, description: '租户激活成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  @ApiResponse({ status: 400, description: '租户无法激活' })
  async activateTenant(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: Tenant; message: string }> {
    const tenant = await this.tenantsService.activateTenant(id)

    return {
      success: true,
      data: tenant,
      message: '租户激活成功',
    }
  }

  /**
   * @method suspendTenant
   * @description 禁用租户
   * @route PUT /v1/tenants/:id/suspend
   */
  @Put(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '禁用租户', description: '将租户状态改为禁用' })
  @ApiParam({ name: 'id', description: '租户ID' })
  @ApiResponse({ status: 200, description: '租户禁用成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  @ApiResponse({ status: 400, description: '租户无法禁用' })
  async suspendTenant(
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ): Promise<{ success: boolean; data: Tenant; message: string }> {
    const tenant = await this.tenantsService.suspendTenant(id, body?.reason)

    return {
      success: true,
      data: tenant,
      message: '租户禁用成功',
    }
  }

  /**
   * @method updateTenantInfo
   * @description 更新租户基本信息
   * @route PUT /v1/tenants/:id/info
   */
  @Put(':id/info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新租户基本信息', description: '更新租户的名称、编码和描述' })
  @ApiParam({ name: 'id', description: '租户ID' })
  @ApiResponse({ status: 200, description: '租户信息更新成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  async updateTenantInfo(
    @Param('id') id: string,
    @Body() updateData: {
      name?: string
      code?: string
      description?: string
    },
  ): Promise<{ success: boolean; data: Tenant; message: string }> {
    const tenant = await this.tenantsService.updateTenantInfo(id, updateData)

    return {
      success: true,
      data: tenant,
      message: '租户信息更新成功',
    }
  }

  /**
   * @method updateTenantSettings
   * @description 更新租户设置
   * @route PUT /v1/tenants/:id/settings
   */
  @Put(':id/settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新租户设置', description: '更新租户的配置设置' })
  @ApiParam({ name: 'id', description: '租户ID' })
  @ApiResponse({ status: 200, description: '租户设置更新成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  async updateTenantSettings(
    @Param('id') id: string,
    @Body() settings: Record<string, any>,
  ): Promise<{ success: boolean; data: Tenant; message: string }> {
    const tenant = await this.tenantsService.updateTenantSettings(id, settings)

    return {
      success: true,
      data: tenant,
      message: '租户设置更新成功',
    }
  }

  /**
   * @method deleteTenant
   * @description 删除租户（软删除）
   * @route DELETE /v1/tenants/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除租户',
    description: '软删除租户（标记为已删除状态）',
  })
  @ApiParam({ name: 'id', description: '租户ID' })
  @ApiResponse({ status: 200, description: '租户删除成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  @ApiResponse({ status: 400, description: '租户无法删除' })
  async deleteTenant(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.tenantsService.deleteTenant(id)

    return {
      success: true,
      message: '租户删除成功',
    }
  }

  /**
   * @method hardDeleteTenant
   * @description 硬删除租户
   * @route DELETE /v1/tenants/:id/hard
   */
  @Delete(':id/hard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '硬删除租户',
    description: '永久删除租户（不可恢复）',
  })
  @ApiParam({ name: 'id', description: '租户ID' })
  @ApiResponse({ status: 200, description: '租户永久删除成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  async hardDeleteTenant(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.tenantsService.hardDeleteTenant(id)

    return {
      success: true,
      message: '租户永久删除成功',
    }
  }

  /**
   * @method restoreTenant
   * @description 恢复已删除的租户
   * @route PUT /v1/tenants/:id/restore
   */
  @Put(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '恢复租户',
    description: '恢复已删除的租户',
  })
  @ApiParam({ name: 'id', description: '租户ID' })
  @ApiResponse({ status: 200, description: '租户恢复成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  async restoreTenant(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.tenantsService.restoreTenant(id)

    return {
      success: true,
      message: '租户恢复成功',
    }
  }

  /**
   * @method searchTenants
   * @description 搜索租户
   * @route GET /v1/tenants/search
   */
  @Get('search')
  @ApiOperation({ summary: '搜索租户', description: '根据关键词搜索租户' })
  @ApiQuery({ name: 'q', required: true, description: '搜索关键词' })
  @ApiQuery({ name: 'limit', required: false, description: '结果数量限制', type: Number })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchTenants(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ): Promise<{
    success: boolean
    data: Tenant[]
    message: string
    total: number
  }> {
    const tenants = await this.tenantsService.searchTenants(query, limit)

    return {
      success: true,
      data: tenants,
      message: '搜索成功',
      total: tenants.length,
    }
  }

  /**
   * @method getTenantStatistics
   * @description 获取租户统计信息
   * @route GET /v1/tenants/statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: '获取租户统计信息', description: '获取租户相关的统计数据和指标' })
  @ApiResponse({ status: 200, description: '获取统计信息成功' })
  async getTenantStatistics(): Promise<{
    success: boolean
    data: any
    message: string
  }> {
    const statistics = await this.tenantsService.getTenantStatistics()

    return {
      success: true,
      data: statistics,
      message: '获取统计信息成功',
    }
  }

  /**
   * @method getTenantGrowthRate
   * @description 获取租户增长率
   * @route GET /v1/tenants/statistics/growth
   */
  @Get('statistics/growth')
  @ApiOperation({ summary: '获取租户增长率', description: '获取租户增长率统计' })
  @ApiResponse({ status: 200, description: '获取增长率成功' })
  async getTenantGrowthRate(): Promise<{
    success: boolean
    data: any
    message: string
  }> {
    const growthRate = await this.tenantsService.getTenantGrowthRate()

    return {
      success: true,
      data: growthRate,
      message: '获取增长率成功',
    }
  }

  /**
   * @method getTenantActivityStats
   * @description 获取租户活跃度统计
   * @route GET /v1/tenants/statistics/activity
   */
  @Get('statistics/activity')
  @ApiOperation({ summary: '获取租户活跃度统计', description: '获取租户活跃度相关统计' })
  @ApiResponse({ status: 200, description: '获取活跃度统计成功' })
  async getTenantActivityStats(): Promise<{
    success: boolean
    data: any
    message: string
  }> {
    const activityStats = await this.tenantsService.getTenantActivityStats()

    return {
      success: true,
      data: activityStats,
      message: '获取活跃度统计成功',
    }
  }
}
