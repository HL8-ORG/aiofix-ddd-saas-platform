import { Inject, Injectable } from '@nestjs/common'
import { Permission } from '../../domain/entities/permission.entity'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'

/**
 * @class UpdatePermissionStatusUseCase
 * @description
 * 更新权限状态用例，负责权限状态变更的核心业务逻辑。
 * 支持权限的激活、禁用、删除等状态操作。
 *
 * 主要原理与机制：
 * 1. 遵循DDD的Use Case模式，封装单一业务操作
 * 2. 支持多租户数据隔离，确保状态变更安全性
 * 3. 提供完整的业务规则验证和错误处理
 * 4. 支持权限状态的有效性验证
 * 5. 支持权限状态变更的审计记录
 * 6. 确保状态变更的原子性操作
 */
@Injectable()
export class UpdatePermissionStatusUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) { }

  /**
   * @method executeActivate
   * @description 激活权限
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 激活后的权限实体
   * 
   * 主要原理与机制：
   * 1. 验证权限是否存在
   * 2. 调用权限实体的activate方法
   * 3. 保存更新后的权限
   * 4. 触发权限激活事件
   */
  async executeActivate(id: string, tenantId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id, tenantId)
    if (!permission) {
      throw new Error(`权限 "${id}" 不存在`)
    }

    permission.activate()
    return await this.permissionRepository.save(permission)
  }

  /**
   * @method executeSuspend
   * @description 禁用权限
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 禁用后的权限实体
   * 
   * 主要原理与机制：
   * 1. 验证权限是否存在
   * 2. 调用权限实体的suspend方法
   * 3. 保存更新后的权限
   * 4. 触发权限禁用事件
   */
  async executeSuspend(id: string, tenantId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id, tenantId)
    if (!permission) {
      throw new Error(`权限 "${id}" 不存在`)
    }

    permission.suspend()
    return await this.permissionRepository.save(permission)
  }

  /**
   * @method executeUpdateStatus
   * @description 更新权限状态
   * @param id 权限ID
   * @param status 权限状态
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 更新后的权限实体
   * 
   * 主要原理与机制：
   * 1. 验证权限是否存在
   * 2. 根据状态参数调用相应的状态变更方法
   * 3. 验证状态参数的有效性
   * 4. 保存更新后的权限
   * 5. 触发相应的权限状态变更事件
   */
  async executeUpdateStatus(id: string, status: string, tenantId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id, tenantId)
    if (!permission) {
      throw new Error(`权限 "${id}" 不存在`)
    }

    switch (status.toLowerCase()) {
      case 'active':
        permission.activate()
        break
      case 'suspended':
        permission.suspend()
        break
      case 'deleted':
        permission.markAsDeleted()
        break
      default:
        throw new Error(`无效的权限状态: ${status}`)
    }

    return await this.permissionRepository.save(permission)
  }
} 