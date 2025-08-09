/**
 * @enum UserStatusType
 * @description
 * 用户状态类型枚举，定义用户的所有可能状态。
 * 
 * 状态说明：
 * - PENDING: 待激活状态，用户已注册但尚未激活邮箱
 * - ACTIVE: 活跃状态，用户正常可用
 * - INACTIVE: 非活跃状态，用户被暂时禁用但可恢复
 * - LOCKED: 锁定状态，用户因安全原因被锁定
 * - SUSPENDED: 暂停状态，用户因违规被暂停使用
 * - DELETED: 删除状态，用户账户被软删除
 */
export enum UserStatusType {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

/**
 * @class UserStatus
 * @description
 * UserStatus值对象，封装用户状态及其转换规则。
 * 
 * 主要特点：
 * 1. 不可变性：一旦创建，状态值不可改变
 * 2. 状态验证：确保状态转换符合业务规则
 * 3. 转换规则：定义哪些状态可以转换到哪些状态
 * 
 * 使用场景：
 * 1. 用户状态管理
 * 2. 状态转换验证
 * 3. 权限控制
 */
export class UserStatus {
  /**
   * @private
   * @readonly
   * @description 存储用户状态值
   */
  private readonly value: UserStatusType;

  /**
   * @private
   * @readonly
   * @description 存储状态变更时间
   */
  private readonly changedAt: Date;

  /**
   * @private
   * @readonly
   * @description 存储状态变更原因
   */
  private readonly reason?: string;

  /**
   * 状态转换规则映射表
   * 定义每个状态可以转换到哪些状态
   */
  private static readonly TRANSITION_RULES: Record<UserStatusType, UserStatusType[]> = {
    [UserStatusType.PENDING]: [UserStatusType.ACTIVE, UserStatusType.DELETED],
    [UserStatusType.ACTIVE]: [UserStatusType.INACTIVE, UserStatusType.LOCKED, UserStatusType.SUSPENDED, UserStatusType.DELETED],
    [UserStatusType.INACTIVE]: [UserStatusType.ACTIVE, UserStatusType.DELETED],
    [UserStatusType.LOCKED]: [UserStatusType.ACTIVE, UserStatusType.DELETED],
    [UserStatusType.SUSPENDED]: [UserStatusType.ACTIVE, UserStatusType.DELETED],
    [UserStatusType.DELETED]: [], // 删除状态不能转换到其他状态
  };

  /**
   * @constructor
   * @description
   * 创建UserStatus值对象。
   * 
   * @param {UserStatusType} status - 用户状态
   * @param {string} [reason] - 状态变更原因
   * @param {Date} [changedAt] - 状态变更时间，默认为当前时间
   */
  constructor(status: UserStatusType, reason?: string, changedAt?: Date) {
    this.value = status;
    this.reason = reason;
    this.changedAt = changedAt || new Date();
  }

  /**
   * @static
   * @method pending
   * @description 创建待激活状态
   * @param {string} [reason] - 状态变更原因
   * @returns {UserStatus} 待激活状态的UserStatus对象
   */
  static pending(reason?: string): UserStatus {
    return new UserStatus(UserStatusType.PENDING, reason);
  }

  /**
   * @static
   * @method active
   * @description 创建活跃状态
   * @param {string} [reason] - 状态变更原因
   * @returns {UserStatus} 活跃状态的UserStatus对象
   */
  static active(reason?: string): UserStatus {
    return new UserStatus(UserStatusType.ACTIVE, reason);
  }

  /**
   * @static
   * @method inactive
   * @description 创建非活跃状态
   * @param {string} [reason] - 状态变更原因
   * @returns {UserStatus} 非活跃状态的UserStatus对象
   */
  static inactive(reason?: string): UserStatus {
    return new UserStatus(UserStatusType.INACTIVE, reason);
  }

  /**
   * @static
   * @method locked
   * @description 创建锁定状态
   * @param {string} [reason] - 状态变更原因
   * @returns {UserStatus} 锁定状态的UserStatus对象
   */
  static locked(reason?: string): UserStatus {
    return new UserStatus(UserStatusType.LOCKED, reason);
  }

  /**
   * @static
   * @method suspended
   * @description 创建暂停状态
   * @param {string} [reason] - 状态变更原因
   * @returns {UserStatus} 暂停状态的UserStatus对象
   */
  static suspended(reason?: string): UserStatus {
    return new UserStatus(UserStatusType.SUSPENDED, reason);
  }

  /**
   * @static
   * @method deleted
   * @description 创建删除状态
   * @param {string} [reason] - 状态变更原因
   * @returns {UserStatus} 删除状态的UserStatus对象
   */
  static deleted(reason?: string): UserStatus {
    return new UserStatus(UserStatusType.DELETED, reason);
  }

  /**
   * @method getValue
   * @description 获取状态值
   * @returns {UserStatusType} 用户状态值
   */
  getValue(): UserStatusType {
    return this.value;
  }

  /**
   * @method getChangedAt
   * @description 获取状态变更时间
   * @returns {Date} 状态变更时间
   */
  getChangedAt(): Date {
    return this.changedAt;
  }

  /**
   * @method getReason
   * @description 获取状态变更原因
   * @returns {string | undefined} 状态变更原因
   */
  getReason(): string | undefined {
    return this.reason;
  }

  /**
   * @method canTransitionTo
   * @description 检查是否可以转换到指定状态
   * @param {UserStatusType} targetStatus - 目标状态
   * @returns {boolean} 如果可以转换返回true，否则返回false
   */
  canTransitionTo(targetStatus: UserStatusType): boolean {
    const allowedTransitions = UserStatus.TRANSITION_RULES[this.value];
    return allowedTransitions.includes(targetStatus);
  }

  /**
   * @method isActive
   * @description 检查用户是否处于活跃状态
   * @returns {boolean} 如果是活跃状态返回true，否则返回false
   */
  isActive(): boolean {
    return this.value === UserStatusType.ACTIVE;
  }

  /**
   * @method isPending
   * @description 检查用户是否处于待激活状态
   * @returns {boolean} 如果是待激活状态返回true，否则返回false
   */
  isPending(): boolean {
    return this.value === UserStatusType.PENDING;
  }

  /**
   * @method isLocked
   * @description 检查用户是否被锁定
   * @returns {boolean} 如果被锁定返回true，否则返回false
   */
  isLocked(): boolean {
    return this.value === UserStatusType.LOCKED;
  }

  /**
   * @method isDeleted
   * @description 检查用户是否被删除
   * @returns {boolean} 如果被删除返回true，否则返回false
   */
  isDeleted(): boolean {
    return this.value === UserStatusType.DELETED;
  }

  /**
   * @method equals
   * @description 比较两个UserStatus值对象是否相等
   * @param {UserStatus} other - 待比较的另一个UserStatus值对象
   * @returns {boolean} 如果状态相等返回true，否则返回false
   */
  equals(other: UserStatus): boolean {
    if (!(other instanceof UserStatus)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * @method toString
   * @description 将UserStatus值对象转换为字符串
   * @returns {string} 状态的字符串表示
   */
  toString(): string {
    return this.value;
  }
}
