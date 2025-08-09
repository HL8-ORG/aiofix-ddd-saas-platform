/**
 * @class TenantSettingsDto
 * @description
 * 租户设置数据传输对象，用于API接口的数据传输。该DTO定义了租户设置
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
import { IsObject, IsDate, IsString } from 'class-validator'

/**
 * @class TenantSettingsDto
 * @description 租户设置DTO
 */
export class TenantSettingsDto {
  @Expose()
  @IsObject()
  settings: Record<string, unknown>

  @Expose()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date

  @Expose()
  @IsString()
  updatedBy: string

  /**
   * @method fromEntity
   * @description 从领域实体创建DTO
   * @param entity 租户设置实体
   * @returns TenantSettingsDto DTO对象
   * @static
   */
  static fromEntity(entity: any): TenantSettingsDto {
    const dto = new TenantSettingsDto()
    dto.settings = entity.settings || {}
    dto.updatedAt = entity.updatedAt
    dto.updatedBy = entity.updatedBy
    return dto
  }

  /**
   * @method toJSON
   * @description 转换为JSON对象
   * @returns object JSON对象
   */
  toJSON(): object {
    return {
      settings: this.settings,
      updatedAt: this.updatedAt,
      updatedBy: this.updatedBy,
    }
  }
}
