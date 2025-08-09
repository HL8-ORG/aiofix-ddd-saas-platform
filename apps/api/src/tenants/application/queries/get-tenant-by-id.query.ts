/**
 * @class GetTenantByIdQuery
 * @description
 * 根据ID查询租户的查询对象，实现CQRS模式中的查询模式。该查询用于
 * 获取指定租户的详细信息，支持权限验证和数据隔离。
 * 
 * 主要原理与机制：
 * 1. 查询模式：将数据查询操作封装为查询对象，便于统一处理
 * 2. 权限验证：确保用户有权限访问指定租户的数据
 * 3. 数据隔离：确保多租户环境下的数据安全
 * 4. 缓存策略：支持查询结果的缓存，提升性能
 * 5. 审计日志：记录查询操作的审计信息
 */
import { IsString, MinLength } from 'class-validator'
import { generateUuid } from '@/shared/utils/uuid.util'

/**
 * @interface GetTenantByIdQueryData
 * @description 根据ID查询租户的数据结构
 */
export interface GetTenantByIdQueryData {
  /**
   * @property tenantId
   * @description 租户ID
   */
  tenantId: string

  /**
   * @property requestedBy
   * @description 请求者ID
   */
  requestedBy: string

  /**
   * @property includeAdminUser
   * @description 是否包含管理员用户信息
   */
  includeAdminUser?: boolean

  /**
   * @property includeSettings
   * @description 是否包含租户设置信息
   */
  includeSettings?: boolean

  /**
   * @property includeStatistics
   * @description 是否包含租户统计信息
   */
  includeStatistics?: boolean

  /**
   * @property requestId
   * @description 请求ID，用于追踪
   */
  requestId?: string
}

/**
 * @class GetTenantByIdQuery
 * @description 根据ID查询租户查询
 */
export class GetTenantByIdQuery {
  /**
   * @property queryId
   * @description 查询唯一标识
   */
  readonly queryId: string

  /**
   * @property timestamp
   * @description 查询创建时间
   */
  readonly timestamp: Date

  /**
   * @property data
   * @description 查询数据
   */
  readonly data: GetTenantByIdQueryData

  /**
   * @constructor
   * @description 构造函数
   * @param data 查询数据
   */
  constructor(data: GetTenantByIdQueryData) {
    this.queryId = this.generateQueryId()
    this.timestamp = new Date()
    this.data = data
  }

  /**
   * @method generateQueryId
   * @description 生成查询唯一标识
   * @returns string 查询ID
   * @private
   */
  private generateQueryId(): string {
    return `GetTenantById_${generateUuid()}`
  }

  /**
   * @method validate
   * @description 验证查询数据
   * @returns boolean 验证结果
   */
  validate(): boolean {
    // 基本验证
    if (!this.data.tenantId || this.data.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空')
    }

    if (!this.data.requestedBy || this.data.requestedBy.trim().length === 0) {
      throw new Error('请求者ID不能为空')
    }

    // 格式验证
    if (!/^[a-zA-Z0-9_-]+$/.test(this.data.tenantId)) {
      throw new Error('租户ID格式不正确')
    }

    return true
  }

  /**
   * @method toJSON
   * @description 将查询转换为JSON对象
   * @returns object JSON对象
   */
  toJSON(): object {
    return {
      queryId: this.queryId,
      timestamp: this.timestamp,
      data: this.data,
    }
  }

  /**
   * @method toString
   * @description 将查询转换为字符串
   * @returns string 字符串表示
   */
  toString(): string {
    return `GetTenantByIdQuery(${this.data.tenantId})`
  }
}

/**
 * @class GetTenantByIdQueryDto
 * @description 根据ID查询租户的DTO类，用于API接口
 */
export class GetTenantByIdQueryDto {
  @IsString()
  @MinLength(1, { message: '租户ID不能为空' })
  tenantId: string

  /**
   * @property includeAdminUser
   * @description 是否包含管理员用户信息
   */
  includeAdminUser?: boolean

  /**
   * @property includeSettings
   * @description 是否包含租户设置信息
   */
  includeSettings?: boolean

  /**
   * @property includeStatistics
   * @description 是否包含租户统计信息
   */
  includeStatistics?: boolean
}
