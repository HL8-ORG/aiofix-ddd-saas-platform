/**
 * @class GetUserByIdQuery
 * @description
 * 根据用户ID查询用户信息的查询对象，实现CQRS模式中的查询部分。该查询封装了
 * 查询用户信息所需的所有参数，并通过查询处理器执行具体的查询逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询操作不修改状态
 * 2. 查询模式：封装查询请求为对象，支持缓存、优化等操作
 * 3. 数据验证：在查询层面进行基础参数验证
 * 4. 权限控制：查询时需要考虑用户权限和数据隔离
 */
import { IsString, IsUUID, IsOptional } from 'class-validator'

export class GetUserByIdQuery {
  @IsUUID('4', { message: '用户ID格式不正确' })
  readonly userId: string

  @IsString({ message: '租户ID不能为空' })
  readonly tenantId: string

  @IsOptional()
  @IsString({ message: '请求者ID不能为空' })
  readonly requesterId?: string

  @IsOptional()
  readonly includeSensitiveData?: boolean

  constructor(
    userId: string,
    tenantId: string,
    requesterId?: string,
    includeSensitiveData: boolean = false,
  ) {
    this.userId = userId
    this.tenantId = tenantId
    this.requesterId = requesterId
    this.includeSensitiveData = includeSensitiveData
  }

  /**
   * @method validate
   * @description 验证查询参数的业务规则
   */
  validate(): void {
    // 基础验证由class-validator处理
    // 这里可以添加更复杂的业务规则验证
    if (this.requesterId && this.requesterId === this.userId) {
      // 查询自己的信息，允许包含敏感数据
      this.includeSensitiveData = true
    }
  }

  /**
   * @method toJSON
   * @description 转换为JSON格式，用于日志记录
   */
  toJSON(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      requesterId: this.requesterId,
      includeSensitiveData: this.includeSensitiveData,
    }
  }
}
