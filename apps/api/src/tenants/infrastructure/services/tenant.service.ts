import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { Tenant as TenantDomain } from '@/tenants/domain/entities/tenant.entity'
import { TenantName } from '@/tenants/domain/value-objects/tenant-name.vo'
import { TenantCode } from '@/tenants/domain/value-objects/tenant-code.vo'
import { TenantDomainService } from '@/tenants/domain/services/tenant-domain.service'
import { ITenantService, TENANT_SERVICE_TOKEN } from '@/tenants/application/services/interfaces/tenant-service.interface'
import { TenantRepository } from '../repositories/mikro/tenant.repository.mikro'
import { TenantDto } from '@/tenants/application/dto/tenant.dto'

/**
 * @class TenantService
 * @description
 * 租户服务实现，负责租户业务逻辑的协调和执行。
 * 该服务实现应用层定义的接口，协调领域服务和仓储操作。
 * 
 * 主要原理与机制：
 * 1. 实现ITenantService接口，提供完整的租户业务操作
 * 2. 使用TenantDomainService进行领域业务规则验证
 * 3. 通过TenantRepository进行数据持久化操作
 * 4. 协调命令和查询的处理流程
 * 5. 提供完整的租户生命周期管理
 */
@Injectable()
export class TenantService implements ITenantService {
  private readonly logger = new Logger(TenantService.name)

  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly tenantDomainService: TenantDomainService,
  ) { }

  /**
   * @method createTenant
   * @description 创建租户
   */
  async createTenant(command: any): Promise<any> {
    try {
      this.logger.log(`开始创建租户: ${command.name}`)

      // 验证租户名称和编码
      const tenantName = new TenantName(command.name)
      const tenantCode = new TenantCode(command.code)

      // 检查租户名称和编码是否已存在
      const existingByName = await this.tenantRepository.findByName(tenantName)
      if (existingByName) {
        return { success: false, error: '租户名称已存在' }
      }

      const existingByCode = await this.tenantRepository.findByCode(tenantCode)
      if (existingByCode) {
        return { success: false, error: '租户编码已存在' }
      }

      // 生成租户ID
      const tenantId = crypto.randomUUID()

      // 创建租户实体
      const tenant = new TenantDomain(
        tenantId,
        tenantName,
        tenantCode,
        command.adminUserInfo?.username || 'admin',
        command.description,
        command.settings,
      )

      // 验证租户实体
      tenant.validate()

      // 保存租户
      const savedTenant = await this.tenantRepository.save(tenant)

      this.logger.log(`租户创建成功: ${savedTenant.id}`)

      return {
        success: true,
        tenantId: savedTenant.id,
        adminUserId: command.adminUserInfo?.username || 'admin',
        message: '租户创建成功',
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.logger.error(`创建租户失败: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * @method activateTenant
   * @description 激活租户
   */
  async activateTenant(command: any): Promise<any> {
    try {
      this.logger.log(`开始激活租户: ${command.tenantId}`)

      // 查找租户
      const tenant = await this.tenantRepository.findById(command.tenantId)
      if (!tenant) {
        return { success: false, error: '租户不存在' }
      }

      // 激活租户
      tenant.activate(command.activatedBy)

      // 保存更新
      const updatedTenant = await this.tenantRepository.update(tenant)

      this.logger.log(`租户激活成功: ${updatedTenant.id}`)

      return {
        success: true,
        tenantId: updatedTenant.id,
        message: '租户激活成功',
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.logger.error(`激活租户失败: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * @method suspendTenant
   * @description 暂停租户
   */
  async suspendTenant(command: any): Promise<any> {
    try {
      this.logger.log(`开始暂停租户: ${command.tenantId}`)

      // 查找租户
      const tenant = await this.tenantRepository.findById(command.tenantId)
      if (!tenant) {
        return { success: false, error: '租户不存在' }
      }

      // 暂停租户
      tenant.suspend(command.suspendedBy)

      // 保存更新
      const updatedTenant = await this.tenantRepository.update(tenant)

      this.logger.log(`租户暂停成功: ${updatedTenant.id}`)

      return {
        success: true,
        tenantId: updatedTenant.id,
        message: '租户暂停成功',
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.logger.error(`暂停租户失败: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * @method getTenantById
   * @description 根据ID获取租户
   */
  async getTenantById(query: any): Promise<any> {
    try {
      this.logger.log(`查询租户: ${query.tenantId}`)

      const tenant = await this.tenantRepository.findById(query.tenantId)
      if (!tenant) {
        return { success: false, error: '租户不存在' }
      }

      return {
        success: true,
        tenant: TenantDto.fromEntity(tenant),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.logger.error(`查询租户失败: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * @method searchTenants
   * @description 搜索租户
   */
  async searchTenants(query: any): Promise<any> {
    try {
      this.logger.log(`搜索租户: ${JSON.stringify(query)}`)

      // 执行查询
      const tenants = await this.tenantRepository.findAll()

      // 过滤和分页
      let filteredTenants = tenants

      if (query.keyword) {
        filteredTenants = tenants.filter(tenant =>
          tenant.name.getValue().includes(query.keyword) ||
          tenant.code.getValue().includes(query.keyword)
        )
      }

      // 分页
      const page = query.page || 1
      const limit = query.size || 10
      const offset = (page - 1) * limit
      const paginatedTenants = filteredTenants.slice(offset, offset + limit)

      return {
        success: true,
        tenants: paginatedTenants.map(tenant => TenantDto.fromEntity(tenant)),
        pagination: {
          page,
          size: limit,
          total: filteredTenants.length,
          totalPages: Math.ceil(filteredTenants.length / limit),
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.logger.error(`搜索租户失败: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
  }

  // 实现接口要求的其他方法（简化实现）
  async deleteTenant(command: any): Promise<any> {
    return { success: false, error: '功能未实现' }
  }

  async restoreTenant(command: any): Promise<any> {
    return { success: false, error: '功能未实现' }
  }

  async getAllTenants(query: any): Promise<any> {
    return { success: false, error: '功能未实现' }
  }

  async updateTenantSettings(command: any): Promise<any> {
    return { success: false, error: '功能未实现' }
  }

  async getTenantSettings(query: any): Promise<any> {
    return { success: false, error: '功能未实现' }
  }

  async getTenantStatistics(query: any): Promise<any> {
    return { success: false, error: '功能未实现' }
  }
}

// 导出服务令牌
export { TENANT_SERVICE_TOKEN }
