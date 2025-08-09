/**
 * @class GetUserByEmailHandler
 * @description
 * 根据邮箱查询用户查询处理器，实现CQRS模式中的查询处理部分。该处理器负责接收根据邮箱查询用户查询，
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
import { GetUserByEmailQuery, type GetUserByEmailResult } from '../queries/get-user-by-email.query'
import { GetUserByEmailUseCase } from '../use-cases/get-user-by-email.use-case'

/**
 * @class GetUserByEmailHandler
 * @description 根据邮箱查询用户查询处理器
 * @implements {IQueryHandler<GetUserByEmailQuery>}
 */
@Injectable()
@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行根据邮箱查询用户查询
   * @param {GetUserByEmailQuery} query - 根据邮箱查询用户查询
   * @returns {Promise<GetUserByEmailResult>} 查询结果
   */
  async execute(query: GetUserByEmailQuery): Promise<GetUserByEmailResult> {
    try {
      this.logger.log(
        `开始处理根据邮箱查询用户查询: queryId=${query.queryId}, email=${query.email}`,
        'GetUserByEmailHandler',
      )

      // 1. 验证查询
      query.validate()

      // 2. 委托给用例执行
      const result = await this.getUserByEmailUseCase.execute(query)

      // 3. 记录处理结果
      this.logger.log(
        `根据邮箱查询用户查询处理完成: queryId=${query.queryId}, success=${result.success}`,
        'GetUserByEmailHandler',
      )

      return result
    } catch (error) {
      this.logger.error(
        `根据邮箱查询用户查询处理失败: queryId=${query.queryId}, error=${(error as Error).message}`,
        (error as Error).stack,
        'GetUserByEmailHandler',
      )

      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }
}
