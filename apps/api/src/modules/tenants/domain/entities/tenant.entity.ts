import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { BaseEntity } from '../../../../shared/domain/entities/base.entity';
import { TenantName } from '../value-objects/tenant-name.value-object';
import { TenantCode } from '../value-objects/tenant-code.value-object';
import { TenantStatusValue, TenantStatus } from '../value-objects/tenant-status.value-object';
import {
  TenantDomainEvent,
  TenantCreatedEvent,
  TenantActivatedEvent,
  TenantSuspendedEvent,
  TenantDeletedEvent,
  TenantSettingsUpdatedEvent
} from '../events/tenant.events';

/**
 * @class Tenant
 * @description
 * 租户领域实体，代表系统中的租户。
 * 这是一个纯领域对象，不包含任何ORM装饰器或数据库依赖。
 * 使用值对象来封装业务概念，提升领域模型的表达力。
 * 
 * 主要原理与机制：
 * 1. 继承BaseEntity获得通用属性和方法
 * 2. 使用值对象封装业务概念（名称、编码、状态）
 * 3. 使用class-validator进行数据校验，确保业务规则的正确性
 * 4. 使用class-transformer控制序列化安全性
 * 5. 实现租户特有的业务逻辑和状态管理
 * 6. 通过值对象确保业务规则的一致性和不可变性
 */
export class Tenant extends BaseEntity {
  /**
   * @property domainEvents
   * @description 领域事件集合
   */
  private _domainEvents: TenantDomainEvent[] = [];

  /**
   * @property name
   * @description 租户名称值对象
   */
  @Expose()
  name: TenantName;

  /**
   * @property code
   * @description 租户编码值对象
   */
  @Expose()
  code: TenantCode;

  /**
   * @property status
   * @description 租户状态值对象
   */
  @Expose()
  status: TenantStatusValue;

  /**
   * @property adminUserId
   * @description 租户管理员用户ID
   */
  @IsUUID(undefined, { message: '管理员用户ID格式无效' })
  @Expose()
  adminUserId: string;

  /**
   * @property description
   * @description 租户描述，可选
   */
  @IsOptional()
  @IsString({ message: '租户描述必须是字符串' })
  @MaxLength(500, { message: '租户描述不能超过500个字符' })
  @Expose()
  description?: string;

  /**
   * @property settings
   * @description 租户自定义配置，JSON格式
   */
  @IsOptional()
  @Expose()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value || {};
  })
  settings: Record<string, any>;

  /**
   * @constructor
   * @description 创建租户实例
   */
  constructor(
    id: string,
    name: string,
    code: string,
    adminUserId: string,
    description?: string,
    settings?: Record<string, any>
  ) {
    super();
    this.id = id;
    this.name = new TenantName(name);
    this.code = new TenantCode(code);
    this.status = new TenantStatusValue(TenantStatus.PENDING);
    this.adminUserId = adminUserId;
    this.description = description;
    this.settings = settings || {};
    this.createdAt = new Date();
    this.updatedAt = new Date();

    // 添加租户创建事件
    this.addDomainEvent(new TenantCreatedEvent(this));
  }

  /**
   * @method activate
   * @description 激活租户
   * @throws {Error} 当租户无法激活时抛出异常
   */
  activate(): void {
    if (!this.status.canActivate()) {
      throw new Error(`租户当前状态为${this.status.getDisplayName()}，无法激活`);
    }
    this.status = new TenantStatusValue(TenantStatus.ACTIVE);
    this.updateTimestamp();

    // 添加租户激活事件
    this.addDomainEvent(new TenantActivatedEvent(this));
  }

  /**
   * @method suspend
   * @description 禁用租户
   * @throws {Error} 当租户无法禁用时抛出异常
   */
  suspend(): void {
    if (!this.status.canSuspend()) {
      throw new Error(`租户当前状态为${this.status.getDisplayName()}，无法禁用`);
    }
    this.status = new TenantStatusValue(TenantStatus.SUSPENDED);
    this.updateTimestamp();

    // 添加租户暂停事件
    this.addDomainEvent(new TenantSuspendedEvent(this));
  }

  /**
   * @method isActive
   * @description 检查租户是否处于激活状态
   * @returns {boolean} 如果租户激活返回true，否则返回false
   */
  isActive(): boolean {
    return this.status.isActive() && !this.isDeleted();
  }

  /**
   * @method isSuspended
   * @description 检查租户是否被禁用
   * @returns {boolean} 如果租户被禁用返回true，否则返回false
   */
  isSuspended(): boolean {
    return this.status.isSuspended();
  }

  /**
   * @method updateSettings
   * @description 更新租户配置
   * @param settings 新的配置对象
   */
  updateSettings(settings: Record<string, any>): void {
    const oldSettings = { ...this.settings };
    this.settings = { ...this.settings, ...settings };
    this.updateTimestamp();

    // 添加租户配置更新事件
    this.addDomainEvent(new TenantSettingsUpdatedEvent(this, oldSettings, this.settings));
  }

  /**
   * @method getSetting
   * @description 获取指定配置项的值
   * @param key 配置键，支持点号分隔的嵌套路径
   * @param defaultValue 默认值
   * @returns 配置值或默认值
   */
  getSetting<T>(key: string, defaultValue?: T): T | undefined {
    if (!key) return defaultValue;

    // 处理嵌套路径，如 'ui.theme' 或 'features.notifications.email'
    const keys = key.split('.');
    let value: any = this.settings;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * @method updateInfo
   * @description 更新租户基本信息
   * @param name 租户名称
   * @param code 租户编码
   * @param description 租户描述
   */
  updateInfo(name: string, code: string, description?: string): void {
    this.name = new TenantName(name);
    this.code = new TenantCode(code);
    this.description = description;
    this.updateTimestamp();
  }

  /**
   * @method markAsDeleted
   * @description 标记租户为已删除状态
   * @throws {Error} 当租户无法删除时抛出异常
   */
  markAsDeleted(): void {
    if (!this.status.canDelete()) {
      throw new Error(`租户当前状态为${this.status.getDisplayName()}，无法删除`);
    }
    this.status = new TenantStatusValue(TenantStatus.DELETED);
    this.softDelete();

    // 添加租户删除事件
    this.addDomainEvent(new TenantDeletedEvent(this));
  }

  /**
   * @method restore
   * @description 恢复租户，从删除状态恢复
   * @throws {Error} 当租户无法恢复时抛出异常
   */
  restore(): void {
    if (!this.status.canRestore()) {
      throw new Error(`租户当前状态为${this.status.getDisplayName()}，无法恢复`);
    }
    this.status = new TenantStatusValue(TenantStatus.SUSPENDED);
    super.restore();
  }

  /**
   * @method getName
   * @description 获取租户名称字符串
   * @returns {string} 租户名称
   */
  getName(): string {
    return this.name.value;
  }

  /**
   * @method getCode
   * @description 获取租户编码字符串
   * @returns {string} 租户编码
   */
  getCode(): string {
    return this.code.value;
  }

  /**
   * @method getStatus
   * @description 获取租户状态字符串
   * @returns {string} 租户状态
   */
  getStatus(): string {
    return this.status.value;
  }

  /**
   * @method getStatusDisplayName
   * @description 获取租户状态的显示名称
   * @returns {string} 状态的显示名称
   */
  getStatusDisplayName(): string {
    return this.status.getDisplayName();
  }

  /**
   * @method getStatusDescription
   * @description 获取租户状态的描述信息
   * @returns {string} 状态的描述信息
   */
  getStatusDescription(): string {
    return this.status.getDescription();
  }

  /**
   * @method addDomainEvent
   * @description 添加领域事件
   * @param event 领域事件
   */
  addDomainEvent(event: TenantDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @method clearDomainEvents
   * @description 清空领域事件集合
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * @method getDomainEvents
   * @description 获取领域事件集合
   * @returns {TenantDomainEvent[]} 领域事件数组
   */
  getDomainEvents(): TenantDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @method hasDomainEvents
   * @description 检查是否有领域事件
   * @returns {boolean} 如果有领域事件返回true，否则返回false
   */
  hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }
} 