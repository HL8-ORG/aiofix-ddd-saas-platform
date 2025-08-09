/**
 * @class ActivateTenantCommand
 * @description
 * 激活租户命令，实现CQRS模式中的命令模式。该命令用于将租户状态从PENDING
 * 转换为ACTIVE，表示租户可以正常使用系统。
 * 
 * 主要原理与机制：
 * 1. 状态转换：控制租户从待激活状态到激活状态的转换
 * 2. 权限验证：确保只有有权限的用户才能激活租户
 * 3. 审计追踪：记录激活操作的详细信息
 * 4. 事件发布：激活成功后发布相应的事件
 * 5. 业务规则：验证激活操作的业务规则
 */
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator'
import { generateUuid } from '@/shared/utils/uuid.util'

/**
 * @interface ActivateTenantCommandData
 * @description 激活租户命令的数据结构
 */
export interface ActivateTenantCommandData {
  /**
   * @property tenantId
   * @description 租户ID
   */
  tenantId: string

  /**
   * @property reason
   * @description 激活原因
   */
  reason?: string

  /**
   * @property activatedBy
   * @description 激活操作者ID
   */
  activatedBy: string

  /**
   * @property requestId
   * @description 请求ID，用于追踪
   */
  requestId?: string
}

/**
 * @class ActivateTenantCommand
 * @description 激活租户命令
 */
export class ActivateTenantCommand {
  /**
   * @property commandId
   * @description 命令唯一标识
   */
  readonly commandId: string

  /**
   * @property timestamp
   * @description 命令创建时间
   */
  readonly timestamp: Date

  /**
   * @property data
   * @description 命令数据
   */
  readonly data: ActivateTenantCommandData

  /**
   * @constructor
   * @description 构造函数
   * @param data 命令数据
   */
  constructor(data: ActivateTenantCommandData) {
    this.commandId = this.generateCommandId()
    this.timestamp = new Date()
    this.data = data
  }

  /**
   * @method generateCommandId
   * @description 生成命令唯一标识
   * @returns string 命令ID
   * @private
   */
  private generateCommandId(): string {
    return `ActivateTenant_${generateUuid()}`
  }

  /**
   * @method validate
   * @description 验证命令数据
   * @returns boolean 验证结果
   */
  validate(): boolean {
    // 基本验证
    if (!this.data.tenantId || this.data.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空')
    }

    if (!this.data.activatedBy || this.data.activatedBy.trim().length === 0) {
      throw new Error('激活操作者ID不能为空')
    }

    // 业务规则验证
    if (this.data.reason && this.data.reason.length > 500) {
      throw new Error('激活原因长度不能超过500个字符')
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
      timestamp: this.timestamp,
      data: this.data,
    }
  }

  /**
   * @method toString
   * @description 将命令转换为字符串
   * @returns string 字符串表示
   */
  toString(): string {
    return `ActivateTenantCommand(${this.data.tenantId})`
  }
}

/**
 * @class ActivateTenantCommandDto
 * @description 激活租户命令的DTO类，用于API接口
 */
export class ActivateTenantCommandDto {
  @IsString()
  @MinLength(1, { message: '租户ID不能为空' })
  tenantId: string

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '激活原因长度不能超过500个字符' })
  reason?: string
}
