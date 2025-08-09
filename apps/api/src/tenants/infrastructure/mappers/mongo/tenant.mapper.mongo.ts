import { Tenant as TenantDomain } from '@/tenants/domain/entities/tenant.entity'
import { TenantName } from '@/tenants/domain/value-objects/tenant-name.vo'
import { TenantCode } from '@/tenants/domain/value-objects/tenant-code.vo'
import { ITenantMapper } from '../interfaces/tenant-mapper.interface'

/**
 * @interface TenantDocument
 * @description MongoDB文档接口，定义租户在MongoDB中的存储结构
 */
export interface TenantDocument {
  _id: string
  name: string
  code: string
  adminUserId: string
  description?: string
  status: string
  settings?: Record<string, any>
  createdBy?: string
  updatedBy?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
  version?: number
}

/**
 * @class TenantMapper
 * @description
 * MongoDB租户映射器，负责MongoDB文档和领域实体之间的转换。
 * 该映射器遵循单一职责原则，专门处理MongoDB的数据转换逻辑。
 * 
 * 主要原理与机制：
 * 1. 实现ITenantMapper接口，提供标准的映射方法
 * 2. 处理MongoDB特有的文档结构和字段
 * 3. 确保数据完整性和类型安全
 * 4. 支持批量转换操作
 * 5. 处理MongoDB的_id字段映射
 */
export class TenantMapper implements ITenantMapper<TenantDocument> {
  /**
   * @method toDomain
   * @description
   * 将MongoDB文档转换为领域实体。
   * 
   * @param {TenantDocument} document - MongoDB文档
   * @returns {TenantDomain} 领域实体
   */
  toDomain(document: TenantDocument): TenantDomain {
    const tenant = new TenantDomain(
      document._id,
      new TenantName(document.name),
      new TenantCode(document.code),
      document.adminUserId,
      document.description,
      document.settings,
    )

    // 设置BaseEntity的属性
    if (document.createdBy) {
      tenant.createdBy = document.createdBy
    }
    if (document.updatedBy) {
      tenant.updatedBy = document.updatedBy
    }
    if (document.createdAt) {
      tenant.createdAt = document.createdAt
    }
    if (document.updatedAt) {
      tenant.updatedAt = document.updatedAt
    }
    if (document.deletedAt) {
      tenant.deletedAt = document.deletedAt
    }
    if (document.version) {
      tenant.version = document.version
    }

    return tenant
  }

  /**
   * @method toEntity
   * @description
   * 将领域实体转换为MongoDB文档。
   * 
   * @param {TenantDomain} domain - 领域实体
   * @returns {TenantDocument} MongoDB文档
   */
  toEntity(domain: TenantDomain): TenantDocument {
    const document: TenantDocument = {
      _id: domain.id,
      name: domain.name.getValue(),
      code: domain.code.getValue(),
      adminUserId: domain.adminUserId,
      description: domain.description,
      status: domain.status,
      settings: domain.settings,
      createdBy: domain.createdBy,
      updatedBy: domain.updatedBy,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
      version: domain.version,
    }

    return document
  }

  /**
   * @method toDomainList
   * @description
   * 批量将MongoDB文档列表转换为领域实体列表。
   * 
   * @param {TenantDocument[]} documents - MongoDB文档列表
   * @returns {TenantDomain[]} 领域实体列表
   */
  toDomainList(documents: TenantDocument[]): TenantDomain[] {
    return documents.map(document => this.toDomain(document))
  }

  /**
   * @method toEntityList
   * @description
   * 批量将领域实体列表转换为MongoDB文档列表。
   * 
   * @param {TenantDomain[]} domains - 领域实体列表
   * @returns {TenantDocument[]} MongoDB文档列表
   */
  toEntityList(domains: TenantDomain[]): TenantDocument[] {
    return domains.map(domain => this.toEntity(domain))
  }
}
