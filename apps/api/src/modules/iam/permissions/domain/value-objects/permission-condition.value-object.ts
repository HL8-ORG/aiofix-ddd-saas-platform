import { ValueObject } from '@/shared/domain/value-objects/value-object.base';

/**
 * @interface PermissionConditionData
 * @description 权限条件数据结构
 */
export interface PermissionConditionData {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex';
  value: any;
  logicalOperator?: 'and' | 'or';
}

/**
 * @class PermissionCondition
 * @description
 * 权限条件值对象，封装权限条件的验证规则和业务逻辑。
 * 基于CASL的Condition概念，支持复杂的条件表达式。
 * 
 * 主要原理与机制：
 * 1. 继承ValueObject基类，确保值对象的不可变性
 * 2. 实现权限条件的验证规则和业务逻辑
 * 3. 支持多种操作符和逻辑运算符
 * 4. 提供条件表达式的序列化和反序列化
 */
export class PermissionCondition extends ValueObject<PermissionConditionData[]> {
  /**
   * @constructor
   * @description 创建权限条件值对象
   * @param conditions 权限条件数组
   * @throws {Error} 当权限条件无效时抛出异常
   */
  constructor(conditions: PermissionConditionData[]) {
    super();
    this.validateConditions(conditions);
    this._value = conditions;
  }

  /**
   * @method getValue
   * @description 获取权限条件值
   * @returns {PermissionConditionData[]} 权限条件数组
   */
  getValue(): PermissionConditionData[] {
    return this._value;
  }

  /**
   * @method getConditions
   * @description 获取权限条件数组
   * @returns {PermissionConditionData[]} 权限条件数组
   */
  getConditions(): PermissionConditionData[] {
    return [...this._value];
  }

  /**
   * @method hasConditions
   * @description 检查是否有条件
   * @returns {boolean} 是否有条件
   */
  hasConditions(): boolean {
    return this._value.length > 0;
  }

  /**
   * @method getConditionCount
   * @description 获取条件数量
   * @returns {number} 条件数量
   */
  getConditionCount(): number {
    return this._value.length;
  }

  /**
   * @method getFields
   * @description 获取所有涉及的字段
   * @returns {string[]} 字段数组
   */
  getFields(): string[] {
    return [...new Set(this._value.map(condition => condition.field))];
  }

  /**
   * @method getOperators
   * @description 获取所有使用的操作符
   * @returns {string[]} 操作符数组
   */
  getOperators(): string[] {
    return [...new Set(this._value.map(condition => condition.operator))];
  }

  /**
   * @method isComplex
   * @description 检查是否为复杂条件（多个条件）
   * @returns {boolean} 是否为复杂条件
   */
  isComplex(): boolean {
    return this._value.length > 1;
  }

  /**
   * @method hasLogicalOperator
   * @description 检查是否包含逻辑运算符
   * @returns {boolean} 是否包含逻辑运算符
   */
  hasLogicalOperator(): boolean {
    return this._value.some(condition => condition.logicalOperator);
  }

  /**
   * @method toCaslCondition
   * @description 转换为CASL条件格式
   * @returns {object} CASL条件对象
   */
  toCaslCondition(): object {
    if (this._value.length === 0) {
      return {};
    }

    if (this._value.length === 1) {
      const condition = this._value[0];
      return {
        [condition.field]: this.convertOperator(condition.operator, condition.value)
      };
    }

    // 处理多个条件
    const conditions = this._value.map(condition => ({
      [condition.field]: this.convertOperator(condition.operator, condition.value)
    }));

    // 如果有逻辑运算符，使用$or或$and
    const hasOr = this._value.some(condition => condition.logicalOperator === 'or');
    if (hasOr) {
      return { $or: conditions };
    }

    return { $and: conditions };
  }

  /**
   * @method convertOperator
   * @description 转换操作符为CASL格式
   * @param operator 操作符
   * @param value 值
   * @returns {object} CASL操作符对象
   */
  private convertOperator(operator: string, value: any): object {
    switch (operator) {
      case 'eq':
        return { $eq: value };
      case 'ne':
        return { $ne: value };
      case 'gt':
        return { $gt: value };
      case 'gte':
        return { $gte: value };
      case 'lt':
        return { $lt: value };
      case 'lte':
        return { $lte: value };
      case 'in':
        return { $in: Array.isArray(value) ? value : [value] };
      case 'nin':
        return { $nin: Array.isArray(value) ? value : [value] };
      case 'like':
        return { $regex: value, $options: 'i' };
      case 'regex':
        return { $regex: value };
      default:
        return { $eq: value };
    }
  }

  /**
   * @method validateConditions
   * @description 验证权限条件是否有效
   * @param conditions 权限条件数组
   * @throws {Error} 当权限条件无效时抛出异常
   */
  private validateConditions(conditions: PermissionConditionData[]): void {
    if (!Array.isArray(conditions)) {
      throw new Error('权限条件必须是数组格式');
    }

    for (const condition of conditions) {
      this.validateCondition(condition);
    }
  }

  /**
   * @method validateCondition
   * @description 验证单个权限条件
   * @param condition 权限条件
   * @throws {Error} 当权限条件无效时抛出异常
   */
  private validateCondition(condition: PermissionConditionData): void {
    if (!condition.field || typeof condition.field !== 'string') {
      throw new Error('权限条件字段不能为空且必须是字符串');
    }

    if (!condition.operator || !this.isValidOperator(condition.operator)) {
      throw new Error(`无效的操作符: ${condition.operator}`);
    }

    if (condition.value === undefined || condition.value === null) {
      throw new Error('权限条件值不能为空');
    }

    if (condition.logicalOperator && !['and', 'or'].includes(condition.logicalOperator)) {
      throw new Error(`无效的逻辑运算符: ${condition.logicalOperator}`);
    }
  }

  /**
   * @method isValidOperator
   * @description 检查操作符是否有效
   * @param operator 操作符
   * @returns {boolean} 操作符是否有效
   */
  private isValidOperator(operator: string): boolean {
    const validOperators = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'like', 'regex'];
    return validOperators.includes(operator);
  }

  /**
   * @method equals
   * @description 比较两个权限条件是否相等
   * @param other 另一个权限条件值对象
   * @returns {boolean} 是否相等
   */
  equals(other: PermissionCondition): boolean {
    if (!other) {
      return false;
    }
    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 权限条件字符串
   */
  toString(): string {
    return JSON.stringify(this._value);
  }

  /**
   * @static create
   * @description 创建权限条件
   * @param conditions 权限条件数组
   * @returns {PermissionCondition} 权限条件值对象
   */
  static create(conditions: PermissionConditionData[]): PermissionCondition {
    return new PermissionCondition(conditions);
  }

  /**
   * @static createSimple
   * @description 创建简单权限条件
   * @param field 字段名
   * @param operator 操作符
   * @param value 值
   * @returns {PermissionCondition} 权限条件值对象
   */
  static createSimple(field: string, operator: string, value: any): PermissionCondition {
    return new PermissionCondition([{ field, operator: operator as any, value }]);
  }

  /**
   * @static createEmpty
   * @description 创建空权限条件
   * @returns {PermissionCondition} 权限条件值对象
   */
  static createEmpty(): PermissionCondition {
    return new PermissionCondition([]);
  }
} 