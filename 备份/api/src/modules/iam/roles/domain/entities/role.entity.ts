import { BaseEntity } from '@/shared/domain/entities/base.entity'
import { generateUuid } from '@/shared/domain/utils/uuid.util'
import { Expose, Transform } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'
import {
  RoleActivatedEvent,
  RoleCreatedEvent,
  RoleDeletedEvent,
  RoleInfoUpdatedEvent,
  RoleInheritanceRemovedEvent,
  RoleInheritanceSetEvent,
  RolePermissionAssignedEvent,
  RolePermissionRemovedEvent,
  RoleRestoredEvent,
  RoleSuspendedEvent,
  RoleUserAssignedEvent,
  RoleUserRemovedEvent,
} from '../events/role.events'
import { RoleCode } from '../value-objects/role-code.value-object'
import { RoleName } from '../value-objects/role-name.value-object'
import { RolePriority } from '../value-objects/role-priority.value-object'
import {
  RoleStatus,
  RoleStatusValue,
} from '../value-objects/role-status.value-object'

/**
 * @class Role
 * @description
 * 角色领域实体，作为角色聚合的根实体。
 * 封装角色的核心业务逻辑、状态管理和生命周期。
 *
 * 主要原理与机制：
 * 1. 遵循DDD聚合根设计原则，管理角色相关的所有业务规则
 * 2. 通过值对象封装角色名称、代码、状态、优先级等属性
 * 3. 实现角色状态机，管理角色生命周期
 * 4. 支持软删除和审计功能
 * 5. 集成领域事件，支持事件驱动架构
 * 6. 以租户ID为标识，实现数据软隔离
 * 7. 支持角色继承和权限管理
 */
export class Role extends BaseEntity {
  /**
   * @property name
   * @description 角色名称，在租户内唯一
   */
  @Expose()
  name: RoleName

  /**
   * @property code
   * @description 角色代码，在租户内唯一
   */
  @Expose()
  code: RoleCode

  /**
   * @property description
   * @description 角色描述，可选
   */
  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  @MaxLength(500, { message: '角色描述不能超过500个字符' })
  @Expose()
  description?: string

  /**
   * @property status
   * @description 角色状态
   */
  @Expose()
  status: RoleStatusValue

  /**
   * @property tenantId
   * @description 所属租户ID，实现数据隔离
   */
  @IsUUID('4', { message: '租户ID必须是有效的UUID v4格式' })
  @Expose()
  tenantId: string

  /**
   * @property organizationId
   * @description 所属组织ID，可选，支持组织级角色
   */
  @IsOptional()
  @IsUUID('4', { message: '组织ID必须是有效的UUID v4格式' })
  @Expose()
  organizationId?: string

  /**
   * @property adminUserId
   * @description 创建该角色的管理员ID
   */
  @IsUUID('4', { message: '管理员用户ID必须是有效的UUID v4格式' })
  @Expose()
  adminUserId: string

  /**
   * @property permissionIds
   * @description 权限ID列表，支持多权限
   */
  @IsOptional()
  @IsArray()
  @Expose()
  permissionIds: string[] = []

  /**
   * @property userIds
   * @description 用户ID列表，支持多用户，N:N关系
   */
  @IsOptional()
  @IsArray()
  @Expose()
  userIds: string[] = []

  /**
   * @property isSystemRole
   * @description 是否为系统角色，系统角色不可删除
   */
  @IsBoolean({ message: '系统角色标识必须是布尔值' })
  isSystemRole = false

  /**
   * @property isDefaultRole
   * @description 是否为默认角色，新用户自动分配
   */
  @IsBoolean({ message: '默认角色标识必须是布尔值' })
  isDefaultRole = false

  /**
   * @property priority
   * @description 角色优先级，用于权限冲突解决
   */
  @Expose()
  priority: RolePriority

  /**
   * @property maxUsers
   * @description 最大用户数，可选，限制角色分配数量
   */
  @IsOptional()
  @IsNumber({}, { message: '最大用户数必须是数字' })
  @Expose()
  maxUsers?: number

  /**
   * @property expiresAt
   * @description 角色过期时间，可选，支持临时角色
   */
  @IsOptional()
  @Expose()
  expiresAt?: Date

  /**
   * @property parentRoleId
   * @description 父角色ID，支持角色继承
   */
  @IsOptional()
  @IsUUID('4', { message: '父角色ID必须是有效的UUID v4格式' })
  @Expose()
  parentRoleId?: string

  /**
   * @property childRoleIds
   * @description 子角色ID列表，支持角色继承
   */
  @IsOptional()
  @IsArray()
  @Expose()
  childRoleIds: string[] = []

  /**
   * @property _domainEvents
   * @description 领域事件列表
   */
  private _domainEvents: any[] = []

  /**
   * @constructor
   * @description 创建角色实体
   * @param id 角色ID
   * @param name 角色名称
   * @param code 角色代码
   * @param tenantId 租户ID
   * @param adminUserId 管理员用户ID
   * @param description 角色描述，可选
   * @param organizationId 组织ID，可选
   * @param priority 角色优先级，可选
   * @param isSystemRole 是否为系统角色，可选
   * @param isDefaultRole 是否为默认角色，可选
   * @param maxUsers 最大用户数，可选
   * @param expiresAt 过期时间，可选
   * @param parentRoleId 父角色ID，可选
   */
  constructor(
    id: string,
    name: string,
    code: string,
    tenantId: string,
    adminUserId: string,
    description?: string,
    organizationId?: string,
    priority?: number,
    isSystemRole?: boolean,
    isDefaultRole?: boolean,
    maxUsers?: number,
    expiresAt?: Date,
    parentRoleId?: string,
  ) {
    super()
    this.id = id
    this.name = new RoleName(name)
    this.code = new RoleCode(code)
    this.tenantId = tenantId
    this.adminUserId = adminUserId
    this.status = RoleStatusValue.active()
    this.priority = priority
      ? new RolePriority(priority)
      : RolePriority.getDefault()
    this.permissionIds = []
    this.userIds = []
    this.childRoleIds = []
    this.createdAt = new Date()
    this.updatedAt = new Date()

    // 设置可选字段
    if (description) {
      this.description = description
    }
    if (organizationId) {
      this.organizationId = organizationId
    }
    if (isSystemRole !== undefined) {
      this.isSystemRole = isSystemRole
    }
    if (isDefaultRole !== undefined) {
      this.isDefaultRole = isDefaultRole
    }
    if (maxUsers) {
      this.maxUsers = maxUsers
    }
    if (expiresAt) {
      this.expiresAt = expiresAt
    }
    if (parentRoleId) {
      this.parentRoleId = parentRoleId
    }

    // 添加角色创建事件
    this.addDomainEvent(new RoleCreatedEvent(this))
  }

  /**
   * @method activate
   * @description 激活角色
   * @throws {Error} 当角色无法激活时抛出异常
   */
  activate(): void {
    if (!this.status.canActivate()) {
      throw new Error(`角色当前状态为${this.status.getDisplayName()}，无法激活`)
    }
    this.status = RoleStatusValue.active()
    this.updateRoleTimestamp()

    // 添加角色激活事件
    this.addDomainEvent(new RoleActivatedEvent(this))
  }

  /**
   * @method suspend
   * @description 禁用角色
   * @throws {Error} 当角色无法禁用时抛出异常
   */
  suspend(): void {
    if (!this.status.canSuspend()) {
      throw new Error(`角色当前状态为${this.status.getDisplayName()}，无法禁用`)
    }
    this.status = RoleStatusValue.suspended()
    this.updateRoleTimestamp()

    // 添加角色禁用事件
    this.addDomainEvent(new RoleSuspendedEvent(this))
  }

  /**
   * @method markAsDeleted
   * @description 标记角色为已删除（软删除）
   * @throws {Error} 当角色无法删除时抛出异常
   */
  markAsDeleted(): void {
    if (this.isSystemRole) {
      throw new Error('系统角色不可删除，只能禁用')
    }
    if (!this.status.canDelete()) {
      throw new Error(`角色当前状态为${this.status.getDisplayName()}，无法删除`)
    }
    this.status = RoleStatusValue.deleted()
    this.deletedAt = new Date()
    this.updateRoleTimestamp()

    // 添加角色删除事件
    this.addDomainEvent(new RoleDeletedEvent(this))
  }

  /**
   * @method restore
   * @description 恢复角色
   * @throws {Error} 当角色无法恢复时抛出异常
   */
  restore(): void {
    if (!this.status.canRestore()) {
      throw new Error(`角色当前状态为${this.status.getDisplayName()}，无法恢复`)
    }
    this.status = RoleStatusValue.suspended()
    this.deletedAt = undefined
    this.updateRoleTimestamp()

    // 添加角色恢复事件
    this.addDomainEvent(new RoleRestoredEvent(this))
  }

  /**
   * @method updateInfo
   * @description 更新角色基本信息
   * @param name 角色名称
   * @param code 角色代码
   * @param description 角色描述，可选
   * @param priority 角色优先级，可选
   */
  updateInfo(
    name: string,
    code: string,
    description?: string,
    priority?: number,
  ): void {
    const oldInfo = {
      name: this.getName(),
      code: this.getCode(),
      description: this.description,
      priority: this.priority.getValue(),
    }

    this.name = new RoleName(name)
    this.code = new RoleCode(code)
    if (description !== undefined) {
      this.description = description
    }
    if (priority !== undefined) {
      this.priority = new RolePriority(priority)
    }
    this.updateRoleTimestamp()

    const newInfo = {
      name: this.getName(),
      code: this.getCode(),
      description: this.description,
      priority: this.priority.getValue(),
    }

    // 添加角色信息更新事件
    this.addDomainEvent(new RoleInfoUpdatedEvent(this, oldInfo, newInfo))
  }

  /**
   * @method assignPermission
   * @description 为角色分配权限
   * @param permissionId 权限ID
   */
  assignPermission(permissionId: string): void {
    if (!this.permissionIds.includes(permissionId)) {
      this.permissionIds.push(permissionId)
      this.updateRoleTimestamp()

      // 添加权限分配事件
      this.addDomainEvent(new RolePermissionAssignedEvent(this, permissionId))
    }
  }

  /**
   * @method removePermission
   * @description 移除角色权限
   * @param permissionId 权限ID，可选，如果不提供则移除所有权限
   */
  removePermission(permissionId?: string): void {
    if (permissionId) {
      // 移除指定权限
      const index = this.permissionIds.indexOf(permissionId)
      if (index > -1) {
        this.permissionIds.splice(index, 1)
        this.updateRoleTimestamp()

        // 添加权限移除事件
        this.addDomainEvent(new RolePermissionRemovedEvent(this, permissionId))
      }
    } else {
      // 移除所有权限
      const removedPermissions = [...this.permissionIds]
      this.permissionIds = []
      this.updateRoleTimestamp()

      // 为每个移除的权限添加事件
      removedPermissions.forEach((permId) => {
        this.addDomainEvent(new RolePermissionRemovedEvent(this, permId))
      })
    }
  }

  /**
   * @method hasPermission
   * @description 检查角色是否拥有指定权限
   * @param permissionId 权限ID
   * @returns {boolean} 是否拥有该权限
   */
  hasPermission(permissionId: string): boolean {
    return this.permissionIds.includes(permissionId)
  }

  /**
   * @method getPermissionIds
   * @description 获取角色的所有权限ID
   * @returns {string[]} 权限ID列表
   */
  getPermissionIds(): string[] {
    return [...this.permissionIds]
  }

  /**
   * @method assignUser
   * @description 为角色分配用户
   * @param userId 用户ID
   */
  assignUser(userId: string): void {
    if (this.maxUsers && this.userIds.length >= this.maxUsers) {
      throw new Error(`角色已达到最大用户数限制：${this.maxUsers}`)
    }
    if (!this.status.canAssignToUser()) {
      throw new Error(
        `角色当前状态为${this.status.getDisplayName()}，无法分配给用户`,
      )
    }
    if (!this.userIds.includes(userId)) {
      this.userIds.push(userId)
      this.updateRoleTimestamp()

      // 添加用户分配事件
      this.addDomainEvent(new RoleUserAssignedEvent(this, userId))
    }
  }

  /**
   * @method removeUser
   * @description 移除角色用户
   * @param userId 用户ID，可选，如果不提供则移除所有用户
   */
  removeUser(userId?: string): void {
    if (userId) {
      // 移除指定用户
      const index = this.userIds.indexOf(userId)
      if (index > -1) {
        this.userIds.splice(index, 1)
        this.updateRoleTimestamp()

        // 添加用户移除事件
        this.addDomainEvent(new RoleUserRemovedEvent(this, userId))
      }
    } else {
      // 移除所有用户
      const removedUsers = [...this.userIds]
      this.userIds = []
      this.updateRoleTimestamp()

      // 为每个移除的用户添加事件
      removedUsers.forEach((uid) => {
        this.addDomainEvent(new RoleUserRemovedEvent(this, uid))
      })
    }
  }

  /**
   * @method hasUser
   * @description 检查角色是否包含指定用户
   * @param userId 用户ID
   * @returns {boolean} 是否包含该用户
   */
  hasUser(userId: string): boolean {
    return this.userIds.includes(userId)
  }

  /**
   * @method getUserIds
   * @description 获取角色的所有用户ID
   * @returns {string[]} 用户ID列表
   */
  getUserIds(): string[] {
    return [...this.userIds]
  }

  /**
   * @method setInheritance
   * @description 设置角色继承关系
   * @param parentRoleId 父角色ID
   */
  setInheritance(parentRoleId: string): void {
    if (this.parentRoleId === parentRoleId) {
      return // 已经是相同的父角色
    }
    const oldParentRoleId = this.parentRoleId
    this.parentRoleId = parentRoleId
    this.updateRoleTimestamp()

    // 添加继承关系设置事件
    this.addDomainEvent(
      new RoleInheritanceSetEvent(this, oldParentRoleId, parentRoleId),
    )
  }

  /**
   * @method removeInheritance
   * @description 移除角色继承关系
   */
  removeInheritance(): void {
    if (!this.parentRoleId) {
      return // 没有继承关系
    }
    const oldParentRoleId = this.parentRoleId
    this.parentRoleId = undefined
    this.updateRoleTimestamp()

    // 添加继承关系移除事件
    this.addDomainEvent(new RoleInheritanceRemovedEvent(this, oldParentRoleId))
  }

  /**
   * @method addChildRole
   * @description 添加子角色
   * @param childRoleId 子角色ID
   */
  addChildRole(childRoleId: string): void {
    if (!this.childRoleIds.includes(childRoleId)) {
      this.childRoleIds.push(childRoleId)
      this.updateRoleTimestamp()
    }
  }

  /**
   * @method removeChildRole
   * @description 移除子角色
   * @param childRoleId 子角色ID
   */
  removeChildRole(childRoleId: string): void {
    const index = this.childRoleIds.indexOf(childRoleId)
    if (index > -1) {
      this.childRoleIds.splice(index, 1)
      this.updateRoleTimestamp()
    }
  }

  /**
   * @method isExpired
   * @description 检查角色是否已过期
   * @returns {boolean} 是否已过期
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false
    }
    return new Date() > this.expiresAt
  }

  /**
   * @method canAssignToUser
   * @description 检查角色是否可以分配给用户
   * @returns {boolean} 是否可以分配给用户
   */
  canAssignToUser(): boolean {
    return (
      this.status.canAssignToUser() && !this.isExpired() && !this.isDeleted()
    )
  }

  /**
   * @method isActive
   * @description 检查角色是否处于激活状态
   * @returns {boolean} 如果角色激活返回true，否则返回false
   */
  isActive(): boolean {
    return this.status.isActive() && !this.isDeleted()
  }

  /**
   * @method isSuspended
   * @description 检查角色是否被禁用
   * @returns {boolean} 如果角色被禁用返回true，否则返回false
   */
  isSuspended(): boolean {
    return this.status.isSuspended()
  }

  /**
   * @method getName
   * @description 获取角色名称
   * @returns {string} 角色名称
   */
  getName(): string {
    return this.name.getValue()
  }

  /**
   * @method getCode
   * @description 获取角色代码
   * @returns {string} 角色代码
   */
  getCode(): string {
    return this.code.getValue()
  }

  /**
   * @method getStatus
   * @description 获取角色状态
   * @returns {string} 角色状态
   */
  getStatus(): string {
    return this.status.getValue()
  }

  /**
   * @method getStatusDisplayName
   * @description 获取角色状态显示名称
   * @returns {string} 状态显示名称
   */
  getStatusDisplayName(): string {
    return this.status.getDisplayName()
  }

  /**
   * @method getStatusDescription
   * @description 获取角色状态描述
   * @returns {string} 状态描述
   */
  getStatusDescription(): string {
    return this.status.getDescription()
  }

  /**
   * @method getPriority
   * @description 获取角色优先级
   * @returns {number} 角色优先级
   */
  getPriority(): number {
    return this.priority.getValue()
  }

  /**
   * @method getPriorityDisplayName
   * @description 获取角色优先级显示名称
   * @returns {string} 优先级显示名称
   */
  getPriorityDisplayName(): string {
    return this.priority.getDisplayPriority()
  }

  /**
   * @method getPriorityDescription
   * @description 获取角色优先级描述
   * @returns {string} 优先级描述
   */
  getPriorityDescription(): string {
    return this.priority.getDescription()
  }

  /**
   * @method getIsSystemRole
   * @description 检查是否为系统角色
   * @returns {boolean} 是否为系统角色
   */
  getIsSystemRole(): boolean {
    return this.isSystemRole
  }

  /**
   * @method getIsDefaultRole
   * @description 检查是否为默认角色
   * @returns {boolean} 是否为默认角色
   */
  getIsDefaultRole(): boolean {
    return this.isDefaultRole
  }

  /**
   * @method addDomainEvent
   * @description 添加领域事件
   * @param event 领域事件
   */
  addDomainEvent(event: any): void {
    this._domainEvents.push(event)
  }

  /**
   * @method clearDomainEvents
   * @description 清除领域事件
   */
  clearDomainEvents(): void {
    this._domainEvents = []
  }

  /**
   * @method getDomainEvents
   * @description 获取领域事件列表
   * @returns {any[]} 领域事件列表
   */
  getDomainEvents(): any[] {
    return [...this._domainEvents]
  }

  /**
   * @method hasDomainEvents
   * @description 检查是否有领域事件
   * @returns {boolean} 是否有领域事件
   */
  hasDomainEvents(): boolean {
    return this._domainEvents.length > 0
  }

  /**
   * @method updateRoleTimestamp
   * @description 更新角色时间戳
   */
  private updateRoleTimestamp(): void {
    this.updatedAt = new Date()
  }
}
