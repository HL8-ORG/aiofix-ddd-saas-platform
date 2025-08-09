/**
 * @class CreateTenantCommand
 * @description
 * 创建租户命令，实现CQRS模式中的命令模式。该命令包含创建租户所需的所有信息，
 * 通过命令总线传递给相应的命令处理器执行。
 * 
 * 主要原理与机制：
 * 1. 命令模式：将业务操作封装为命令对象，便于统一处理和追踪
 * 2. 数据验证：命令包含输入验证逻辑，确保数据完整性
 * 3. 业务规则：在命令中体现业务规则和约束
 * 4. 审计追踪：命令包含操作者信息，便于审计追踪
 * 5. 幂等性：命令设计支持幂等操作，避免重复执行
 */
import { IsString, IsEmail, IsOptional, IsObject, MinLength, MaxLength, Matches, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { generateUuid } from '@/shared/utils/uuid.util'

/**
 * @interface CreateTenantCommandData
 * @description 创建租户命令的数据结构
 */
export interface CreateTenantCommandData {
  /**
   * @property name
   * @description 租户名称
   */
  name: string

  /**
   * @property code
   * @description 租户编码
   */
  code: string

  /**
   * @property description
   * @description 租户描述
   */
  description?: string

  /**
   * @property adminUserInfo
   * @description 管理员用户信息
   */
  adminUserInfo: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
  }

  /**
   * @property settings
   * @description 租户初始设置
   */
  settings?: Record<string, unknown>

  /**
   * @property metadata
   * @description 租户元数据
   */
  metadata?: Record<string, unknown>

  /**
   * @property createdBy
   * @description 创建者ID
   */
  createdBy: string

  /**
   * @property requestId
   * @description 请求ID，用于追踪
   */
  requestId?: string
}

/**
 * @class AdminUserInfoDto
 * @description 管理员用户信息DTO
 */
export class AdminUserInfoDto {
  @IsString()
  @MinLength(3, { message: '用户名长度不能少于3个字符' })
  @MaxLength(50, { message: '用户名长度不能超过50个字符' })
  username: string

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string

  @IsString()
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  @MaxLength(100, { message: '密码长度不能超过100个字符' })
  password: string

  @IsString()
  @MinLength(1, { message: '名字不能为空' })
  @MaxLength(50, { message: '名字长度不能超过50个字符' })
  firstName: string

  @IsString()
  @MinLength(1, { message: '姓氏不能为空' })
  @MaxLength(50, { message: '姓氏长度不能超过50个字符' })
  lastName: string
}

/**
 * @class CreateTenantCommand
 * @description 创建租户命令
 */
export class CreateTenantCommand {
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
  readonly data: CreateTenantCommandData

  /**
   * @constructor
   * @description 构造函数
   * @param data 命令数据
   */
  constructor(data: CreateTenantCommandData) {
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
    return `CreateTenant_${generateUuid()}`
  }

  /**
   * @method validate
   * @description 验证命令数据
   * @returns boolean 验证结果
   */
  validate(): boolean {
    // 基本验证
    if (!this.data.name || this.data.name.trim().length === 0) {
      throw new Error('租户名称不能为空')
    }

    if (!this.data.code || this.data.code.trim().length === 0) {
      throw new Error('租户编码不能为空')
    }

    if (!this.data.adminUserInfo) {
      throw new Error('管理员用户信息不能为空')
    }

    if (!this.data.adminUserInfo.username || this.data.adminUserInfo.username.trim().length === 0) {
      throw new Error('管理员用户名不能为空')
    }

    if (!this.data.adminUserInfo.email || this.data.adminUserInfo.email.trim().length === 0) {
      throw new Error('管理员邮箱不能为空')
    }

    if (!this.data.adminUserInfo.password || this.data.adminUserInfo.password.length < 6) {
      throw new Error('管理员密码长度不能少于6个字符')
    }

    if (!this.data.createdBy || this.data.createdBy.trim().length === 0) {
      throw new Error('创建者ID不能为空')
    }

    // 业务规则验证
    if (this.data.name.length < 2) {
      throw new Error('租户名称长度不能少于2个字符')
    }

    if (this.data.name.length > 100) {
      throw new Error('租户名称长度不能超过100个字符')
    }

    if (this.data.code.length < 3) {
      throw new Error('租户编码长度不能少于3个字符')
    }

    if (this.data.code.length > 20) {
      throw new Error('租户编码长度不能超过20个字符')
    }

    // 编码格式验证
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(this.data.code)) {
      throw new Error('租户编码必须以字母开头，只能包含字母、数字和下划线')
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.data.adminUserInfo.email)) {
      throw new Error('管理员邮箱格式不正确')
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
    return `CreateTenantCommand(${this.data.name}, ${this.data.code})`
  }
}

/**
 * @class CreateTenantCommandDto
 * @description 创建租户命令的DTO类，用于API接口
 */
export class CreateTenantCommandDto {
  @IsString()
  @MinLength(2, { message: '租户名称长度不能少于2个字符' })
  @MaxLength(100, { message: '租户名称长度不能超过100个字符' })
  name: string

  @IsString()
  @MinLength(3, { message: '租户编码长度不能少于3个字符' })
  @MaxLength(20, { message: '租户编码长度不能超过20个字符' })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
    message: '租户编码必须以字母开头，只能包含字母、数字和下划线'
  })
  code: string

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '租户描述长度不能超过500个字符' })
  description?: string

  @ValidateNested()
  @Type(() => AdminUserInfoDto)
  adminUserInfo: AdminUserInfoDto

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>
}
