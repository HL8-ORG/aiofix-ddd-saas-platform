import { Injectable } from '@nestjs/common'
import { ClsService } from 'nestjs-cls'
import { CacheKeyGenerator } from '../interfaces/cache.interface'

/**
 * @class CacheKeyGenerator
 * @description 基于CLS的缓存键生成器，自动注入请求上下文信息
 * 
 * 主要原理与机制：
 * 1. 利用nestjs-cls获取当前请求的上下文信息
 * 2. 自动注入租户ID、用户ID、请求ID等上下文
 * 3. 生成具有隔离性的缓存键，避免多租户数据污染
 * 4. 支持自定义命名空间和标签
 */
@Injectable()
export class ClsBasedCacheKeyGenerator {
  constructor(private readonly cls: ClsService) { }

  /**
   * @method generate
   * @description 生成包含上下文的缓存键
   * 
   * @param baseKey 基础缓存键
   * @param namespace 命名空间（可选）
   * @param tags 标签数组（可选）
   * @returns 完整的缓存键
   */
  generate(baseKey: string, namespace?: string, tags?: string[]): string {
    let context: Record<string, any> = {}
    try {
      context = this.getContext()
    } catch (error) {
      // 发生CLS上下文错误时回退为无上下文，返回基础缓存键
      context = {}
    }
    const parts = ['cache']

    // 添加命名空间
    if (namespace) {
      parts.push(namespace)
    }

    // 添加租户上下文
    if (context.tenantId) {
      parts.push('tenant', context.tenantId)
    }

    // 添加用户上下文
    if (context.userId) {
      parts.push('user', context.userId)
    }

    // 添加请求ID（用于调试和追踪）
    if (context.requestId) {
      parts.push('req', context.requestId)
    }

    // 添加基础键
    parts.push(baseKey)

    // 添加标签（如果提供）
    if (tags && tags.length > 0) {
      parts.push('tags', tags.join(':'))
    }

    return parts.join(':')
  }

  /**
   * @method generateTenantKey
   * @description 生成租户特定的缓存键
   * 
   * @param baseKey 基础缓存键
   * @param tenantId 租户ID（可选，默认从CLS获取）
   * @returns 租户特定的缓存键
   */
  generateTenantKey(baseKey: string, tenantId?: string): string {
    const targetTenantId = tenantId || this.cls.get('tenantId') || 'default'
    // 规范：cache:tenant:<tenantId>:<baseKey>
    return ['cache', 'tenant', targetTenantId, baseKey].join(':')
  }

  /**
   * @method generateUserKey
   * @description 生成用户特定的缓存键
   * 
   * @param baseKey 基础缓存键
   * @param userId 用户ID（可选，默认从CLS获取）
   * @returns 用户特定的缓存键
   */
  generateUserKey(baseKey: string, userId?: string): string {
    const targetUserId = userId || this.cls.get('userId') || 'anonymous'
    return this.generate(baseKey, 'user', [targetUserId])
  }

  /**
   * @method generatePattern
   * @description 生成缓存键模式，用于批量操作
   * 
   * @param pattern 基础模式
   * @param context 上下文信息
   * @returns 缓存键模式
   */
  generatePattern(pattern: string, context?: Record<string, any>): string {
    const ctx = context || this.getContext()
    const parts = ['cache']

    // 添加租户模式
    if (ctx.tenantId) {
      parts.push('tenant', ctx.tenantId)
    }

    // 添加用户模式
    if (ctx.userId) {
      parts.push('user', ctx.userId)
    }

    // 添加基础模式
    parts.push(pattern)

    return parts.join(':')
  }

  /**
   * @method getContext
   * @description 获取当前请求的上下文信息
   * 
   * @returns 上下文信息对象
   */
  private getContext(): Record<string, any> {
    return {
      tenantId: this.cls.get('tenantId') || this.cls.get('tenant')?.id,
      userId: this.cls.get('userId') || this.cls.get('user')?.id,
      requestId: this.cls.get('requestId') || this.cls.get('req')?.id,
      sessionId: this.cls.get('sessionId'),
      correlationId: this.cls.get('correlationId'),
    }
  }

  /**
   * @method extractContextFromKey
   * @description 从缓存键中提取上下文信息
   * 
   * @param key 缓存键
   * @returns 上下文信息对象
   */
  extractContextFromKey(key: string): Record<string, any> {
    const parts = key.split(':')
    const context: Record<string, any> = {}

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'tenant' && parts[i + 1]) {
        context.tenantId = parts[i + 1]
      } else if (parts[i] === 'user' && parts[i + 1]) {
        context.userId = parts[i + 1]
      } else if (parts[i] === 'req' && parts[i + 1]) {
        context.requestId = parts[i + 1]
      }
    }

    return context
  }

  /**
   * @method isValidKey
   * @description 验证缓存键是否有效
   * 
   * @param key 缓存键
   * @returns 是否有效
   */
  isValidKey(key: string): boolean {
    if (!key || typeof key !== 'string') {
      return false
    }

    // 检查键格式
    const parts = key.split(':')
    if (parts.length < 2) {
      return false
    }

    // 检查是否以cache开头
    if (parts[0] !== 'cache') {
      return false
    }

    return true
  }
}
