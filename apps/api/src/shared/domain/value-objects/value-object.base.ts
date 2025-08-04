/**
 * @abstract ValueObject
 * @description
 * 值对象基类，提供值对象的基础功能和抽象方法。
 *
 * 主要原理与机制：
 * 1. 值对象是不可变的，创建后不可修改
 * 2. 值对象通过值相等性进行比较
 * 3. 提供通用的序列化和反序列化方法
 * 4. 支持类型安全的操作
 * 5. 遵循DDD值对象设计原则
 */
export abstract class ValueObject<T> {
  protected _value!: T

  /**
   * @constructor
   * @description 创建值对象
   */
  constructor() {
    // 子类负责初始化 _value
  }

  /**
   * @method getValue
   * @description 获取值对象的值
   * @returns {T} 值对象的值
   */
  getValue(): T {
    return this._value
  }

  /**
   * @method equals
   * @description 比较两个值对象是否相等
   * @param other 另一个值对象
   * @returns {boolean} 是否相等
   */
  equals(other: ValueObject<T>): boolean {
    if (!other) {
      return false
    }
    return this._value === other._value
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return String(this._value)
  }

  /**
   * @method toJSON
   * @description 序列化为JSON
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify(this._value)
  }

  /**
   * @method clone
   * @description 克隆值对象
   * @returns {ValueObject<T>} 克隆的值对象
   */
  clone(): ValueObject<T> {
    return this.constructor.prototype.constructor(this._value)
  }
}
