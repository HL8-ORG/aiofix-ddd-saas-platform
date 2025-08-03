import { RoleStatusValue, RoleStatus } from '../role-status.value-object';

describe('RoleStatusValue', () => {
  describe('constructor', () => {
    it('应该成功创建激活状态', () => {
      const status = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(status.getValue()).toBe(RoleStatus.ACTIVE);
    });

    it('应该成功创建暂停状态', () => {
      const status = new RoleStatusValue(RoleStatus.SUSPENDED);
      expect(status.getValue()).toBe(RoleStatus.SUSPENDED);
    });

    it('应该成功创建删除状态', () => {
      const status = new RoleStatusValue(RoleStatus.DELETED);
      expect(status.getValue()).toBe(RoleStatus.DELETED);
    });
  });

  describe('validation', () => {
    it('应该拒绝无效的状态值', () => {
      expect(() => new RoleStatusValue('invalid' as RoleStatus)).toThrow('无效的角色状态');
    });

    it('应该拒绝null值', () => {
      expect(() => new RoleStatusValue(null as any)).toThrow('角色状态不能为空, 角色状态必须是字符串');
    });

    it('应该拒绝undefined值', () => {
      expect(() => new RoleStatusValue(undefined as any)).toThrow('角色状态不能为空, 角色状态必须是字符串');
    });
  });

  describe('methods', () => {
    it('getValue应该返回状态值', () => {
      const status = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(status.getValue()).toBe(RoleStatus.ACTIVE);
    });

    it('getDisplayName应该返回显示名称', () => {
      const status = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(status.getDisplayName()).toBe('激活');
    });

    it('getDescription应该返回描述', () => {
      const status = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(status.getDescription()).toBe('角色处于激活状态，可以正常分配给用户');
    });

    it('toString应该返回字符串表示', () => {
      const status = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(status.toString()).toBe(RoleStatus.ACTIVE);
    });
  });

  describe('status checks', () => {
    it('应该正确识别激活状态', () => {
      const activeStatus = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(activeStatus.isActive()).toBe(true);
    });

    it('应该正确识别暂停状态', () => {
      const suspendedStatus = new RoleStatusValue(RoleStatus.SUSPENDED);
      expect(suspendedStatus.isSuspended()).toBe(true);
    });

    it('应该正确识别删除状态', () => {
      const deletedStatus = new RoleStatusValue(RoleStatus.DELETED);
      expect(deletedStatus.isDeleted()).toBe(true);
    });
  });

  describe('status transitions', () => {
    it('应该检查是否可以激活', () => {
      const suspendedStatus = new RoleStatusValue(RoleStatus.SUSPENDED);
      expect(suspendedStatus.canActivate()).toBe(true);

      const activeStatus = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(activeStatus.canActivate()).toBe(false);
    });

    it('应该检查是否可以暂停', () => {
      const activeStatus = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(activeStatus.canSuspend()).toBe(true);

      const suspendedStatus = new RoleStatusValue(RoleStatus.SUSPENDED);
      expect(suspendedStatus.canSuspend()).toBe(false);
    });

    it('应该检查是否可以删除', () => {
      const activeStatus = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(activeStatus.canDelete()).toBe(true);

      const deletedStatus = new RoleStatusValue(RoleStatus.DELETED);
      expect(deletedStatus.canDelete()).toBe(false);
    });

    it('应该检查是否可以恢复', () => {
      const deletedStatus = new RoleStatusValue(RoleStatus.DELETED);
      expect(deletedStatus.canRestore()).toBe(true);

      const activeStatus = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(activeStatus.canRestore()).toBe(false);
    });
  });

  describe('user assignment', () => {
    it('应该检查是否可以分配给用户', () => {
      const activeStatus = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(activeStatus.canAssignToUser()).toBe(true);

      const suspendedStatus = new RoleStatusValue(RoleStatus.SUSPENDED);
      expect(suspendedStatus.canAssignToUser()).toBe(false);

      const deletedStatus = new RoleStatusValue(RoleStatus.DELETED);
      expect(deletedStatus.canAssignToUser()).toBe(false);
    });
  });

  describe('static methods', () => {
    it('应该创建激活状态', () => {
      const status = RoleStatusValue.active();
      expect(status.getValue()).toBe(RoleStatus.ACTIVE);
    });

    it('应该创建暂停状态', () => {
      const status = RoleStatusValue.suspended();
      expect(status.getValue()).toBe(RoleStatus.SUSPENDED);
    });

    it('应该创建删除状态', () => {
      const status = RoleStatusValue.deleted();
      expect(status.getValue()).toBe(RoleStatus.DELETED);
    });
  });

  describe('equality', () => {
    it('应该正确比较相等的状态', () => {
      const status1 = new RoleStatusValue(RoleStatus.ACTIVE);
      const status2 = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(status1.equals(status2)).toBe(true);
    });

    it('应该正确比较不等的状态', () => {
      const status1 = new RoleStatusValue(RoleStatus.ACTIVE);
      const status2 = new RoleStatusValue(RoleStatus.SUSPENDED);
      expect(status1.equals(status2)).toBe(false);
    });

    it('应该正确处理null比较', () => {
      const status = new RoleStatusValue(RoleStatus.ACTIVE);
      expect(status.equals(null as any)).toBe(false);
    });
  });

  describe('display names', () => {
    it('应该返回正确的显示名称', () => {
      expect(new RoleStatusValue(RoleStatus.ACTIVE).getDisplayName()).toBe('激活');
      expect(new RoleStatusValue(RoleStatus.SUSPENDED).getDisplayName()).toBe('禁用');
      expect(new RoleStatusValue(RoleStatus.DELETED).getDisplayName()).toBe('已删除');
    });
  });

  describe('descriptions', () => {
    it('应该返回正确的描述', () => {
      expect(new RoleStatusValue(RoleStatus.ACTIVE).getDescription()).toBe('角色处于激活状态，可以正常分配给用户');
      expect(new RoleStatusValue(RoleStatus.SUSPENDED).getDescription()).toBe('角色处于禁用状态，无法分配给新用户，但现有用户仍可使用');
      expect(new RoleStatusValue(RoleStatus.DELETED).getDescription()).toBe('角色已被删除，无法使用');
    });
  });
}); 