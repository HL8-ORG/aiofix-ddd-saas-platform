/**
 * @class TenantSettingsUpdatedEvent
 * @description
 * 租户配置更新事件，当租户配置被更新时触发。该事件包含配置变更的详细信息，
 * 用于通知其他系统组件配置已变更，并触发相关的业务流程。
 *
 * 主要原理与机制：
 * 1. 继承BaseDomainEvent获得通用事件功能
 * 2. 包含配置变更的完整信息
 * 3. 支持事件路由和处理
 * 4. 提供事件元数据用于追踪
 */
import { BaseDomainEvent } from './base-domain-event'

/**
 * @interface TenantSettingsUpdatedEventData
 * @description 租户配置更新事件数据接口
 */
export interface TenantSettingsUpdatedEventData {
  /**
   * @property previousSettings
   * @description 更新前的配置
   */
  previousSettings: Record<string, any>

  /**
   * @property newSettings
   * @description 更新后的配置
   */
  newSettings: Record<string, any>

  /**
   * @property changedKeys
   * @description 变更的配置键列表
   */
  changedKeys: string[]

  /**
   * @property updatedBy
   * @description 更新者ID
   */
  updatedBy?: string

  /**
   * @property updateReason
   * @description 更新原因
   */
  updateReason?: string

  /**
   * @property updateTime
   * @description 更新时间
   */
  updateTime: Date
}

/**
 * @class TenantSettingsUpdatedEvent
 * @description 租户配置更新事件
 */
export class TenantSettingsUpdatedEvent extends BaseDomainEvent {
  /**
   * @property data
   * @description 事件数据
   */
  readonly data: TenantSettingsUpdatedEventData

  /**
   * @constructor
   * @description 构造函数
   * @param tenantId {string} 租户ID
   * @param previousSettings {Record<string, any>} 更新前的配置
   * @param newSettings {Record<string, any>} 更新后的配置
   * @param updatedBy {string} 更新者ID
   * @param updateReason {string} 更新原因
   * @param metadata {Record<string, any>} 事件元数据
   */
  constructor(
    tenantId: string,
    previousSettings: Record<string, any>,
    newSettings: Record<string, any>,
    updatedBy?: string,
    updateReason?: string,
    metadata: Record<string, any> = {},
  ) {
    super(tenantId, tenantId, metadata)

    const changedKeys = this.getChangedKeys(previousSettings, newSettings)

    this.data = {
      previousSettings,
      newSettings,
      changedKeys,
      updatedBy,
      updateReason,
      updateTime: new Date(),
    }

    // 添加默认元数据
    this.addMetadata('eventCategory', 'TENANT_CONFIGURATION')
    this.addMetadata('eventPriority', 'MEDIUM')
    this.addMetadata('requiresNotification', false)
    this.addMetadata('changedKeysCount', changedKeys.length)
    this.addMetadata('hasCriticalChanges', this.hasCriticalChanges(changedKeys))
  }

  /**
   * @method getPreviousSettings
   * @description 获取更新前的配置
   * @returns {Record<string, any>} 更新前的配置
   */
  getPreviousSettings(): Record<string, any> {
    return this.data.previousSettings
  }

  /**
   * @method getNewSettings
   * @description 获取更新后的配置
   * @returns {Record<string, any>} 更新后的配置
   */
  getNewSettings(): Record<string, any> {
    return this.data.newSettings
  }

  /**
   * @method getChangedKeysList
   * @description 获取变更的配置键列表
   * @returns {string[]} 变更的配置键列表
   */
  getChangedKeysList(): string[] {
    return this.data.changedKeys
  }

  /**
   * @method getUpdatedBy
   * @description 获取更新者ID
   * @returns {string | undefined} 更新者ID
   */
  getUpdatedBy(): string | undefined {
    return this.data.updatedBy
  }

  /**
   * @method getUpdateReason
   * @description 获取更新原因
   * @returns {string | undefined} 更新原因
   */
  getUpdateReason(): string | undefined {
    return this.data.updateReason
  }

  /**
   * @method getUpdateTime
   * @description 获取更新时间
   * @returns {Date} 更新时间
   */
  getUpdateTime(): Date {
    return this.data.updateTime
  }

  /**
   * @method getSettingValue
   * @description 获取指定配置键的新值
   * @param key {string} 配置键
   * @returns {any} 配置值
   */
  getSettingValue(key: string): any {
    return this.data.newSettings[key]
  }

  /**
   * @method getPreviousSettingValue
   * @description 获取指定配置键的旧值
   * @param key {string} 配置键
   * @returns {any} 配置值
   */
  getPreviousSettingValue(key: string): any {
    return this.data.previousSettings[key]
  }

  /**
   * @method hasSettingChanged
   * @description 检查指定配置键是否发生变更
   * @param key {string} 配置键
   * @returns {boolean} 是否发生变更
   */
  hasSettingChanged(key: string): boolean {
    return this.data.changedKeys.includes(key)
  }

  /**
   * @method getChangedSettings
   * @description 获取变更的配置键值对
   * @returns {Record<string, { old: any, new: any }>} 变更的配置键值对
   */
  getChangedSettings(): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {}

    for (const key of this.data.changedKeys) {
      changes[key] = {
        old: this.data.previousSettings[key],
        new: this.data.newSettings[key],
      }
    }

    return changes
  }

  /**
   * @method getChangedKeys
   * @description 获取变更的配置键列表
   * @param previousSettings {Record<string, any>} 更新前的配置
   * @param newSettings {Record<string, any>} 更新后的配置
   * @returns {string[]} 变更的配置键列表
   * @private
   */
  private getChangedKeys(
    previousSettings: Record<string, any>,
    newSettings: Record<string, any>,
  ): string[] {
    const allKeys = new Set([
      ...Object.keys(previousSettings),
      ...Object.keys(newSettings),
    ])
    const changedKeys: string[] = []

    for (const key of allKeys) {
      const oldValue = previousSettings[key]
      const newValue = newSettings[key]

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changedKeys.push(key)
      }
    }

    return changedKeys
  }

  /**
   * @method hasCriticalChanges
   * @description 检查是否有关键配置变更
   * @param changedKeys {string[]} 变更的配置键列表
   * @returns {boolean} 是否有关键配置变更
   * @private
   */
  private hasCriticalChanges(changedKeys: string[]): boolean {
    const criticalKeys = ['security', 'billing', 'limits', 'features']
    return changedKeys.some((key) => criticalKeys.includes(key))
  }

  /**
   * @method toJSON
   * @description 将事件转换为JSON对象
   * @returns {object} JSON对象
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      data: this.data,
    }
  }

  /**
   * @method toString
   * @description 将事件转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    const changesCount = this.data.changedKeys.length
    return `TenantSettingsUpdatedEvent(${this.aggregateId}, ${changesCount} settings changed)`
  }
}
