import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import type { Tenant } from '../../domain/entities/tenant.entity'
import type { TenantRepository } from '../../domain/repositories/tenant.repository'

/**
 * @class UpdateTenantUseCase
 * @description
 * 更新租户用例，实现租户信息更新的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理租户更新的业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class UpdateTenantUseCase {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) { }

  /**
   * @method execute
   * @description 更新租户基本信息
   *
   * @param id - 租户ID
   * @param updateData - 更新数据
   * @returns 更新后的租户实体
   */
  async execute(
    id: string,
    updateData: {
      name?: string
      code?: string
      description?: string
    },
  ): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }

    tenant.updateInfo(
      updateData.name || tenant.getName(),
      updateData.code || tenant.getCode(),
      updateData.description,
    )
    return await this.tenantRepository.save(tenant)
  }

  /**
   * @method executeSettings
   * @description 更新租户设置
   *
   * @param id - 租户ID
   * @param settings - 新的设置
   * @returns 更新后的租户实体
   */
  async executeSettings(
    id: string,
    settings: Record<string, unknown>,
  ): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }

    tenant.updateSettings(settings)
    return await this.tenantRepository.save(tenant)
  }

  /**
   * @method executePartialSettings
   * @description 部分更新租户设置
   *
   * @param id - 租户ID
   * @param settings - 部分设置
   * @returns 更新后的租户实体
   */
  async executePartialSettings(
    id: string,
    settings: Record<string, unknown>,
  ): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }

    // 合并现有设置和新设置
    const currentSettings = tenant.settings || {}
    const mergedSettings = { ...currentSettings, ...settings }
    tenant.updateSettings(mergedSettings)
    return await this.tenantRepository.save(tenant)
  }
}
