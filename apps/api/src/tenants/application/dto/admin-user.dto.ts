/**
 * @class AdminUserDto
 * @description
 * 管理员用户数据传输对象，用于API接口的数据传输。该DTO定义了管理员用户
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
import { IsString, IsDate } from 'class-validator'

/**
 * @class AdminUserDto
 * @description 管理员用户DTO
 */
export class AdminUserDto {
  @Expose()
  @IsString()
  id: string

  @Expose()
  @IsString()
  username: string

  @Expose()
  @IsString()
  email: string

  @Expose()
  @IsString()
  firstName: string

  @Expose()
  @IsString()
  lastName: string

  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date

  @Expose()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date

  /**
   * @method fromEntity
   * @description 从领域实体创建DTO
   * @param entity 管理员用户实体
   * @returns AdminUserDto DTO对象
   * @static
   */
  static fromEntity(entity: any): AdminUserDto {
    const dto = new AdminUserDto()
    dto.id = entity.id
    dto.username = entity.username
    dto.email = entity.email
    dto.firstName = entity.firstName
    dto.lastName = entity.lastName
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt
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
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
