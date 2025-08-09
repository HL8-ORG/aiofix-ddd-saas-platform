/**
 * @class BaseEntity
 * @description
 * 基础实体类，定义所有领域实体的通用属性和方法。
 * 该实体采用DDD设计模式，作为所有聚合根和实体的基类，
 * 提供ID、创建时间、更新时间、删除时间等通用属性，
 * 以及软删除、审计等通用方法。
 *
 * 主要原理与机制：
 * 1. 使用抽象类定义通用属性和方法，子类继承获得基础功能
 * 2. 提供软删除机制，通过deletedAt字段标记删除状态
 * 3. 支持审计功能，记录创建和更新时间
 * 4. 实现相等性比较，基于ID进行实体比较
 * 5. 提供克隆方法，支持实体的深度复制
 */
export abstract class BaseEntity {
  /**
   * @property id
   * @description 实体唯一标识符
   */
  id: string

  /**
   * @property createdAt
   * @description 创建时间
   */
  createdAt: Date

  /**
   * @property updatedAt
   * @description 更新时间
   */
  updatedAt: Date

  /**
   * @property deletedAt
   * @description 删除时间（软删除）
   */
  deletedAt?: Date

  /**
   * @property version
   * @description 实体版本号，用于乐观锁
   */
  version = 1

  /**
   * @property tenantId
   * @description 租户ID，用于多租户数据隔离
   */
  tenantId: string

  /**
   * @property createdBy
   * @description 创建者ID
   */
  createdBy?: string

  /**
   * @property updatedBy
   * @description 更新者ID
   */
  updatedBy?: string

  /**
   * @constructor
   * @description 构造函数，初始化基础属性
   */
  constructor(id?: string) {
    if (id) {
      this.id = id
    }
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  /**
   * @method isDeleted
   * @description 检查实体是否已被软删除
   * @returns {boolean} 是否已删除
   */
  isDeleted(): boolean {
    return this.deletedAt !== undefined && this.deletedAt !== null
  }

  /**
   * @method softDelete
   * @description 软删除实体
   * @param deletedBy {string} 删除者ID
   */
  softDelete(deletedBy?: string): void {
    this.deletedAt = new Date()
    this.updatedAt = new Date()
    this.updatedBy = deletedBy
  }

  /**
   * @method restore
   * @description 恢复已软删除的实体
   * @param restoredBy {string} 恢复者ID
   */
  restore(restoredBy?: string): void {
    this.deletedAt = undefined
    this.updatedAt = new Date()
    this.updatedBy = restoredBy
  }

  /**
   * @method updateVersion
   * @description 更新实体版本号
   */
  updateVersion(): void {
    this.version += 1
    this.updatedAt = new Date()
  }

  /**
   * @method markAsUpdated
   * @description 标记实体为已更新
   * @param updatedBy {string} 更新者ID
   */
  markAsUpdated(updatedBy?: string): void {
    this.updateVersion()
    this.updatedBy = updatedBy
  }

  /**
   * @method equals
   * @description 比较两个实体是否相等
   * @param other {BaseEntity} 另一个实体
   * @returns {boolean} 是否相等
   */
  equals(other: BaseEntity): boolean {
    if (other === null || other === undefined) {
      return false
    }
    if (this === other) {
      return true
    }
    return this.id === other.id && this.constructor === other.constructor
  }

  /**
   * @method clone
   * @description 克隆实体
   * @returns {BaseEntity} 克隆后的实体
   */
  clone(): BaseEntity {
    const cloned = Object.create(this.constructor.prototype)
    Object.assign(cloned, this)
    return cloned
  }

  /**
   * @method toJSON
   * @description 将实体转换为JSON对象
   * @returns {object} JSON对象
   */
  toJSON(): object {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      version: this.version,
      tenantId: this.tenantId,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
    }
  }

  /**
   * @method validate
   * @description 验证实体状态
   * @throws {Error} 验证失败时抛出异常
   */
  abstract validate(): void

  /**
   * @method getBusinessKey
   * @description 获取业务键，用于业务唯一性检查
   * @returns {string} 业务键
   */
  abstract getBusinessKey(): string
}
