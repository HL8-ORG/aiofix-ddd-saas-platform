import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator'
import { isValidUuidV4, generateUuid } from '@/shared/utils/uuid.util'
import { Type } from 'class-transformer'

/**
 * @class SuspendTenantCommandDto
 * @description 暂停租户命令的数据传输对象
 * 
 * 该DTO定义了暂停租户操作所需的输入数据结构，包括：
 * - tenantId: 要暂停的租户ID
 * - suspendedBy: 执行暂停操作的用户ID
 * - reason: 暂停原因（可选）
 * 
 * 主要原理与机制：
 * - 使用class-validator进行数据验证
 * - 使用class-transformer进行类型转换
 * - 提供清晰的字段约束和错误消息
 */
export class SuspendTenantCommandDto {
  @IsUUID('4', { message: '租户ID必须是有效的UUID格式' })
  @IsNotEmpty({ message: '租户ID不能为空' })
  tenantId!: string

  @IsUUID('4', { message: '暂停者ID必须是有效的UUID格式' })
  @IsNotEmpty({ message: '暂停者ID不能为空' })
  suspendedBy!: string

  @IsOptional()
  @IsString({ message: '暂停原因必须是字符串' })
  @MaxLength(500, { message: '暂停原因长度不能超过500个字符' })
  reason?: string
}

/**
 * @class SuspendTenantCommand
 * @description 暂停租户命令
 * 
 * 该命令封装了暂停租户的业务操作，包括：
 * 1. 命令数据的验证
 * 2. 命令ID的生成
 * 3. 命令状态的跟踪
 * 
 * 主要原理与机制：
 * - 遵循CQRS模式中的Command模式
 * - 包含完整的命令元数据
 * - 提供数据验证和转换功能
 * - 支持命令的序列化和反序列化
 */
export class SuspendTenantCommand {
  public readonly commandId: string
  public readonly timestamp: Date
  public readonly data: SuspendTenantCommandDto

  constructor(data: SuspendTenantCommandDto) {
    this.commandId = this.generateCommandId()
    this.timestamp = new Date()
    this.data = data
  }

  /**
   * @method validate
   * @description 验证命令数据
   * @returns boolean 验证是否通过
   */
  validate(): boolean {
    const errors: string[] = []

    // 验证租户ID
    if (!this.data.tenantId || this.data.tenantId.trim().length === 0) {
      errors.push('租户ID不能为空')
    } else if (!isValidUuidV4(this.data.tenantId)) {
      errors.push('租户ID必须是有效的UUID格式')
    }

    // 验证暂停者ID
    if (!this.data.suspendedBy || this.data.suspendedBy.trim().length === 0) {
      errors.push('暂停者ID不能为空')
    } else if (!isValidUuidV4(this.data.suspendedBy)) {
      errors.push('暂停者ID必须是有效的UUID格式')
    }

    // 验证暂停原因
    if (this.data.reason && this.data.reason.length > 500) {
      errors.push('暂停原因长度不能超过500个字符')
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '))
    }

    return true
  }

  /**
   * @method toJSON
   * @description 将命令转换为JSON对象
   * @returns object JSON对象
   */
  toJSON(): object {
    return {
      commandId: this.commandId,
      timestamp: this.timestamp.toISOString(),
      data: this.data,
    }
  }

  /**
   * @method toString
   * @description 将命令转换为字符串
   * @returns string 字符串表示
   */
  toString(): string {
    return `SuspendTenantCommand(${this.commandId}): ${this.data.tenantId} -> ${this.data.suspendedBy}`
  }

  /**
   * @method generateCommandId
   * @description 生成唯一的命令ID
   * @returns string 命令ID
   */
  private generateCommandId(): string {
    return `suspend-tenant-${generateUuid()}`
  }


}
