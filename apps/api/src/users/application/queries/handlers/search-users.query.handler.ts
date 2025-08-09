/**
 * @class SearchUsersQueryHandler
 * @description
 * 搜索用户查询处理器，实现CQRS模式中的查询处理逻辑。该处理器负责处理搜索用户的查询请求，
 * 协调应用用例完成具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询操作不修改状态
 * 2. 查询处理器：专门处理查询请求，返回只读数据
 * 3. 依赖注入：通过构造函数注入所需的依赖
 * 4. 权限控制：查询时验证用户权限
 * 5. 搜索优化：支持全文搜索和模糊匹配
 * 6. 分页处理：支持分页查询和排序
 * 7. 错误处理：统一的错误处理和异常管理
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { SearchUsersQuery, type SearchUsersResult } from '../search-users.query'
import { SearchUsersUseCase } from '../../use-cases/search-users.use-case'

@Injectable()
@QueryHandler(SearchUsersQuery)
export class SearchUsersQueryHandler implements IQueryHandler<SearchUsersQuery, SearchUsersResult> {
  constructor(
    private readonly searchUsersUseCase: SearchUsersUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行搜索用户查询
   * @param {SearchUsersQuery} query - 搜索用户查询
   * @returns {Promise<SearchUsersResult>} 查询结果
   */
  async execute(query: SearchUsersQuery): Promise<SearchUsersResult> {
    try {
      this.logger.log(
        `开始处理搜索用户查询: queryId=${query.queryId}, tenantId=${query.tenantId}, searchTerm=${query.searchTerm || '无'}`,
        'SearchUsersQueryHandler',
      )

      // 委托给用例处理具体的业务逻辑
      const result = await this.searchUsersUseCase.execute(query)

      this.logger.log(
        `搜索用户查询处理完成: queryId=${query.queryId}, success=${result.success}, found=${result.pagination.total}`,
        'SearchUsersQueryHandler',
      )

      return result
    } catch (error) {
      this.logger.error(
        `搜索用户查询处理失败: queryId=${query.queryId}, error=${(error as Error).message}`,
        (error as Error).stack,
        'SearchUsersQueryHandler',
      )

      return {
        success: false,
        users: [],
        pagination: {
          page: query.page || 1,
          size: query.size || 20,
          total: 0,
          totalPages: 0,
        },
        error: (error as Error).message,
      }
    }
  }
}
