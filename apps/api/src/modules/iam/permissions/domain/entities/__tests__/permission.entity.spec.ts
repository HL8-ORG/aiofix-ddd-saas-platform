import { Permission } from '../permission.entity';
import { PermissionType } from '../../value-objects/permission-type.value-object';
import { PermissionAction } from '../../value-objects/permission-action.value-object';
import { PermissionStatus } from '../../value-objects/permission-status.value-object';
import { PermissionConditionData } from '../../value-objects/permission-condition.value-object';
import { generateUuid } from '@/shared/domain/utils/uuid.util';

describe('Permission', () => {
  let permission: Permission;
  const tenantId = generateUuid();
  const adminUserId = generateUuid();

  beforeEach(() => {
    permission = new Permission(
      generateUuid(),
      '用户管理权限',
      'USER_MANAGE',
      PermissionType.API,
      PermissionAction.MANAGE,
      tenantId,
      adminUserId,
      '管理用户相关的所有操作',
      undefined,
      'user',
      'iam',
      false,
      false
    );
  });

  describe('constructor', () => {
    it('应该成功创建权限实体', () => {
      expect(permission.getName()).toBe('用户管理权限');
      expect(permission.getCode()).toBe('USER_MANAGE');
      expect(permission.getType()).toBe(PermissionType.API);
      expect(permission.getAction()).toBe(PermissionAction.MANAGE);
      expect(permission.tenantId).toBe(tenantId);
      expect(permission.adminUserId).toBe(adminUserId);
      expect(permission.description).toBe('管理用户相关的所有操作');
      expect(permission.resource).toBe('user');
      expect(permission.module).toBe('iam');
      expect(permission.getIsSystemPermission()).toBe(false);
      expect(permission.getIsDefaultPermission()).toBe(false);
      expect(permission.getStatus()).toBe(PermissionStatus.ACTIVE);
    });

    it('应该创建系统权限', () => {
      const systemPermission = new Permission(
        generateUuid(),
        '系统管理权限',
        'SYSTEM_ADMIN',
        PermissionType.API,
        PermissionAction.MANAGE,
        tenantId,
        adminUserId,
        '系统级管理权限',
        undefined,
        'system',
        'iam',
        true,
        false
      );

      expect(systemPermission.getIsSystemPermission()).toBe(true);
      expect(systemPermission.getIsDefaultPermission()).toBe(false);
    });

    it('应该创建默认权限', () => {
      const defaultPermission = new Permission(
        generateUuid(),
        '读取权限',
        'USER_READ',
        PermissionType.API,
        PermissionAction.READ,
        tenantId,
        adminUserId,
        '读取用户信息',
        undefined,
        'user',
        'iam',
        false,
        true
      );

      expect(defaultPermission.getIsSystemPermission()).toBe(false);
      expect(defaultPermission.getIsDefaultPermission()).toBe(true);
    });

    it('应该添加权限创建事件', () => {
      expect(permission.hasDomainEvents()).toBe(true);
      const events = permission.getDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0].constructor.name).toBe('PermissionCreatedEvent');
    });
  });

  describe('status management', () => {
    it('应该激活权限', () => {
      permission.suspend();
      expect(permission.isSuspended()).toBe(true);

      permission.activate();
      expect(permission.isActive()).toBe(true);
      expect(permission.getStatus()).toBe(PermissionStatus.ACTIVE);

      const events = permission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionActivatedEvent');
    });

    it('应该暂停权限', () => {
      permission.suspend();
      expect(permission.isSuspended()).toBe(true);
      expect(permission.getStatus()).toBe(PermissionStatus.SUSPENDED);

      const events = permission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionSuspendedEvent');
    });

    it('应该标记权限为已删除', () => {
      permission.markAsDeleted();
      expect(permission.getStatus()).toBe(PermissionStatus.INACTIVE);

      const events = permission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionDeletedEvent');
    });

    it('应该恢复权限', () => {
      permission.markAsDeleted();
      expect(permission.getStatus()).toBe(PermissionStatus.INACTIVE);

      permission.restore();
      expect(permission.isActive()).toBe(true);
      expect(permission.getStatus()).toBe(PermissionStatus.ACTIVE);

      const events = permission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionRestoredEvent');
    });

    it('应该拒绝在错误状态下激活权限', () => {
      expect(() => permission.activate()).toThrow('当前状态无法激活权限');
    });

    it('应该拒绝在错误状态下暂停权限', () => {
      permission.suspend();
      expect(() => permission.suspend()).toThrow('当前状态无法暂停权限');
    });
  });

  describe('info management', () => {
    it('应该更新权限基本信息', () => {
      permission.updateInfo('新权限名称', 'NEW_PERMISSION', '新描述', 'new-resource', 'new-module');

      expect(permission.getName()).toBe('新权限名称');
      expect(permission.getCode()).toBe('NEW_PERMISSION');
      expect(permission.description).toBe('新描述');
      expect(permission.resource).toBe('new-resource');
      expect(permission.module).toBe('new-module');

      const events = permission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionInfoUpdatedEvent');
    });

    it('应该更新权限操作', () => {
      permission.updateAction(PermissionAction.CREATE);

      expect(permission.getAction()).toBe(PermissionAction.CREATE);
      expect(permission.getActionDisplayName()).toBe('创建');

      const events = permission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionActionUpdatedEvent');
    });
  });

  describe('conditions management', () => {
    it('应该设置权限条件', () => {
      const conditions: PermissionConditionData[] = [
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'type', operator: 'in', value: ['user', 'admin'] }
      ];

      permission.setConditions(conditions);

      expect(permission.conditions).toBeDefined();
      expect(permission.conditions?.getConditionCount()).toBe(2);

      const events = permission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionConditionUpdatedEvent');
    });

    it('应该清除权限条件', () => {
      const conditions: PermissionConditionData[] = [
        { field: 'status', operator: 'eq', value: 'active' }
      ];
      permission.setConditions(conditions);
      expect(permission.conditions).toBeDefined();

      permission.clearConditions();
      expect(permission.conditions).toBeUndefined();

      const events = permission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionConditionUpdatedEvent');
    });

    it('应该拒绝为不支持条件的权限类型设置条件', () => {
      const menuPermission = new Permission(
        generateUuid(),
        '菜单权限',
        'MENU_ACCESS',
        PermissionType.MENU,
        PermissionAction.READ,
        tenantId,
        adminUserId
      );

      const conditions: PermissionConditionData[] = [
        { field: 'status', operator: 'eq', value: 'active' }
      ];

      expect(() => menuPermission.setConditions(conditions)).toThrow('当前权限类型不支持条件设置');
    });
  });

  describe('fields management', () => {
    it('应该设置权限字段', () => {
      const dataPermission = new Permission(
        generateUuid(),
        '数据权限',
        'DATA_ACCESS',
        PermissionType.DATA,
        PermissionAction.READ,
        tenantId,
        adminUserId
      );

      const fields = ['id', 'name', 'email'];
      dataPermission.setFields(fields);

      expect(dataPermission.fields).toEqual(fields);

      const events = dataPermission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionFieldsUpdatedEvent');
    });

    it('应该添加权限字段', () => {
      const dataPermission = new Permission(
        generateUuid(),
        '数据权限',
        'DATA_ACCESS',
        PermissionType.DATA,
        PermissionAction.READ,
        tenantId,
        adminUserId
      );

      dataPermission.addField('id');
      expect(dataPermission.fields).toContain('id');

      dataPermission.addField('name');
      expect(dataPermission.fields).toContain('name');

      const events = dataPermission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionFieldsUpdatedEvent');
    });

    it('应该移除权限字段', () => {
      const dataPermission = new Permission(
        generateUuid(),
        '数据权限',
        'DATA_ACCESS',
        PermissionType.DATA,
        PermissionAction.READ,
        tenantId,
        adminUserId
      );

      dataPermission.setFields(['id', 'name', 'email']);
      expect(dataPermission.fields).toContain('name');

      dataPermission.removeField('name');
      expect(dataPermission.fields).not.toContain('name');

      const events = dataPermission.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('PermissionFieldsUpdatedEvent');
    });

    it('应该拒绝为不支持字段的权限类型设置字段', () => {
      const menuPermission = new Permission(
        generateUuid(),
        '菜单权限',
        'MENU_ACCESS',
        PermissionType.MENU,
        PermissionAction.READ,
        tenantId,
        adminUserId
      );

      expect(() => menuPermission.setFields(['id'])).toThrow('当前权限类型不支持字段设置');
    });
  });

  describe('role management', () => {
    it('应该分配权限给角色', () => {
      const roleId = generateUuid();
      permission.assignToRole(roleId);

      expect(permission.hasRole(roleId)).toBe(true);
      expect(permission.getRoleIds()).toContain(roleId);
    });

    it('应该从角色移除权限', () => {
      const roleId = generateUuid();
      permission.assignToRole(roleId);
      expect(permission.hasRole(roleId)).toBe(true);

      permission.removeFromRole(roleId);
      expect(permission.hasRole(roleId)).toBe(false);
      expect(permission.getRoleIds()).not.toContain(roleId);
    });

    it('应该获取角色ID列表', () => {
      const roleId1 = generateUuid();
      const roleId2 = generateUuid();

      permission.assignToRole(roleId1);
      permission.assignToRole(roleId2);

      const roleIds = permission.getRoleIds();
      expect(roleIds).toContain(roleId1);
      expect(roleIds).toContain(roleId2);
      expect(roleIds.length).toBe(2);
    });
  });

  describe('inheritance management', () => {
    it('应该设置父权限', () => {
      const parentPermissionId = generateUuid();
      permission.setParentPermission(parentPermissionId);

      expect(permission.parentPermissionId).toBe(parentPermissionId);
    });

    it('应该移除父权限', () => {
      const parentPermissionId = generateUuid();
      permission.setParentPermission(parentPermissionId);
      expect(permission.parentPermissionId).toBe(parentPermissionId);

      permission.removeParentPermission();
      expect(permission.parentPermissionId).toBeUndefined();
    });

    it('应该添加子权限', () => {
      const childPermissionId = generateUuid();
      permission.addChildPermission(childPermissionId);

      expect(permission.childPermissionIds).toContain(childPermissionId);
    });

    it('应该移除子权限', () => {
      const childPermissionId = generateUuid();
      permission.addChildPermission(childPermissionId);
      expect(permission.childPermissionIds).toContain(childPermissionId);

      permission.removeChildPermission(childPermissionId);
      expect(permission.childPermissionIds).not.toContain(childPermissionId);
    });
  });

  describe('expiration management', () => {
    it('应该检查权限是否过期', () => {
      expect(permission.isExpired()).toBe(false);

      const expiredPermission = new Permission(
        generateUuid(),
        '过期权限',
        'EXPIRED_PERMISSION',
        PermissionType.API,
        PermissionAction.READ,
        tenantId,
        adminUserId,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        false,
        undefined,
        undefined,
        new Date(Date.now() - 1000) // 过期时间
      );

      expect(expiredPermission.isExpired()).toBe(true);
    });

    it('应该检查权限是否可以使用', () => {
      expect(permission.canBeUsed()).toBe(true);

      permission.suspend();
      expect(permission.canBeUsed()).toBe(false);

      permission.activate();
      expect(permission.canBeUsed()).toBe(true);
    });
  });

  describe('getter methods', () => {
    it('应该返回正确的状态信息', () => {
      expect(permission.getStatusDisplayName()).toBe('启用');
      expect(permission.getStatusDescription()).toBe('权限已启用，可以正常使用');
    });

    it('应该返回正确的类型信息', () => {
      expect(permission.getTypeDisplayName()).toBe('接口权限');
      expect(permission.getTypeDescription()).toBe('控制用户对后端接口的调用权限');
    });

    it('应该返回正确的操作信息', () => {
      expect(permission.getActionDisplayName()).toBe('管理');
      expect(permission.getActionDescription()).toBe('允许完全管理资源（包含所有操作）');
    });
  });

  describe('domain events', () => {
    it('应该管理领域事件', () => {
      expect(permission.hasDomainEvents()).toBe(true);

      const events = permission.getDomainEvents();
      expect(events.length).toBeGreaterThan(0);

      permission.clearDomainEvents();
      expect(permission.hasDomainEvents()).toBe(false);
      expect(permission.getDomainEvents().length).toBe(0);
    });
  });
}); 