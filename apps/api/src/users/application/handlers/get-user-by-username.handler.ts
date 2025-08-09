/**
 * @class GetUserByUsernameHandler
 * @description
 * 根据用户名查询用户查询处理器，实现CQRS模式中的查询处理部分。该处理器负责接收根据用户名查询用户查询，
 * 并委托给对应的用例执行具体的查询逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询处理器处理读操作
 * 2. 查询处理器：接收查询并委托给用例执行
 * 3. 依赖注入：通过构造函数注入所需的依赖
 * 4. 错误处理：统一的错误处理和异常管理
 * 5. 审计日志：记录查询处理的审计信息
 * 6. 缓存支持：支持查询结果缓存
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { GetUserByUsernameQuery, type GetUserByUsernameResult } from '../queries/get-user-by-username.query'
import { GetUserByUsernameUseCase } from '../use-cases/get-user-by-username.use-case'

/**
 * @class GetUserByUsernameHandler
 * @description 根据用户名查询用户查询处理器
 * @implements {IQueryHandler<GetUserByUsernameQuery>}
 */
@Injectable()
@QueryHandler(GetUserByUsernameQuery)
export class GetUserByUsernameHandler implements IQueryHandler<GetUserByUsernameQuery> {
  constructor(
    private readonly getUserByUsernameUseCase: GetUserByUsernameUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行根据用户名查询用户查询
   * @param {GetUserByUsernameQuery} query - 根据用户名查询用户查询
   * @returns {Promise<GetUserByUsernameResult>} 查询结果
   */
  async execute(query: GetUserByUsernameQuery): Promise<GetUserByUsernameResult> {
    try {
      this.logger.log(
        `开始处理根据用户名查询用户查询: queryId=${query.queryId}, username=${query.username}`,
        'GetUserByUsernameHandler',
      )

      // 1. 验证查询
      query.validate()

      // 2. 委托给用例执行
      const result = await this.getUserByUsernameUseCase.execute(query)

      // 3. 记录处理结果
      this.logger.log(
        `根据用户名查询用户查询处理完成: queryId=${query.queryId}, success=${result.success}`,
        'GetUserByUsernameHandler',
      )

      return result
    } catch (error) {
      this.logger.error(
        `根据用户名查询用户查询处理失败: queryId=${query.queryId}, error=${(error as Error).message}`,
        (error as Error).stack,
        'GetUserByUsernameHandler',
      )

      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }
}
