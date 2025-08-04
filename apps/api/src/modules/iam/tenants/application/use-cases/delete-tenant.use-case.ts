import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import type { Tenant } from '../../domain/entities/tenant.entity'
import type { TenantRepository } from '../../domain/repositories/tenant.repository'

/**
 * @class DeleteTenantUseCase
 * @description
 * 删除租户用例，实现租户删除的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理租户删除的业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class DeleteTenantUseCase {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) { }

  /**
   * @method execute
   * @description 软删除租户
   *
   * @param id - 租户ID
   * @returns 删除操作是否成功
   */
  async execute(id: string): Promise<boolean> {
    const tenant = await this.tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }

    tenant.markAsDeleted()
    await this.tenantRepository.save(tenant)
    return true
  }

  /**
   * @method executeHardDelete
   * @description 硬删除租户
   *
   * @param id - 租户ID
   * @returns 删除操作是否成功
   */
  async executeHardDelete(id: string): Promise<boolean> {
    const tenant = await this.tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }

    await this.tenantRepository.delete(id)
    return true
  }

  /**
   * @method executeRestore
   * @description 恢复已删除的租户
   *
   * @param id - 租户ID
   * @returns 恢复操作是否成功
   */
  async executeRestore(id: string): Promise<boolean> {
    const tenant = await this.tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }

    tenant.restore()
    await this.tenantRepository.save(tenant)
    return true
  }

  /**
   * @method executeBatchDelete
   * @description 批量软删除租户
   *
   * @param ids - 租户ID数组
   * @returns 批量删除结果
   */
  async executeBatchDelete(
    ids: string[],
  ): Promise<{ success: string[]; failed: string[] }> {
    const result = { success: [] as string[], failed: [] as string[] }

    for (const id of ids) {
      try {
        await this.execute(id)
        result.success.push(id)
      } catch (error) {
        result.failed.push(id)
      }
    }

    return result
  }

  /**
   * @method executeBatchHardDelete
   * @description 批量硬删除租户
   *
   * @param ids - 租户ID数组
   * @returns 批量删除结果
   */
  async executeBatchHardDelete(
    ids: string[],
  ): Promise<{ success: string[]; failed: string[] }> {
    const result = { success: [] as string[], failed: [] as string[] }

    for (const id of ids) {
      try {
        await this.executeHardDelete(id)
        result.success.push(id)
      } catch (error) {
        result.failed.push(id)
      }
    }

    return result
  }
}
