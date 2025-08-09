/**
 * @class RegisterUserCommand
 * @description
 * 用户注册命令，实现CQRS模式中的命令部分。该命令封装了用户注册所需的所有数据，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，提高系统性能和可维护性
 * 2. 命令模式：封装请求为对象，支持参数化、队列化、日志化等操作
 * 3. 数据验证：在命令层面进行基础数据验证
 * 4. 事件溯源：命令执行后会产生领域事件，用于事件溯源
 */
import { IsEmail, IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator'

export class RegisterUserCommand {
  @IsEmail({}, { message: '邮箱格式不正确' })
  readonly email: string

  @IsString({ message: '用户名不能为空' })
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(50, { message: '用户名最多50个字符' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: '用户名只能包含字母、数字、下划线和连字符' })
  readonly username: string

  @IsString({ message: '密码不能为空' })
  @MinLength(8, { message: '密码至少8个字符' })
  @MaxLength(128, { message: '密码最多128个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '密码必须包含大小写字母、数字和特殊字符',
  })
  readonly password: string

  @IsString({ message: '租户ID不能为空' })
  readonly tenantId: string

  @IsOptional()
  @IsString({ message: '手机号格式不正确' })
  readonly phoneNumber?: string

  @IsOptional()
  @IsString({ message: '名字不能为空' })
  @MaxLength(50, { message: '名字最多50个字符' })
  readonly firstName?: string

  @IsOptional()
  @IsString({ message: '姓氏不能为空' })
  @MaxLength(50, { message: '姓氏最多50个字符' })
  readonly lastName?: string

  readonly deviceInfo: {
    userAgent: string
    ipAddress: string
    deviceType?: string
    browser?: string
    os?: string
  }

  readonly locationInfo?: {
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
  }

  constructor(
    email: string,
    username: string,
    password: string,
    tenantId: string,
    deviceInfo: {
      userAgent: string
      ipAddress: string
      deviceType?: string
      browser?: string
      os?: string
    },
    phoneNumber?: string,
    firstName?: string,
    lastName?: string,
    locationInfo?: {
      country?: string
      region?: string
      city?: string
      latitude?: number
      longitude?: number
    },
  ) {
    this.email = email
    this.username = username
    this.password = password
    this.tenantId = tenantId
    this.deviceInfo = deviceInfo
    this.phoneNumber = phoneNumber
    this.firstName = firstName
    this.lastName = lastName
    this.locationInfo = locationInfo
  }

  /**
   * @method validate
   * @description 验证命令数据的业务规则
   */
  validate(): void {
    // 基础验证由class-validator处理
    // 这里可以添加更复杂的业务规则验证
    if (this.email === this.username) {
      throw new Error('邮箱和用户名不能相同')
    }
  }

  /**
   * @method toJSON
   * @description 转换为JSON格式，用于日志记录
   */
  toJSON(): Record<string, any> {
    return {
      email: this.email,
      username: this.username,
      tenantId: this.tenantId,
      phoneNumber: this.phoneNumber,
      firstName: this.firstName,
      lastName: this.lastName,
      deviceInfo: this.deviceInfo,
      locationInfo: this.locationInfo,
      // 不包含密码等敏感信息
    }
  }
}
