import { Expose, Transform } from 'class-transformer';
import { IsUUID, IsOptional, IsString, MaxLength, IsBoolean, IsArray, IsObject } from 'class-validator';
import { BaseEntity } from '@/shared/domain/entities/base.entity';
import { PermissionName } from '../value-objects/permission-name.value-object';
import { PermissionCode } from '../value-objects/permission-code.value-object';
import { PermissionTypeValue, PermissionType } from '../value-objects/permission-type.value-object';
import { PermissionStatusValue, PermissionStatus } from '../value-objects/permission-status.value-object';
import { PermissionActionValue, PermissionAction } from '../value-objects/permission-action.value-object';
import { PermissionCondition, PermissionConditionData } from '../value-objects/permission-condition.value-object';
import { generateUuid } from '@/shared/domain/utils/uuid.util';
import {
  PermissionCreatedEvent, PermissionActivatedEvent, PermissionSuspendedEvent, PermissionDeletedEvent, PermissionRestoredEvent,
  PermissionInfoUpdatedEvent, PermissionActionUpdatedEvent, PermissionConditionUpdatedEvent, PermissionFieldsUpdatedEvent,
} from '../events/permission.events';

/**
 * @class Permission
 * @description
 * 权限聚合根实体，封装权限的核心业务逻辑和状态管理。
 * 支持CASL权限管理库的深度集成，提供细粒度的权限控制。
 * 
 * 主要原理与机制：
 * 1. 继承BaseEntity基类，获得基础实体功能
 * 2. 使用值对象封装核心属性，确保业务规则的一致性
 * 3. 实现领域事件机制，支持事件驱动的架构
 * 4. 集成CASL概念，支持条件权限和字段级权限控制
 */
export class Permission extends BaseEntity {
  @Expose() name: PermissionName;
  @Expose() code: PermissionCode;
  @IsOptional() @IsString({ message: '权限描述必须是字符串' }) @MaxLength(500, { message: '权限描述不能超过500个字符' }) @Expose() description?: string;
  @Expose() type: PermissionTypeValue;
  @Expose() status: PermissionStatusValue;
  @Expose() action: PermissionActionValue;
  @IsUUID('4', { message: '租户ID必须是有效的UUID v4格式' }) @Expose() tenantId: string;
  @IsOptional() @IsUUID('4', { message: '组织ID必须是有效的UUID v4格式' }) @Expose() organizationId?: string;
  @IsUUID('4', { message: '管理员用户ID必须是有效的UUID v4格式' }) @Expose() adminUserId: string;
  @IsOptional() @IsArray() @Expose() roleIds: string[] = [];
  @IsBoolean({ message: '系统权限标识必须是布尔值' }) isSystemPermission: boolean = false;
  @IsBoolean({ message: '默认权限标识必须是布尔值' }) isDefaultPermission: boolean = false;
  @IsOptional() @IsObject() @Expose() conditions?: PermissionCondition;
  @IsOptional() @IsArray() @Expose() fields: string[] = [];
  @IsOptional() @Expose() expiresAt?: Date;
  @IsOptional() @IsUUID('4', { message: '父权限ID必须是有效的UUID v4格式' }) @Expose() parentPermissionId?: string;
  @IsOptional() @IsArray() @Expose() childPermissionIds: string[] = [];
  @IsOptional() @IsString({ message: '权限资源必须是字符串' }) @Expose() resource?: string;
  @IsOptional() @IsString({ message: '权限模块必须是字符串' }) @Expose() module?: string;
  @IsOptional() @IsString({ message: '权限标签必须是字符串' }) @Expose() tags?: string;

  private _domainEvents: any[] = [];

  /**
   * @constructor
   * @description 创建权限实体
   * @param id 权限ID
   * @param name 权限名称
   * @param code 权限代码
   * @param type 权限类型
   * @param action 权限操作
   * @param tenantId 租户ID
   * @param adminUserId 管理员用户ID
   * @param description 权限描述
   * @param organizationId 组织ID
   * @param resource 权限资源
   * @param module 权限模块
   * @param isSystemPermission 是否为系统权限
   * @param isDefaultPermission 是否为默认权限
   * @param conditions 权限条件
   * @param fields 权限字段
   * @param expiresAt 过期时间
   * @param parentPermissionId 父权限ID
   */
  constructor(
    id: string,
    name: string,
    code: string,
    type: PermissionType,
    action: PermissionAction,
    tenantId: string,
    adminUserId: string,
    description?: string,
    organizationId?: string,
    resource?: string,
    module?: string,
    isSystemPermission?: boolean,
    isDefaultPermission?: boolean,
    conditions?: PermissionConditionData[],
    fields?: string[],
    expiresAt?: Date,
    parentPermissionId?: string
  ) {
    super();
    this.id = id;
    this.name = new PermissionName(name);
    this.code = new PermissionCode(code);
    this.type = new PermissionTypeValue(type);
    this.action = new PermissionActionValue(action);
    this.tenantId = tenantId;
    this.adminUserId = adminUserId;
    this.description = description;
    this.organizationId = organizationId;
    this.resource = resource;
    this.module = module;
    this.isSystemPermission = isSystemPermission || false;
    this.isDefaultPermission = isDefaultPermission || false;
    this.conditions = conditions ? new PermissionCondition(conditions) : undefined;
    this.fields = fields || [];
    this.expiresAt = expiresAt;
    this.parentPermissionId = parentPermissionId;
    this.status = PermissionStatusValue.getActive();

    // 添加权限创建事件
    this.addDomainEvent(new PermissionCreatedEvent(this));
  }

  /**
   * @method activate
   * @description 激活权限
   */
  activate(): void {
    if (!this.status.canBeActivated()) {
      throw new Error('当前状态无法激活权限');
    }
    this.status = PermissionStatusValue.getActive();
    this.updatePermissionTimestamp();
    this.addDomainEvent(new PermissionActivatedEvent(this));
  }

  /**
   * @method suspend
   * @description 暂停权限
   */
  suspend(): void {
    if (!this.status.canBeSuspended()) {
      throw new Error('当前状态无法暂停权限');
    }
    this.status = PermissionStatusValue.getSuspended();
    this.updatePermissionTimestamp();
    this.addDomainEvent(new PermissionSuspendedEvent(this));
  }

  /**
   * @method markAsDeleted
   * @description 标记权限为已删除
   */
  markAsDeleted(): void {
    this.status = PermissionStatusValue.getInactive();
    this.updatePermissionTimestamp();
    this.addDomainEvent(new PermissionDeletedEvent(this));
  }

  /**
   * @method restore
   * @description 恢复权限
   */
  restore(): void {
    this.status = PermissionStatusValue.getActive();
    this.updatePermissionTimestamp();
    this.addDomainEvent(new PermissionRestoredEvent(this));
  }

  /**
   * @method updateInfo
   * @description 更新权限基本信息
   * @param name 权限名称
   * @param code 权限代码
   * @param description 权限描述
   * @param resource 权限资源
   * @param module 权限模块
   */
  updateInfo(name: string, code: string, description?: string, resource?: string, module?: string): void {
    this.name = new PermissionName(name);
    this.code = new PermissionCode(code);
    this.description = description;
    this.resource = resource;
    this.module = module;
    this.updatePermissionTimestamp();
    this.addDomainEvent(new PermissionInfoUpdatedEvent(this));
  }

  /**
   * @method updateAction
   * @description 更新权限操作
   * @param action 权限操作
   */
  updateAction(action: PermissionAction): void {
    this.action = new PermissionActionValue(action);
    this.updatePermissionTimestamp();
    this.addDomainEvent(new PermissionActionUpdatedEvent(this));
  }

  /**
   * @method setConditions
   * @description 设置权限条件
   * @param conditions 权限条件数组
   */
  setConditions(conditions: PermissionConditionData[]): void {
    if (!this.type.canHaveConditions()) {
      throw new Error('当前权限类型不支持条件设置');
    }
    this.conditions = new PermissionCondition(conditions);
    this.updatePermissionTimestamp();
    this.addDomainEvent(new PermissionConditionUpdatedEvent(this));
  }

  /**
   * @method clearConditions
   * @description 清除权限条件
   */
  clearConditions(): void {
    this.conditions = undefined;
    this.updatePermissionTimestamp();
    this.addDomainEvent(new PermissionConditionUpdatedEvent(this));
  }

  /**
   * @method setFields
   * @description 设置权限字段
   * @param fields 字段数组
   */
  setFields(fields: string[]): void {
    if (!this.type.canHaveFields()) {
      throw new Error('当前权限类型不支持字段设置');
    }
    this.fields = [...fields];
    this.updatePermissionTimestamp();
    this.addDomainEvent(new PermissionFieldsUpdatedEvent(this));
  }

  /**
   * @method addField
   * @description 添加权限字段
   * @param field 字段名
   */
  addField(field: string): void {
    if (!this.type.canHaveFields()) {
      throw new Error('当前权限类型不支持字段设置');
    }
    if (!this.fields.includes(field)) {
      this.fields.push(field);
      this.updatePermissionTimestamp();
      this.addDomainEvent(new PermissionFieldsUpdatedEvent(this));
    }
  }

  /**
   * @method removeField
   * @description 移除权限字段
   * @param field 字段名
   */
  removeField(field: string): void {
    const index = this.fields.indexOf(field);
    if (index > -1) {
      this.fields.splice(index, 1);
      this.updatePermissionTimestamp();
      this.addDomainEvent(new PermissionFieldsUpdatedEvent(this));
    }
  }

  /**
   * @method assignToRole
   * @description 分配权限给角色
   * @param roleId 角色ID
   */
  assignToRole(roleId: string): void {
    if (!this.roleIds.includes(roleId)) {
      this.roleIds.push(roleId);
      this.updatePermissionTimestamp();
    }
  }

  /**
   * @method removeFromRole
   * @description 从角色移除权限
   * @param roleId 角色ID
   */
  removeFromRole(roleId: string): void {
    const index = this.roleIds.indexOf(roleId);
    if (index > -1) {
      this.roleIds.splice(index, 1);
      this.updatePermissionTimestamp();
    }
  }

  /**
   * @method hasRole
   * @description 检查是否分配给指定角色
   * @param roleId 角色ID
   * @returns {boolean} 是否分配给该角色
   */
  hasRole(roleId: string): boolean {
    return this.roleIds.includes(roleId);
  }

  /**
   * @method getRoleIds
   * @description 获取分配的角色ID列表
   * @returns {string[]} 角色ID列表
   */
  getRoleIds(): string[] {
    return [...this.roleIds];
  }

  /**
   * @method setParentPermission
   * @description 设置父权限
   * @param parentPermissionId 父权限ID
   */
  setParentPermission(parentPermissionId: string): void {
    this.parentPermissionId = parentPermissionId;
    this.updatePermissionTimestamp();
  }

  /**
   * @method removeParentPermission
   * @description 移除父权限
   */
  removeParentPermission(): void {
    this.parentPermissionId = undefined;
    this.updatePermissionTimestamp();
  }

  /**
   * @method addChildPermission
   * @description 添加子权限
   * @param childPermissionId 子权限ID
   */
  addChildPermission(childPermissionId: string): void {
    if (!this.childPermissionIds.includes(childPermissionId)) {
      this.childPermissionIds.push(childPermissionId);
      this.updatePermissionTimestamp();
    }
  }

  /**
   * @method removeChildPermission
   * @description 移除子权限
   * @param childPermissionId 子权限ID
   */
  removeChildPermission(childPermissionId: string): void {
    const index = this.childPermissionIds.indexOf(childPermissionId);
    if (index > -1) {
      this.childPermissionIds.splice(index, 1);
      this.updatePermissionTimestamp();
    }
  }

  /**
   * @method isExpired
   * @description 检查权限是否过期
   * @returns {boolean} 是否过期
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }

  /**
   * @method canBeUsed
   * @description 检查权限是否可以使用
   * @returns {boolean} 是否可以使用
   */
  canBeUsed(): boolean {
    return this.status.isActive() && !this.isExpired();
  }

  /**
   * @method isActive
   * @description 检查权限是否激活
   * @returns {boolean} 是否激活
   */
  isActive(): boolean {
    return this.status.isActive();
  }

  /**
   * @method isSuspended
   * @description 检查权限是否暂停
   * @returns {boolean} 是否暂停
   */
  isSuspended(): boolean {
    return this.status.isSuspended();
  }

  /**
   * @method getName
   * @description 获取权限名称
   * @returns {string} 权限名称
   */
  getName(): string {
    return this.name.getValue();
  }

  /**
   * @method getCode
   * @description 获取权限代码
   * @returns {string} 权限代码
   */
  getCode(): string {
    return this.code.getValue();
  }

  /**
   * @method getStatus
   * @description 获取权限状态
   * @returns {string} 权限状态
   */
  getStatus(): string {
    return this.status.getValue();
  }

  /**
   * @method getStatusDisplayName
   * @description 获取权限状态显示名称
   * @returns {string} 状态显示名称
   */
  getStatusDisplayName(): string {
    return this.status.getDisplayName();
  }

  /**
   * @method getStatusDescription
   * @description 获取权限状态描述
   * @returns {string} 状态描述
   */
  getStatusDescription(): string {
    return this.status.getDescription();
  }

  /**
   * @method getType
   * @description 获取权限类型
   * @returns {string} 权限类型
   */
  getType(): string {
    return this.type.getValue();
  }

  /**
   * @method getTypeDisplayName
   * @description 获取权限类型显示名称
   * @returns {string} 类型显示名称
   */
  getTypeDisplayName(): string {
    return this.type.getDisplayName();
  }

  /**
   * @method getTypeDescription
   * @description 获取权限类型描述
   * @returns {string} 类型描述
   */
  getTypeDescription(): string {
    return this.type.getDescription();
  }

  /**
   * @method getAction
   * @description 获取权限操作
   * @returns {string} 权限操作
   */
  getAction(): string {
    return this.action.getValue();
  }

  /**
   * @method getActionDisplayName
   * @description 获取权限操作显示名称
   * @returns {string} 操作显示名称
   */
  getActionDisplayName(): string {
    return this.action.getDisplayName();
  }

  /**
   * @method getActionDescription
   * @description 获取权限操作描述
   * @returns {string} 操作描述
   */
  getActionDescription(): string {
    return this.action.getDescription();
  }

  /**
   * @method getIsSystemPermission
   * @description 获取是否为系统权限
   * @returns {boolean} 是否为系统权限
   */
  getIsSystemPermission(): boolean {
    return this.isSystemPermission;
  }

  /**
   * @method getIsDefaultPermission
   * @description 获取是否为默认权限
   * @returns {boolean} 是否为默认权限
   */
  getIsDefaultPermission(): boolean {
    return this.isDefaultPermission;
  }

  /**
   * @method addDomainEvent
   * @description 添加领域事件
   * @param event 领域事件
   */
  addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  /**
   * @method clearDomainEvents
   * @description 清除领域事件
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * @method getDomainEvents
   * @description 获取领域事件列表
   * @returns {any[]} 领域事件列表
   */
  getDomainEvents(): any[] {
    return [...this._domainEvents];
  }

  /**
   * @method hasDomainEvents
   * @description 检查是否有领域事件
   * @returns {boolean} 是否有领域事件
   */
  hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  /**
   * @method updatePermissionTimestamp
   * @description 更新权限时间戳
   */
  private updatePermissionTimestamp(): void {
    this.updatedAt = new Date();
  }
} 