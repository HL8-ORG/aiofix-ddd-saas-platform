import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { Tenant } from '../domain/entities/tenant.entity';
import { TenantStatus } from '../domain/value-objects/tenant-status.value-object';
import { generateUuid } from '../../../shared/domain/utils/uuid.util';
import { TenantRepository } from '../domain/repositories/tenant.repository';

/**
 * @class TenantsService
 * @description
 * 租户应用服务，负责协调领域对象完成业务用例。
 * 这是应用层的核心服务，连接表现层和领域层。
 */
@Injectable()
export class TenantsService {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository
  ) { }

  /**
   * @method createTenant
   * @description 创建新租户
   */
  async createTenant(
    name: string,
    code: string,
    adminUserId: string,
    description?: string,
    settings?: Record<string, any>
  ): Promise<Tenant> {
    try {
      // 验证租户编码是否已存在
      if (await this.tenantRepository.existsByCodeString(code)) {
        throw new ConflictException('租户编码已存在');
      }

      // 创建租户实体
      const tenant = new Tenant(
        generateUuid(),
        name,
        code,
        adminUserId,
        description,
        settings
      );

      // 保存到仓储
      return await this.tenantRepository.save(tenant);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('创建租户失败: ' + (error as Error).message);
    }
  }

  /**
   * @method getTenantById
   * @description 根据ID获取租户
   */
  async getTenantById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('租户不存在');
    }
    return tenant;
  }

  /**
   * @method getTenantByCode
   * @description 根据编码获取租户
   */
  async getTenantByCode(code: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findByCodeString(code);
    if (!tenant) {
      throw new NotFoundException('租户不存在');
    }
    return tenant;
  }

  /**
   * @method getAllTenants
   * @description 获取所有租户
   */
  async getAllTenants(): Promise<Tenant[]> {
    return await this.tenantRepository.findAll();
  }

  /**
   * @method getActiveTenants
   * @description 获取所有激活状态的租户
   */
  async getActiveTenants(): Promise<Tenant[]> {
    return await this.tenantRepository.findActive();
  }

  /**
   * @method activateTenant
   * @description 激活租户
   */
  async activateTenant(id: string): Promise<Tenant> {
    const tenant = await this.getTenantById(id);

    try {
      tenant.activate();
      return await this.tenantRepository.save(tenant);
    } catch (error) {
      throw new BadRequestException('激活租户失败: ' + (error as Error).message);
    }
  }

  /**
   * @method suspendTenant
   * @description 禁用租户
   */
  async suspendTenant(id: string): Promise<Tenant> {
    const tenant = await this.getTenantById(id);

    try {
      tenant.suspend();
      return await this.tenantRepository.save(tenant);
    } catch (error) {
      throw new BadRequestException('禁用租户失败: ' + (error as Error).message);
    }
  }

  /**
   * @method updateTenantSettings
   * @description 更新租户配置
   */
  async updateTenantSettings(id: string, settings: Record<string, any>): Promise<Tenant> {
    const tenant = await this.getTenantById(id);

    tenant.updateSettings(settings);
    return await this.tenantRepository.save(tenant);
  }

  /**
   * @method deleteTenant
   * @description 删除租户（软删除）
   */
  async deleteTenant(id: string): Promise<boolean> {
    const tenant = await this.getTenantById(id);

    try {
      tenant.markAsDeleted();
      await this.tenantRepository.save(tenant);
      return true;
    } catch (error) {
      throw new BadRequestException('删除租户失败: ' + (error as Error).message);
    }
  }

  /**
   * @method getTenantStats
   * @description 获取租户统计信息
   */
  async getTenantStats() {
    const [total, active, pending, suspended, deleted] = await Promise.all([
      this.tenantRepository.count(),
      this.tenantRepository.countByStatus(TenantStatus.ACTIVE),
      this.tenantRepository.countByStatus(TenantStatus.PENDING),
      this.tenantRepository.countByStatus(TenantStatus.SUSPENDED),
      this.tenantRepository.countByStatus(TenantStatus.DELETED),
    ]);

    return {
      total,
      active,
      pending,
      suspended,
      deleted,
    };
  }
} 