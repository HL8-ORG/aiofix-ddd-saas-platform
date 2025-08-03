import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TenantsService } from '../application/tenants.service';
import { Tenant } from '../domain/entities/tenant.entity';

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
      name: string;
      code: string;
      adminUserId: string;
      description?: string;
      settings?: Record<string, any>;
    }
  ): Promise<{ success: boolean; data: Tenant; message: string }> {
    const tenant = await this.tenantsService.createTenant(
      createTenantDto.name,
      createTenantDto.code,
      createTenantDto.adminUserId,
      createTenantDto.description,
      createTenantDto.settings
    );

    return {
      success: true,
      data: tenant,
      message: '租户创建成功',
    };
  }

  /**
   * @method getTenantById
   * @description 根据ID获取租户
   * @route GET /v1/tenants/:id
   */
  @Get(':id')
  @ApiOperation({ summary: '根据ID获取租户', description: '根据租户ID获取租户详细信息' })
  @ApiParam({ name: 'id', description: '租户ID' })
  @ApiResponse({ status: 200, description: '获取租户成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  async getTenantById(
    @Param('id') id: string
  ): Promise<{ success: boolean; data: Tenant; message: string }> {
    const tenant = await this.tenantsService.getTenantById(id);

    return {
      success: true,
      data: tenant,
      message: '获取租户成功',
    };
  }

  /**
   * @method getAllTenants
   * @description 获取所有租户
   * @route GET /v1/tenants
   */
  @Get()
  @ApiOperation({ summary: '获取所有租户', description: '获取所有租户的列表' })
  @ApiResponse({ status: 200, description: '获取租户列表成功' })
  async getAllTenants(): Promise<{ success: boolean; data: Tenant[]; message: string; total: number }> {
    const tenants = await this.tenantsService.getAllTenants();

    return {
      success: true,
      data: tenants,
      message: '获取租户列表成功',
      total: tenants.length,
    };
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
    @Param('id') id: string
  ): Promise<{ success: boolean; data: Tenant; message: string }> {
    const tenant = await this.tenantsService.activateTenant(id);

    return {
      success: true,
      data: tenant,
      message: '租户激活成功',
    };
  }

  /**
   * @method deleteTenant
   * @description 删除租户（软删除）
   * @route DELETE /v1/tenants/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除租户', description: '软删除租户（标记为已删除状态）' })
  @ApiParam({ name: 'id', description: '租户ID' })
  @ApiResponse({ status: 200, description: '租户删除成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  @ApiResponse({ status: 400, description: '租户无法删除' })
  async deleteTenant(
    @Param('id') id: string
  ): Promise<{ success: boolean; message: string }> {
    await this.tenantsService.deleteTenant(id);

    return {
      success: true,
      message: '租户删除成功',
    };
  }
} 