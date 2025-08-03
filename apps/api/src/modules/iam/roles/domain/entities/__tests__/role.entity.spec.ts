import { Role } from '../role.entity';
import { RoleStatus } from '../../value-objects/role-status.value-object';
import { generateUuid } from '@/shared/domain/utils/uuid.util';

describe('Role', () => {
  let role: Role;
  const tenantId = generateUuid();
  const adminUserId = generateUuid();

  beforeEach(() => {
    role = new Role(
      generateUuid(),
      '管理员',
      'ADMIN',
      tenantId,
      adminUserId,
      '系统管理员角色',
      undefined,
      10,
      false,
      false
    );
  });

  describe('constructor', () => {
    it('应该成功创建角色实体', () => {
      expect(role.getName()).toBe('管理员');
      expect(role.getCode()).toBe('ADMIN');
      expect(role.tenantId).toBe(tenantId);
      expect(role.adminUserId).toBe(adminUserId);
      expect(role.description).toBe('系统管理员角色');
      expect(role.getStatus()).toBe(RoleStatus.ACTIVE);
      expect(role.getIsSystemRole()).toBe(false);
      expect(role.getIsDefaultRole()).toBe(false);
      expect(role.getPriority()).toBe(10);
    });

    it('应该创建系统角色', () => {
      const systemRole = new Role(
        generateUuid(),
        '系统管理员',
        'SYSTEM_ADMIN',
        tenantId,
        adminUserId,
        '系统级管理员',
        undefined,
        1,
        true,
        false
      );

      expect(systemRole.getIsSystemRole()).toBe(true);
      expect(systemRole.getIsDefaultRole()).toBe(false);
    });

    it('应该创建默认角色', () => {
      const defaultRole = new Role(
        generateUuid(),
        '普通用户',
        'USER',
        tenantId,
        adminUserId,
        '默认用户角色',
        undefined,
        100,
        false,
        true
      );

      expect(defaultRole.getIsSystemRole()).toBe(false);
      expect(defaultRole.getIsDefaultRole()).toBe(true);
    });

    it('应该添加角色创建事件', () => {
      expect(role.hasDomainEvents()).toBe(true);
      const events = role.getDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0].constructor.name).toBe('RoleCreatedEvent');
    });
  });

  describe('status management', () => {
    it('应该激活角色', () => {
      role.suspend();
      expect(role.isSuspended()).toBe(true);

      role.activate();
      expect(role.isActive()).toBe(true);
      expect(role.getStatus()).toBe(RoleStatus.ACTIVE);

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RoleActivatedEvent');
    });

    it('应该暂停角色', () => {
      role.suspend();
      expect(role.isSuspended()).toBe(true);
      expect(role.getStatus()).toBe(RoleStatus.SUSPENDED);

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RoleSuspendedEvent');
    });

    it('应该标记角色为已删除', () => {
      role.markAsDeleted();
      expect(role.getStatus()).toBe(RoleStatus.DELETED);

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RoleDeletedEvent');
    });

    it('应该恢复角色', () => {
      role.markAsDeleted();
      expect(role.getStatus()).toBe(RoleStatus.DELETED);

      role.restore();
      expect(role.isSuspended()).toBe(true);
      expect(role.getStatus()).toBe(RoleStatus.SUSPENDED);

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RoleRestoredEvent');
    });

    it('应该拒绝在错误状态下激活角色', () => {
      expect(() => role.activate()).toThrow('角色当前状态为激活，无法激活');
    });

    it('应该拒绝在错误状态下暂停角色', () => {
      role.suspend();
      expect(() => role.suspend()).toThrow('角色当前状态为禁用，无法禁用');
    });
  });

  describe('info management', () => {
    it('应该更新角色基本信息', () => {
      role.updateInfo('新角色名称', 'NEW_ROLE', '新描述', 50);

      expect(role.getName()).toBe('新角色名称');
      expect(role.getCode()).toBe('NEW_ROLE');
      expect(role.description).toBe('新描述');
      expect(role.getPriority()).toBe(50);

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RoleInfoUpdatedEvent');
    });
  });

  describe('permission management', () => {
    it('应该分配权限给角色', () => {
      const permissionId = generateUuid();
      role.assignPermission(permissionId);

      expect(role.hasPermission(permissionId)).toBe(true);
      expect(role.getPermissionIds()).toContain(permissionId);

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RolePermissionAssignedEvent');
    });

    it('应该从角色移除权限', () => {
      const permissionId = generateUuid();
      role.assignPermission(permissionId);
      expect(role.hasPermission(permissionId)).toBe(true);

      role.removePermission(permissionId);
      expect(role.hasPermission(permissionId)).toBe(false);
      expect(role.getPermissionIds()).not.toContain(permissionId);

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RolePermissionRemovedEvent');
    });

    it('应该获取权限ID列表', () => {
      const permissionId1 = generateUuid();
      const permissionId2 = generateUuid();

      role.assignPermission(permissionId1);
      role.assignPermission(permissionId2);

      const permissionIds = role.getPermissionIds();
      expect(permissionIds).toContain(permissionId1);
      expect(permissionIds).toContain(permissionId2);
      expect(permissionIds.length).toBe(2);
    });
  });

  describe('user management', () => {
    it('应该分配用户给角色', () => {
      const userId = generateUuid();
      role.assignUser(userId);

      expect(role.hasUser(userId)).toBe(true);
      expect(role.getUserIds()).toContain(userId);

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RoleUserAssignedEvent');
    });

    it('应该从角色移除用户', () => {
      const userId = generateUuid();
      role.assignUser(userId);
      expect(role.hasUser(userId)).toBe(true);

      role.removeUser(userId);
      expect(role.hasUser(userId)).toBe(false);
      expect(role.getUserIds()).not.toContain(userId);

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RoleUserRemovedEvent');
    });

    it('应该获取用户ID列表', () => {
      const userId1 = generateUuid();
      const userId2 = generateUuid();

      role.assignUser(userId1);
      role.assignUser(userId2);

      const userIds = role.getUserIds();
      expect(userIds).toContain(userId1);
      expect(userIds).toContain(userId2);
      expect(userIds.length).toBe(2);
    });
  });

  describe('inheritance management', () => {
    it('应该设置父角色', () => {
      const parentRoleId = generateUuid();
      role.setInheritance(parentRoleId);

      expect(role.parentRoleId).toBe(parentRoleId);

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RoleInheritanceSetEvent');
    });

    it('应该移除父角色', () => {
      const parentRoleId = generateUuid();
      role.setInheritance(parentRoleId);
      expect(role.parentRoleId).toBe(parentRoleId);

      role.removeInheritance();
      expect(role.parentRoleId).toBeUndefined();

      const events = role.getDomainEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent.constructor.name).toBe('RoleInheritanceRemovedEvent');
    });

    it('应该添加子角色', () => {
      const childRoleId = generateUuid();
      role.addChildRole(childRoleId);

      expect(role.childRoleIds).toContain(childRoleId);
    });

    it('应该移除子角色', () => {
      const childRoleId = generateUuid();
      role.addChildRole(childRoleId);
      expect(role.childRoleIds).toContain(childRoleId);

      role.removeChildRole(childRoleId);
      expect(role.childRoleIds).not.toContain(childRoleId);
    });
  });

  describe('expiration management', () => {
    it('应该检查角色是否过期', () => {
      expect(role.isExpired()).toBe(false);

      const expiredRole = new Role(
        generateUuid(),
        '过期角色',
        'EXPIRED_ROLE',
        tenantId,
        adminUserId,
        undefined,
        undefined,
        100,
        false,
        false,
        undefined,
        new Date(Date.now() - 1000) // 过期时间
      );

      expect(expiredRole.isExpired()).toBe(true);
    });

    it('应该检查角色是否可以分配给用户', () => {
      expect(role.canAssignToUser()).toBe(true);

      role.suspend();
      expect(role.canAssignToUser()).toBe(false);

      role.activate();
      expect(role.canAssignToUser()).toBe(true);
    });
  });

  describe('getter methods', () => {
    it('应该返回正确的状态信息', () => {
      expect(role.getStatusDisplayName()).toBe('激活');
      expect(role.getStatusDescription()).toBe('角色处于激活状态，可以正常分配给用户');
    });

    it('应该返回正确的优先级信息', () => {
      expect(role.getPriorityDisplayName()).toBe('租户级');
      expect(role.getPriorityDescription()).toBe('租户级角色，拥有租户内最高权限，可管理租户内所有资源');
    });
  });

  describe('domain events', () => {
    it('应该管理领域事件', () => {
      expect(role.hasDomainEvents()).toBe(true);

      const events = role.getDomainEvents();
      expect(events.length).toBeGreaterThan(0);

      role.clearDomainEvents();
      expect(role.hasDomainEvents()).toBe(false);
      expect(role.getDomainEvents().length).toBe(0);
    });
  });
}); 