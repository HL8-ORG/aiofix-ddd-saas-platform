import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
} from '@nestjs/common'
import { generateUuid } from '../../../../../shared/domain/utils/uuid.util'
import { Tenant } from '../../domain/entities/tenant.entity'
import type { TenantRepository } from '../../domain/repositories/tenant.repository'

/**
 * @class CreateTenantUseCase
 * @description
 * 创建租户用例，实现租户创建的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理租户创建的业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) { }

  /**
   * @method execute
   * @description 执行创建租户用例
   *
   * @param createTenantData - 创建租户的数据
   * @returns 创建的租户实体
   */
  async execute(createTenantData: {
    name: string
    code: string
    adminUserId: string
    description?: string
    settings?: Record<string, any>
  }): Promise<Tenant> {
    const { name, code, adminUserId, description, settings } = createTenantData

    // 1. 验证租户编码是否已存在
    if (await this.tenantRepository.existsByCodeString(code)) {
      throw new ConflictException('租户编码已存在')
    }

    // 2. 验证租户名称是否已存在
    const existingTenants = await this.tenantRepository.findByName(name)
    if (existingTenants.length > 0) {
      throw new ConflictException('租户名称已存在')
    }

    // 3. 创建租户实体
    const tenant = new Tenant(
      generateUuid(),
      name,
      code,
      adminUserId,
      description,
      settings,
    )

    // 4. 保存到仓储
    return await this.tenantRepository.save(tenant)
  }
}
