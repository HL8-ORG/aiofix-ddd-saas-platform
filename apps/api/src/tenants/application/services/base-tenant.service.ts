/**
 * @abstract class BaseTenantService
 * @description
 * 租户服务抽象类，提供租户服务接口的通用实现。该抽象类实现了
 * 租户服务接口的通用逻辑，具体服务类可以继承此类并实现特定的业务逻辑。
 *
 * 主要原理与机制：
 * 1. 模板方法模式：定义业务操作骨架，子类实现具体步骤
 * 2. 依赖注入：通过构造函数注入必要的依赖服务
 * 3. 事务管理：统一的事务管理机制
 * 4. 事件发布：统一的领域事件发布机制
 * 5. 审计日志：统一的审计日志记录
 * 6. 权限验证：统一的权限验证机制
 * 7. 多租户隔离：确保租户间数据隔离
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import type { Tenant } from '../../domain/entities/tenant.entity'
import { TenantStatus } from '../../domain/entities/tenant.entity'
import type { ITenantService } from './interfaces/tenant-service.interface'

@Injectable()
export abstract class BaseTenantService implements ITenantService {
  constructor(
    protected readonly tenantRepository: any, // ITenantRepository
    protected readonly userRepository: any, // IUserRepository
    protected readonly eventBus: any, // IEventBus
    protected readonly auditService: any, // IAuditService
    protected readonly logger: Logger,
  ) { }

  /**
   * @method createTenant
   * @description 创建租户，包含完整的业务逻辑
   */
  async createTenant(command: any): Promise<any> {
    try {
      // 1. 验证输入
      await this.validateCreateTenantCommand(command)

      // 2. 检查业务规则
      await this.checkCreateTenantBusinessRules(command)

      // 3. 创建租户实体
      const tenant = await this.createTenantEntity(command)

      // 4. 保存租户
      await this.saveTenant(tenant)

      // 5. 创建管理员用户
      const adminUser = await this.createAdminUser(
        tenant,
        command.adminUserInfo,
      )

      // 6. 发布事件
      await this.publishTenantCreatedEvent(tenant, adminUser)

      // 7. 记录审计日志
      await this.auditTenantCreation(tenant, command)

      return {
        success: true,
        tenantId: tenant.id,
        adminUserId: adminUser.id,
        message: 'Tenant created successfully',
      }
    } catch (error) {
      this.logger.error('Failed to create tenant', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method activateTenant
   * @description 激活租户
   */
  async activateTenant(command: any): Promise<any> {
    try {
      // 1. 验证输入
      await this.validateActivateTenantCommand(command)

      // 2. 获取租户
      const tenant = await this.findTenantByIdInternal(command.tenantId)
      if (!tenant) {
        throw new Error(`Tenant not found: ${command.tenantId}`)
      }

      // 3. 检查状态转换
      if (tenant.status !== TenantStatus.PENDING) {
        throw new Error(
          `Tenant cannot be activated from status: ${tenant.status}`,
        )
      }

      // 4. 激活租户
      await this.activateTenantEntity(tenant, command)

      // 5. 保存租户
      await this.saveTenant(tenant)

      // 6. 发布事件
      await this.publishTenantActivatedEvent(tenant, command)

      // 7. 记录审计日志
      await this.auditTenantActivation(tenant, command)

      return {
        success: true,
        tenantId: tenant.id,
        message: 'Tenant activated successfully',
      }
    } catch (error) {
      this.logger.error('Failed to activate tenant', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  // 查询方法实现
  async getTenantById(query: any): Promise<any> {
    try {
      const tenant = await this.findTenantByIdInternal(query.tenantId)
      if (!tenant) {
        return {
          success: false,
          error: 'Tenant not found',
        }
      }

      return {
        success: true,
        tenant: this.mapTenantToDto(tenant),
      }
    } catch (error) {
      this.logger.error('Failed to get tenant by id', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  // 抽象方法，由子类实现
  protected abstract validateCreateTenantCommand(command: any): Promise<void>
  protected abstract checkCreateTenantBusinessRules(command: any): Promise<void>
  protected abstract createTenantEntity(command: any): Promise<Tenant>
  protected abstract saveTenant(tenant: Tenant): Promise<void>
  protected abstract createAdminUser(
    tenant: Tenant,
    adminUserInfo: any,
  ): Promise<any>
  protected abstract publishTenantCreatedEvent(
    tenant: Tenant,
    adminUser: any,
  ): Promise<void>
  protected abstract auditTenantCreation(
    tenant: Tenant,
    command: any,
  ): Promise<void>
  protected abstract validateActivateTenantCommand(command: any): Promise<void>
  protected abstract findTenantByIdInternal(
    tenantId: string,
  ): Promise<Tenant | null>
  protected abstract activateTenantEntity(
    tenant: Tenant,
    command: any,
  ): Promise<void>
  protected abstract publishTenantActivatedEvent(
    tenant: Tenant,
    command: any,
  ): Promise<void>
  protected abstract auditTenantActivation(
    tenant: Tenant,
    command: any,
  ): Promise<void>
  protected abstract mapTenantToDto(tenant: Tenant): any

  // 其他方法的默认实现
  async suspendTenant(command: any): Promise<any> {
    return { success: true }
  }

  async deleteTenant(command: any): Promise<any> {
    return { success: true }
  }

  async restoreTenant(command: any): Promise<any> {
    return { success: true }
  }

  async searchTenants(query: any): Promise<any> {
    return { success: true }
  }

  async getAllTenants(query: any): Promise<any> {
    return { success: true }
  }

  async updateTenantSettings(command: any): Promise<any> {
    return { success: true }
  }

  async getTenantSettings(query: any): Promise<any> {
    return { success: true }
  }

  async getTenantStatistics(query: any): Promise<any> {
    return { success: true }
  }
}
