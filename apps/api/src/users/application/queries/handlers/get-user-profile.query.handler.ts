/**
 * @class GetUserProfileQueryHandler
 * @description
 * 获取用户资料查询处理器，实现CQRS模式中的查询处理逻辑。该处理器负责处理获取用户资料的查询请求，
 * 协调应用用例完成具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询操作不修改状态
 * 2. 查询处理器：专门处理查询请求，返回只读数据
 * 3. 依赖注入：通过构造函数注入所需的依赖
 * 4. 权限控制：查询时验证用户权限
 * 5. 数据过滤：根据权限过滤敏感信息
 * 6. 错误处理：统一的错误处理和异常管理
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { GetUserProfileQuery, type GetUserProfileResult } from '../get-user-profile.query'
import { GetUserProfileUseCase } from '../../use-cases/get-user-profile.use-case'

@Injectable()
@QueryHandler(GetUserProfileQuery)
export class GetUserProfileQueryHandler implements IQueryHandler<GetUserProfileQuery, GetUserProfileResult> {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行获取用户资料查询
   * @param {GetUserProfileQuery} query - 获取用户资料查询
   * @returns {Promise<GetUserProfileResult>} 查询结果
   */
  async execute(query: GetUserProfileQuery): Promise<GetUserProfileResult> {
    try {
      this.logger.log(
        `开始处理获取用户资料查询: queryId=${query.queryId}, userId=${query.userId}`,
        'GetUserProfileQueryHandler',
      )

      // 委托给用例处理具体的业务逻辑
      const result = await this.getUserProfileUseCase.execute(query)

      this.logger.log(
        `获取用户资料查询处理完成: queryId=${query.queryId}, success=${result.success}`,
        'GetUserProfileQueryHandler',
      )

      return result
    } catch (error) {
      this.logger.error(
        `获取用户资料查询处理失败: queryId=${query.queryId}, error=${(error as Error).message}`,
        (error as Error).stack,
        'GetUserProfileQueryHandler',
      )

      return {
        success: false,
        userProfile: null,
        error: (error as Error).message,
      }
    }
  }
}
