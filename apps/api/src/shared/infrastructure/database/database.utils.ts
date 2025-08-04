import type { EntityManager, IsolationLevel } from '@mikro-orm/core'

/**
 * @description 数据库工具类
 *
 * 提供常用的数据库操作工具函数，包括：
 * 1. 事务管理
 * 2. 批量操作
 * 3. 查询构建
 * 4. 数据转换
 * 5. 性能优化
 */
export class DatabaseUtils {
  /**
   * @description 执行事务操作
   * @param em EntityManager实例
   * @param operation 事务操作函数
   * @param options 事务选项
   */
  static async executeInTransaction<T>(
    em: EntityManager,
    operation: () => Promise<T>,
    options?: {
      isolationLevel?: IsolationLevel
    },
  ): Promise<T> {
    const fork = em.fork()

    try {
      await fork.begin(options)
      const result = await operation()
      await fork.commit()
      return result
    } catch (error) {
      await fork.rollback()
      throw error
    }
  }

  /**
   * @description 批量插入数据
   * @param em EntityManager实例
   * @param entityClass 实体类
   * @param data 数据数组
   * @param batchSize 批次大小
   */
  static async batchInsert<T>(
    em: EntityManager,
    entityClass: new () => T,
    data: Partial<T>[],
    batchSize = 1000,
  ): Promise<void> {
    const fork = em.fork()

    try {
      await fork.begin()

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        const entities = batch.map((item) => fork.create(entityClass, item))
        await fork.persistAndFlush(entities)
      }

      await fork.commit()
    } catch (error) {
      await fork.rollback()
      throw error
    }
  }

  /**
   * @description 批量更新数据
   * @param em EntityManager实例
   * @param entityClass 实体类
   * @param data 数据数组
   * @param idField ID字段名
   */
  static async batchUpdate<T>(
    em: EntityManager,
    entityClass: new () => T,
    data: Partial<T>[],
    idField: keyof T = 'id' as keyof T,
  ): Promise<void> {
    const fork = em.fork()

    try {
      await fork.begin()

      for (const item of data) {
        const id = item[idField]
        if (id) {
          const entity = await fork.findOne(entityClass, { [idField]: id })
          if (entity) {
            fork.assign(entity, item as any)
          }
        }
      }

      await fork.flush()
      await fork.commit()
    } catch (error) {
      await fork.rollback()
      throw error
    }
  }

  /**
   * @description 构建分页查询
   * @param page 页码
   * @param limit 每页数量
   * @param options 查询选项
   */
  static buildPagination(
    page = 1,
    limit = 10,
    options: {
      maxLimit?: number
      defaultLimit?: number
    } = {},
  ): {
    offset: number
    limit: number
    page: number
  } {
    const { maxLimit = 100, defaultLimit = 10 } = options

    // 确保页码和限制在合理范围内
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), maxLimit)

    return {
      offset: (validPage - 1) * validLimit,
      limit: validLimit,
      page: validPage,
    }
  }

  /**
   * @description 构建排序查询
   * @param sortBy 排序字段
   * @param sortOrder 排序方向
   * @param allowedFields 允许排序的字段
   */
  static buildSorting(
    sortBy: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    allowedFields: string[] = [],
  ): {
    sortBy: string
    sortOrder: 'ASC' | 'DESC'
  } {
    // 验证排序字段是否在允许列表中
    const validSortBy =
      allowedFields.length === 0 || allowedFields.includes(sortBy)
        ? sortBy
        : allowedFields[0]

    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder)
      ? sortOrder
      : 'ASC'

    return {
      sortBy: validSortBy,
      sortOrder: validSortOrder,
    }
  }

  /**
   * @description 构建搜索查询
   * @param searchTerm 搜索词
   * @param searchFields 搜索字段
   */
  static buildSearchQuery(
    searchTerm: string,
    searchFields: string[],
  ): Record<string, any> {
    if (!searchTerm || searchFields.length === 0) {
      return {}
    }

    const searchConditions = searchFields.map((field) => ({
      [field]: { $ilike: `%${searchTerm}%` },
    }))

    return { $or: searchConditions }
  }

  /**
   * @description 构建日期范围查询
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param dateField 日期字段名
   */
  static buildDateRangeQuery(
    startDate?: Date,
    endDate?: Date,
    dateField = 'createdAt',
  ): Record<string, any> {
    const conditions: Record<string, any> = {}

    if (startDate) {
      conditions[dateField] = { $gte: startDate }
    }

    if (endDate) {
      conditions[dateField] = {
        ...conditions[dateField],
        $lte: endDate,
      }
    }

    return conditions
  }

  /**
   * @description 构建软删除查询条件
   * @param includeDeleted 是否包含已删除的记录
   */
  static buildSoftDeleteCondition(includeDeleted = false): Record<string, any> {
    if (includeDeleted) {
      return {}
    }

    return {
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    }
  }

  /**
   * @description 格式化查询结果
   * @param data 原始数据
   * @param options 格式化选项
   */
  static formatQueryResult<T>(
    data: T[],
    options: {
      total?: number
      page?: number
      limit?: number
      includeMetadata?: boolean
    } = {},
  ): {
    data: T[]
    metadata?: {
      total: number
      page: number
      limit: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  } {
    const { total, page, limit, includeMetadata = false } = options

    if (!includeMetadata || total === undefined) {
      return { data }
    }

    const totalPages = Math.ceil(total / limit)
    const currentPage = page || 1

    return {
      data,
      metadata: {
        total,
        page: currentPage,
        limit: limit || data.length,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    }
  }

  /**
   * @description 生成UUID
   */
  static generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /**
   * @description 生成短UUID
   */
  static generateShortUuid(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }

  /**
   * @description 转义SQL字符串
   * @param str 原始字符串
   */
  static escapeSqlString(str: string): string {
    return str.replace(/'/g, "''")
  }

  /**
   * @description 构建IN查询条件
   * @param field 字段名
   * @param values 值数组
   */
  static buildInCondition(field: string, values: any[]): Record<string, any> {
    if (!values || values.length === 0) {
      return {}
    }

    return { [field]: { $in: values } }
  }

  /**
   * @description 构建NOT IN查询条件
   * @param field 字段名
   * @param values 值数组
   */
  static buildNotInCondition(
    field: string,
    values: any[],
  ): Record<string, any> {
    if (!values || values.length === 0) {
      return {}
    }

    return { [field]: { $nin: values } }
  }
}
