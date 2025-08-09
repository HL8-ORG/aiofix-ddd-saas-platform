import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import type { Tenant } from '../../domain/entities/tenant.entity'
import type { TenantRepository } from '../../domain/repositories/tenant.repository'
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object'

/**
 * @class UpdateTenantStatusUseCase
 * @description
 * 更新租户状态用例，实现租户状态更新的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理租户状态更新的业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class UpdateTenantStatusUseCase {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) { }

  /**
   * @method executeActivate
   * @description 激活租户
   *
   * @param id - 租户ID
   * @returns 激活后的租户实体
   */
  async executeActivate(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }

    tenant.activate()
    return await this.tenantRepository.save(tenant)
  }

  /**
   * @method executeSuspend
   * @description 禁用租户
   *
   * @param id - 租户ID
   * @param reason - 禁用原因
   * @returns 禁用后的租户实体
   */
  async executeSuspend(id: string, reason?: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }

    tenant.suspend()
    return await this.tenantRepository.save(tenant)
  }

  /**
   * @method executeUpdateStatus
   * @description 更新租户状态
   *
   * @param id - 租户ID
   * @param status - 新状态
   * @returns 更新后的租户实体
   */
  async executeUpdateStatus(id: string, status: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }

    const newStatus = TenantStatus[status.toUpperCase() as keyof typeof TenantStatus]
    if (!newStatus) {
      throw new Error('无效的租户状态')
    }

    // 根据状态执行相应的操作
    switch (newStatus) {
      case TenantStatus.ACTIVE:
        tenant.activate()
        break
      case TenantStatus.SUSPENDED:
        tenant.suspend()
        break
      case TenantStatus.DELETED:
        tenant.markAsDeleted()
        break
      default:
        throw new Error('不支持的状态更新操作')
    }

    return await this.tenantRepository.save(tenant)
  }
}
