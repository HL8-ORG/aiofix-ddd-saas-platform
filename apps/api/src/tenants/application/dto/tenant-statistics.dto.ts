/**
 * @class TenantStatisticsDto
 * @description
 * 租户统计信息数据传输对象，用于API接口的数据传输。该DTO定义了租户统计
 * 在API层面的数据结构。
 * 
 * 主要原理与机制：
 * 1. 数据传输：定义API接口的数据结构，确保前后端数据一致性
 * 2. 数据转换：将领域实体转换为API可用的数据结构
 * 3. 数据过滤：只暴露必要的字段，保护敏感信息
 * 4. 版本控制：支持API版本演进，保持向后兼容
 * 5. 文档生成：配合Swagger等工具生成API文档
 */
import { Expose, Type } from 'class-transformer'
import { IsOptional, IsDate } from 'class-validator'

/**
 * @class TenantStatisticsDto
 * @description 租户统计信息DTO
 */
export class TenantStatisticsDto {
  @Expose()
  totalUsers: number

  @Expose()
  activeUsers: number

  @Expose()
  totalOrganizations: number

  @Expose()
  totalRoles: number

  @Expose()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLoginTime?: Date

  @Expose()
  @IsDate()
  @Type(() => Date)
  createdDate: Date

  /**
   * @method fromEntity
   * @description 从领域实体创建DTO
   * @param entity 租户统计实体
   * @returns TenantStatisticsDto DTO对象
   * @static
   */
  static fromEntity(entity: any): TenantStatisticsDto {
    const dto = new TenantStatisticsDto()
    dto.totalUsers = entity.totalUsers || 0
    dto.activeUsers = entity.activeUsers || 0
    dto.totalOrganizations = entity.totalOrganizations || 0
    dto.totalRoles = entity.totalRoles || 0
    dto.lastLoginTime = entity.lastLoginTime
    dto.createdDate = entity.createdDate
    return dto
  }

  /**
   * @method toJSON
   * @description 转换为JSON对象
   * @returns object JSON对象
   */
  toJSON(): object {
    return {
      totalUsers: this.totalUsers,
      activeUsers: this.activeUsers,
      totalOrganizations: this.totalOrganizations,
      totalRoles: this.totalRoles,
      lastLoginTime: this.lastLoginTime,
      createdDate: this.createdDate,
    }
  }
}
