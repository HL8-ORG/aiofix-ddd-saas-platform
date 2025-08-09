/**
 * @class TenantDto
 * @description
 * 租户数据传输对象，用于API接口的数据传输。该DTO定义了租户在API层面
 * 的数据结构，包括基本信息和关联数据。
 * 
 * 主要原理与机制：
 * 1. 数据传输：定义API接口的数据结构，确保前后端数据一致性
 * 2. 数据转换：将领域实体转换为API可用的数据结构
 * 3. 数据过滤：只暴露必要的字段，保护敏感信息
 * 4. 版本控制：支持API版本演进，保持向后兼容
 * 5. 文档生成：配合Swagger等工具生成API文档
 */
import { Expose, Type } from 'class-transformer'
import { IsString, IsOptional, IsDate, IsObject, IsEnum } from 'class-validator'
import { AdminUserDto } from './admin-user.dto'
import { TenantSettingsDto } from './tenant-settings.dto'
import { TenantStatisticsDto } from './tenant-statistics.dto'

/**
 * @enum TenantStatusDto
 * @description 租户状态枚举
 */
export enum TenantStatusDto {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

/**
 * @class TenantDto
 * @description 租户DTO
 */
export class TenantDto {
  @Expose()
  @IsString()
  id: string

  @Expose()
  @IsString()
  name: string

  @Expose()
  @IsString()
  code: string

  @Expose()
  @IsOptional()
  @IsString()
  description?: string

  @Expose()
  @IsEnum(TenantStatusDto)
  status: TenantStatusDto

  @Expose()
  @IsObject()
  settings: Record<string, unknown>

  @Expose()
  @IsString()
  adminUserId: string

  @Expose()
  @IsOptional()
  @Type(() => AdminUserDto)
  adminUser?: AdminUserDto

  @Expose()
  @IsOptional()
  @Type(() => TenantSettingsDto)
  tenantSettings?: TenantSettingsDto

  @Expose()
  @IsOptional()
  @Type(() => TenantStatisticsDto)
  statistics?: TenantStatisticsDto

  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date

  @Expose()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date

  @Expose()
  @IsString()
  createdBy: string

  @Expose()
  @IsString()
  updatedBy: string

  /**
   * @method fromEntity
   * @description 从领域实体创建DTO
   * @param entity 租户实体
   * @returns TenantDto DTO对象
   * @static
   */
  static fromEntity(entity: any): TenantDto {
    const dto = new TenantDto()
    dto.id = entity.id
    dto.name = entity.name
    dto.code = entity.code
    dto.description = entity.description
    dto.status = entity.status as TenantStatusDto
    dto.settings = entity.settings || {}
    dto.adminUserId = entity.adminUserId
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt
    dto.createdBy = entity.createdBy
    dto.updatedBy = entity.updatedBy

    // 如果有管理员用户信息
    if (entity.adminUser) {
      dto.adminUser = AdminUserDto.fromEntity(entity.adminUser)
    }

    // 如果有租户设置信息
    if (entity.tenantSettings) {
      dto.tenantSettings = TenantSettingsDto.fromEntity(entity.tenantSettings)
    }

    // 如果有统计信息
    if (entity.statistics) {
      dto.statistics = TenantStatisticsDto.fromEntity(entity.statistics)
    }

    return dto
  }

  /**
   * @method toJSON
   * @description 转换为JSON对象
   * @returns object JSON对象
   */
  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      status: this.status,
      settings: this.settings,
      adminUserId: this.adminUserId,
      adminUser: this.adminUser?.toJSON(),
      tenantSettings: this.tenantSettings?.toJSON(),
      statistics: this.statistics?.toJSON(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
    }
  }
}
