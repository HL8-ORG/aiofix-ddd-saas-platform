import { Inject, Injectable } from '@nestjs/common'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'

/**
 * @class DeletePermissionUseCase
 * @description
 * 删除权限用例，负责权限删除的核心业务逻辑。
 * 支持软删除、硬删除、恢复删除等操作。
 *
 * 主要原理与机制：
 * 1. 遵循DDD的Use Case模式，封装单一业务操作
 * 2. 支持多租户数据隔离，确保删除安全性
 * 3. 提供完整的业务规则验证和错误处理
 * 4. 支持系统权限的保护机制
 * 5. 支持批量删除操作
 * 6. 支持按租户和组织删除权限
 * 7. 确保删除操作的原子性和一致性
 */
@Injectable()
export class DeletePermissionUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) { }

  /**
   * @method execute
   * @description 删除权限（软删除）
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<boolean>} 删除结果
   * 
   * 主要原理与机制：
   * 1. 验证权限是否存在
   * 2. 检查是否为系统权限（系统权限不允许删除）
   * 3. 调用权限实体的markAsDeleted方法进行软删除
   * 4. 保存更新后的权限
   * 5. 触发权限删除事件
   */
  async execute(id: string, tenantId: string): Promise<boolean> {
    const permission = await this.permissionRepository.findById(id, tenantId)
    if (!permission) {
      throw new Error(`权限 "${id}" 不存在`)
    }

    // 检查是否为系统权限
    if (permission.getIsSystemPermission()) {
      throw new Error('系统权限不允许删除')
    }

    // 软删除权限
    permission.markAsDeleted()
    await this.permissionRepository.save(permission)

    return true
  }

  /**
   * @method executeHardDelete
   * @description 硬删除权限
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<boolean>} 删除结果
   * 
   * 主要原理与机制：
   * 1. 验证权限是否存在
   * 2. 检查是否为系统权限（系统权限不允许删除）
   * 3. 调用仓储的delete方法进行硬删除
   * 4. 从数据库中永久删除权限记录
   */
  async executeHardDelete(id: string, tenantId: string): Promise<boolean> {
    const permission = await this.permissionRepository.findById(id, tenantId)
    if (!permission) {
      throw new Error(`权限 "${id}" 不存在`)
    }

    // 检查是否为系统权限
    if (permission.getIsSystemPermission()) {
      throw new Error('系统权限不允许删除')
    }

    // 硬删除权限
    return await this.permissionRepository.delete(id, tenantId)
  }

  /**
   * @method executeRestore
   * @description 恢复已删除的权限
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<boolean>} 恢复结果
   * 
   * 主要原理与机制：
   * 1. 验证权限是否存在
   * 2. 调用权限实体的restore方法恢复权限
   * 3. 保存更新后的权限
   * 4. 触发权限恢复事件
   */
  async executeRestore(id: string, tenantId: string): Promise<boolean> {
    const permission = await this.permissionRepository.findById(id, tenantId)
    if (!permission) {
      throw new Error(`权限 "${id}" 不存在`)
    }

    // 恢复权限
    permission.restore()
    await this.permissionRepository.save(permission)

    return true
  }

  /**
   * @method executeBatchDelete
   * @description 批量删除权限
   * @param ids 权限ID数组
   * @param tenantId 租户ID
   * @returns {Promise<{ success: string[]; failed: string[] }>} 批量删除结果
   * 
   * 主要原理与机制：
   * 1. 遍历权限ID数组
   * 2. 对每个权限执行软删除操作
   * 3. 记录成功和失败的权限ID
   * 4. 返回批量删除结果
   */
  async executeBatchDelete(ids: string[], tenantId: string): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = []
    const failed: string[] = []

    for (const id of ids) {
      try {
        await this.execute(id, tenantId)
        success.push(id)
      } catch (error) {
        failed.push(id)
      }
    }

    return { success, failed }
  }

  /**
   * @method executeBatchHardDelete
   * @description 批量硬删除权限
   * @param ids 权限ID数组
   * @param tenantId 租户ID
   * @returns {Promise<{ success: string[]; failed: string[] }>} 批量删除结果
   * 
   * 主要原理与机制：
   * 1. 遍历权限ID数组
   * 2. 对每个权限执行硬删除操作
   * 3. 记录成功和失败的权限ID
   * 4. 返回批量删除结果
   */
  async executeBatchHardDelete(ids: string[], tenantId: string): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = []
    const failed: string[] = []

    for (const id of ids) {
      try {
        await this.executeHardDelete(id, tenantId)
        success.push(id)
      } catch (error) {
        failed.push(id)
      }
    }

    return { success, failed }
  }

  /**
   * @method executeByTenant
   * @description 删除租户的所有权限
   * @param tenantId 租户ID
   * @returns {Promise<number>} 删除的权限数量
   * 
   * 主要原理与机制：
   * 1. 调用仓储的deleteByTenant方法
   * 2. 删除指定租户下的所有权限
   * 3. 返回删除的权限数量
   */
  async executeByTenant(tenantId: string): Promise<number> {
    return await this.permissionRepository.deleteByTenant(tenantId)
  }

  /**
   * @method executeByOrganization
   * @description 删除组织的所有权限
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   * @returns {Promise<number>} 删除的权限数量
   * 
   * 主要原理与机制：
   * 1. 调用仓储的deleteByOrganization方法
   * 2. 删除指定组织下的所有权限
   * 3. 返回删除的权限数量
   */
  async executeByOrganization(organizationId: string, tenantId: string): Promise<number> {
    return await this.permissionRepository.deleteByOrganization(organizationId, tenantId)
  }
} 