import { Test, TestingModule } from '@nestjs/testing';
import { RoleNotificationService } from '../external/role-notification.service';
import { Role } from '@/modules/iam/roles/domain/entities/role.entity';

describe('RoleNotificationService', () => {
  let service: RoleNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleNotificationService],
    }).compile();

    service = module.get<RoleNotificationService>(RoleNotificationService);
  });

  describe('notifyRoleCreated', () => {
    it('应该发送角色创建通知', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const adminUserId = 'admin-1';

      // 模拟console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.notifyRoleCreated(role, adminUserId);

      expect(consoleSpy).toHaveBeenCalledWith(
        '角色创建通知: 角色 测试角色 已创建，管理员: admin-1'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('notifyRoleUpdated', () => {
    it('应该发送角色更新通知', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const adminUserId = 'admin-1';
      const changes = { name: '旧名称', newName: '新名称' };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.notifyRoleUpdated(role, adminUserId, changes);

      expect(consoleSpy).toHaveBeenCalledWith(
        '角色更新通知: 角色 测试角色 已更新，管理员: admin-1，变更:',
        changes
      );

      consoleSpy.mockRestore();
    });
  });

  describe('notifyRoleDeleted', () => {
    it('应该发送角色删除通知', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const adminUserId = 'admin-1';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.notifyRoleDeleted(role, adminUserId);

      expect(consoleSpy).toHaveBeenCalledWith(
        '角色删除通知: 角色 测试角色 已删除，管理员: admin-1'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('notifyRoleStatusChanged', () => {
    it('应该发送角色状态变更通知', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const adminUserId = 'admin-1';
      const oldStatus = 'ACTIVE';
      const newStatus = 'SUSPENDED';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.notifyRoleStatusChanged(role, adminUserId, oldStatus, newStatus);

      expect(consoleSpy).toHaveBeenCalledWith(
        '角色状态变更通知: 角色 测试角色 状态从 ACTIVE 变更为 SUSPENDED，管理员: admin-1'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('notifyUserAssignedToRole', () => {
    it('应该发送用户分配通知', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const userId = 'user-1';
      const adminUserId = 'admin-1';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.notifyUserAssignedToRole(role, userId, adminUserId);

      expect(consoleSpy).toHaveBeenCalledWith(
        '用户分配通知: 用户 user-1 已分配到角色 测试角色，管理员: admin-1'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('notifyUserRemovedFromRole', () => {
    it('应该发送用户移除通知', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const userId = 'user-1';
      const adminUserId = 'admin-1';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.notifyUserRemovedFromRole(role, userId, adminUserId);

      expect(consoleSpy).toHaveBeenCalledWith(
        '用户移除通知: 用户 user-1 已从角色 测试角色 移除，管理员: admin-1'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('notifyPermissionAssignedToRole', () => {
    it('应该发送权限分配通知', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const permissionId = 'perm-1';
      const adminUserId = 'admin-1';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.notifyPermissionAssignedToRole(role, permissionId, adminUserId);

      expect(consoleSpy).toHaveBeenCalledWith(
        '权限分配通知: 权限 perm-1 已分配到角色 测试角色，管理员: admin-1'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('notifyPermissionRemovedFromRole', () => {
    it('应该发送权限移除通知', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const permissionId = 'perm-1';
      const adminUserId = 'admin-1';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.notifyPermissionRemovedFromRole(role, permissionId, adminUserId);

      expect(consoleSpy).toHaveBeenCalledWith(
        '权限移除通知: 权限 perm-1 已从角色 测试角色 移除，管理员: admin-1'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('private notification methods', () => {
    it('应该正确调用私有通知方法', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const adminUserId = 'admin-1';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // 测试角色创建通知
      await service.notifyRoleCreated(role, adminUserId);
      expect(consoleSpy).toHaveBeenCalledWith(
        '角色创建通知: 角色 测试角色 已创建，管理员: admin-1'
      );

      // 测试角色更新通知
      const changes = { description: '新描述' };
      await service.notifyRoleUpdated(role, adminUserId, changes);
      expect(consoleSpy).toHaveBeenCalledWith(
        '角色更新通知: 角色 测试角色 已更新，管理员: admin-1，变更:',
        changes
      );

      // 测试角色删除通知
      await service.notifyRoleDeleted(role, adminUserId);
      expect(consoleSpy).toHaveBeenCalledWith(
        '角色删除通知: 角色 测试角色 已删除，管理员: admin-1'
      );

      // 测试角色状态变更通知
      await service.notifyRoleStatusChanged(role, adminUserId, 'ACTIVE', 'SUSPENDED');
      expect(consoleSpy).toHaveBeenCalledWith(
        '角色状态变更通知: 角色 测试角色 状态从 ACTIVE 变更为 SUSPENDED，管理员: admin-1'
      );

      // 测试用户分配通知
      await service.notifyUserAssignedToRole(role, 'user-1', adminUserId);
      expect(consoleSpy).toHaveBeenCalledWith(
        '用户分配通知: 用户 user-1 已分配到角色 测试角色，管理员: admin-1'
      );

      // 测试用户移除通知
      await service.notifyUserRemovedFromRole(role, 'user-1', adminUserId);
      expect(consoleSpy).toHaveBeenCalledWith(
        '用户移除通知: 用户 user-1 已从角色 测试角色 移除，管理员: admin-1'
      );

      // 测试权限分配通知
      await service.notifyPermissionAssignedToRole(role, 'perm-1', adminUserId);
      expect(consoleSpy).toHaveBeenCalledWith(
        '权限分配通知: 权限 perm-1 已分配到角色 测试角色，管理员: admin-1'
      );

      // 测试权限移除通知
      await service.notifyPermissionRemovedFromRole(role, 'perm-1', adminUserId);
      expect(consoleSpy).toHaveBeenCalledWith(
        '权限移除通知: 权限 perm-1 已从角色 测试角色 移除，管理员: admin-1'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('应该在通知发送失败时正确处理错误', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const adminUserId = 'admin-1';

      // 模拟console.log抛出错误
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Notification error');
      });

      await expect(service.notifyRoleCreated(role, adminUserId)).rejects.toThrow('Notification error');

      consoleSpy.mockRestore();
    });
  });

  describe('notification content', () => {
    it('应该包含正确的通知内容', async () => {
      const role = new Role('role-1', '特殊角色', 'SPECIAL_ROLE', 'tenant-1', 'admin-1');
      const adminUserId = 'admin-1';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.notifyRoleCreated(role, adminUserId);

      const notificationCall = consoleSpy.mock.calls[0];
      expect(notificationCall[0]).toContain('特殊角色');
      expect(notificationCall[0]).toContain('admin-1');

      consoleSpy.mockRestore();
    });

    it('应该处理不同的角色状态', async () => {
      const role = new Role('role-1', '测试角色', 'TEST_ROLE', 'tenant-1', 'admin-1');
      const adminUserId = 'admin-1';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // 测试不同的状态变更
      await service.notifyRoleStatusChanged(role, adminUserId, 'ACTIVE', 'DELETED');
      expect(consoleSpy).toHaveBeenCalledWith(
        '角色状态变更通知: 角色 测试角色 状态从 ACTIVE 变更为 DELETED，管理员: admin-1'
      );

      await service.notifyRoleStatusChanged(role, adminUserId, 'SUSPENDED', 'ACTIVE');
      expect(consoleSpy).toHaveBeenCalledWith(
        '角色状态变更通知: 角色 测试角色 状态从 SUSPENDED 变更为 ACTIVE，管理员: admin-1'
      );

      consoleSpy.mockRestore();
    });
  });
}); 