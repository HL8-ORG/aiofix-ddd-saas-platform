import { ValueObject } from '@/shared/domain/value-objects/value-object.base';

/**
 * @enum PermissionAction
 * @description 权限操作枚举，基于CASL的Action概念
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  EXECUTE = 'execute',
  VIEW = 'view',
  EDIT = 'edit',
  LIST = 'list',
  SEARCH = 'search',
  FILTER = 'filter',
  SORT = 'sort'
}

/**
 * @class PermissionActionValue
 * @description
 * 权限操作值对象，封装权限操作的验证规则和业务逻辑。
 * 基于CASL的Action概念，支持细粒度的权限控制。
 * 
 * 主要原理与机制：
 * 1. 继承ValueObject基类，确保值对象的不可变性
 * 2. 实现权限操作的验证规则和业务逻辑
 * 3. 提供操作显示名称和描述信息
 * 4. 支持CASL的Action概念，便于权限校验
 */
export class PermissionActionValue extends ValueObject<PermissionAction> {
  /**
   * @constructor
   * @description 创建权限操作值对象
   * @param action 权限操作
   * @throws {Error} 当权限操作无效时抛出异常
   */
  constructor(action: PermissionAction) {
    super();
    this.validateAction(action);
    this._value = action;
  }

  /**
   * @method getValue
   * @description 获取权限操作值
   * @returns {PermissionAction} 权限操作
   */
  getValue(): PermissionAction {
    return this._value;
  }

  /**
   * @method getDisplayName
   * @description 获取权限操作显示名称
   * @returns {string} 操作显示名称
   */
  getDisplayName(): string {
    switch (this._value) {
      case PermissionAction.CREATE:
        return '创建';
      case PermissionAction.READ:
        return '读取';
      case PermissionAction.UPDATE:
        return '更新';
      case PermissionAction.DELETE:
        return '删除';
      case PermissionAction.MANAGE:
        return '管理';
      case PermissionAction.PUBLISH:
        return '发布';
      case PermissionAction.UNPUBLISH:
        return '取消发布';
      case PermissionAction.APPROVE:
        return '审批';
      case PermissionAction.REJECT:
        return '拒绝';
      case PermissionAction.EXPORT:
        return '导出';
      case PermissionAction.IMPORT:
        return '导入';
      case PermissionAction.DOWNLOAD:
        return '下载';
      case PermissionAction.UPLOAD:
        return '上传';
      case PermissionAction.EXECUTE:
        return '执行';
      case PermissionAction.VIEW:
        return '查看';
      case PermissionAction.EDIT:
        return '编辑';
      case PermissionAction.LIST:
        return '列表';
      case PermissionAction.SEARCH:
        return '搜索';
      case PermissionAction.FILTER:
        return '筛选';
      case PermissionAction.SORT:
        return '排序';
      default:
        return '未知操作';
    }
  }

  /**
   * @method getDescription
   * @description 获取权限操作描述
   * @returns {string} 操作描述
   */
  getDescription(): string {
    switch (this._value) {
      case PermissionAction.CREATE:
        return '允许创建新的资源';
      case PermissionAction.READ:
        return '允许读取资源信息';
      case PermissionAction.UPDATE:
        return '允许更新现有资源';
      case PermissionAction.DELETE:
        return '允许删除资源';
      case PermissionAction.MANAGE:
        return '允许完全管理资源（包含所有操作）';
      case PermissionAction.PUBLISH:
        return '允许发布内容';
      case PermissionAction.UNPUBLISH:
        return '允许取消发布内容';
      case PermissionAction.APPROVE:
        return '允许审批流程';
      case PermissionAction.REJECT:
        return '允许拒绝流程';
      case PermissionAction.EXPORT:
        return '允许导出数据';
      case PermissionAction.IMPORT:
        return '允许导入数据';
      case PermissionAction.DOWNLOAD:
        return '允许下载文件';
      case PermissionAction.UPLOAD:
        return '允许上传文件';
      case PermissionAction.EXECUTE:
        return '允许执行操作';
      case PermissionAction.VIEW:
        return '允许查看内容';
      case PermissionAction.EDIT:
        return '允许编辑内容';
      case PermissionAction.LIST:
        return '允许查看列表';
      case PermissionAction.SEARCH:
        return '允许搜索功能';
      case PermissionAction.FILTER:
        return '允许筛选功能';
      case PermissionAction.SORT:
        return '允许排序功能';
      default:
        return '未知操作描述';
    }
  }

  /**
   * @method isManage
   * @description 检查是否为管理操作
   * @returns {boolean} 是否为管理操作
   */
  isManage(): boolean {
    return this._value === PermissionAction.MANAGE;
  }

  /**
   * @method isCreate
   * @description 检查是否为创建操作
   * @returns {boolean} 是否为创建操作
   */
  isCreate(): boolean {
    return this._value === PermissionAction.CREATE;
  }

  /**
   * @method isRead
   * @description 检查是否为读取操作
   * @returns {boolean} 是否为读取操作
   */
  isRead(): boolean {
    return this._value === PermissionAction.READ;
  }

  /**
   * @method isUpdate
   * @description 检查是否为更新操作
   * @returns {boolean} 是否为更新操作
   */
  isUpdate(): boolean {
    return this._value === PermissionAction.UPDATE;
  }

  /**
   * @method isDelete
   * @description 检查是否为删除操作
   * @returns {boolean} 是否为删除操作
   */
  isDelete(): boolean {
    return this._value === PermissionAction.DELETE;
  }

  /**
   * @method isDangerous
   * @description 检查是否为危险操作
   * @returns {boolean} 是否为危险操作
   */
  isDangerous(): boolean {
    return [
      PermissionAction.DELETE,
      PermissionAction.MANAGE,
      PermissionAction.REJECT
    ].includes(this._value);
  }

  /**
   * @method requiresConfirmation
   * @description 检查是否需要确认
   * @returns {boolean} 是否需要确认
   */
  requiresConfirmation(): boolean {
    return this.isDangerous();
  }

  /**
   * @method validateAction
   * @description 验证权限操作是否有效
   * @param action 权限操作
   * @throws {Error} 当权限操作无效时抛出异常
   */
  private validateAction(action: PermissionAction): void {
    if (!Object.values(PermissionAction).includes(action)) {
      throw new Error(`无效的权限操作: ${action}`);
    }
  }

  /**
   * @method equals
   * @description 比较两个权限操作是否相等
   * @param other 另一个权限操作值对象
   * @returns {boolean} 是否相等
   */
  equals(other: PermissionActionValue): boolean {
    if (!other) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 权限操作字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @static getManage
   * @description 获取管理操作
   * @returns {PermissionActionValue} 管理操作值对象
   */
  static getManage(): PermissionActionValue {
    return new PermissionActionValue(PermissionAction.MANAGE);
  }

  /**
   * @static getCreate
   * @description 获取创建操作
   * @returns {PermissionActionValue} 创建操作值对象
   */
  static getCreate(): PermissionActionValue {
    return new PermissionActionValue(PermissionAction.CREATE);
  }

  /**
   * @static getRead
   * @description 获取读取操作
   * @returns {PermissionActionValue} 读取操作值对象
   */
  static getRead(): PermissionActionValue {
    return new PermissionActionValue(PermissionAction.READ);
  }

  /**
   * @static getUpdate
   * @description 获取更新操作
   * @returns {PermissionActionValue} 更新操作值对象
   */
  static getUpdate(): PermissionActionValue {
    return new PermissionActionValue(PermissionAction.UPDATE);
  }

  /**
   * @static getDelete
   * @description 获取删除操作
   * @returns {PermissionActionValue} 删除操作值对象
   */
  static getDelete(): PermissionActionValue {
    return new PermissionActionValue(PermissionAction.DELETE);
  }
} 