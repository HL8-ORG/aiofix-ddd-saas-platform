import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import type { Tenant } from '../../domain/entities/tenant.entity'
import type { TenantRepository } from '../../domain/repositories/tenant.repository'

/**
 * @class GetTenantUseCase
 * @description
 * 获取租户用例，实现租户信息获取的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理租户查询的业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class GetTenantUseCase {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) { }

  /**
   * @method execute
   * @description 根据ID获取租户
   *
   * @param id - 租户ID
   * @returns 租户实体
   */
  async execute(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }
    return tenant
  }

  /**
   * @method executeByCode
   * @description 根据编码获取租户
   *
   * @param code - 租户编码
   * @returns 租户实体
   */
  async executeByCode(code: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findByCodeString(code)
    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }
    return tenant
  }

  /**
   * @method executeByName
   * @description 根据名称获取租户列表
   *
   * @param name - 租户名称
   * @returns 租户实体列表
   */
  async executeByName(name: string): Promise<Tenant[]> {
    return await this.tenantRepository.findByName(name)
  }

  /**
   * @method executeByAdminUserId
   * @description 根据管理员用户ID获取租户列表
   *
   * @param adminUserId - 管理员用户ID
   * @returns 租户实体列表
   */
  async executeByAdminUserId(adminUserId: string): Promise<Tenant[]> {
    return await this.tenantRepository.findByAdminUserId(adminUserId)
  }
}
