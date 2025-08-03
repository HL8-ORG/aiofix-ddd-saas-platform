import { PermissionActionValue, PermissionAction } from '../permission-action.value-object';

describe('PermissionActionValue', () => {
  describe('constructor', () => {
    it('应该成功创建管理操作', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.MANAGE);
      expect(permissionAction.getValue()).toBe(PermissionAction.MANAGE);
    });

    it('应该成功创建创建操作', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.CREATE);
      expect(permissionAction.getValue()).toBe(PermissionAction.CREATE);
    });

    it('应该成功创建读取操作', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.READ);
      expect(permissionAction.getValue()).toBe(PermissionAction.READ);
    });

    it('应该成功创建更新操作', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.UPDATE);
      expect(permissionAction.getValue()).toBe(PermissionAction.UPDATE);
    });

    it('应该成功创建删除操作', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.DELETE);
      expect(permissionAction.getValue()).toBe(PermissionAction.DELETE);
    });
  });

  describe('validation', () => {
    it('应该拒绝无效的权限操作', () => {
      expect(() => new PermissionActionValue('invalid' as any)).toThrow('无效的权限操作: invalid');
    });
  });

  describe('getValue', () => {
    it('应该返回权限操作值', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.MANAGE);
      expect(permissionAction.getValue()).toBe(PermissionAction.MANAGE);
    });
  });

  describe('getDisplayName', () => {
    it('应该返回管理操作的显示名称', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.MANAGE);
      expect(permissionAction.getDisplayName()).toBe('管理');
    });

    it('应该返回创建操作的显示名称', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.CREATE);
      expect(permissionAction.getDisplayName()).toBe('创建');
    });

    it('应该返回读取操作的显示名称', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.READ);
      expect(permissionAction.getDisplayName()).toBe('读取');
    });

    it('应该返回更新操作的显示名称', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.UPDATE);
      expect(permissionAction.getDisplayName()).toBe('更新');
    });

    it('应该返回删除操作的显示名称', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.DELETE);
      expect(permissionAction.getDisplayName()).toBe('删除');
    });

    it('应该返回发布操作的显示名称', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.PUBLISH);
      expect(permissionAction.getDisplayName()).toBe('发布');
    });

    it('应该返回审批操作的显示名称', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.APPROVE);
      expect(permissionAction.getDisplayName()).toBe('审批');
    });
  });

  describe('getDescription', () => {
    it('应该返回管理操作的描述', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.MANAGE);
      expect(permissionAction.getDescription()).toBe('允许完全管理资源（包含所有操作）');
    });

    it('应该返回创建操作的描述', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.CREATE);
      expect(permissionAction.getDescription()).toBe('允许创建新的资源');
    });

    it('应该返回读取操作的描述', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.READ);
      expect(permissionAction.getDescription()).toBe('允许读取资源信息');
    });

    it('应该返回更新操作的描述', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.UPDATE);
      expect(permissionAction.getDescription()).toBe('允许更新现有资源');
    });

    it('应该返回删除操作的描述', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.DELETE);
      expect(permissionAction.getDescription()).toBe('允许删除资源');
    });
  });

  describe('action checking methods', () => {
    it('应该正确识别管理操作', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.MANAGE);
      expect(permissionAction.isManage()).toBe(true);
      expect(permissionAction.isCreate()).toBe(false);
      expect(permissionAction.isRead()).toBe(false);
      expect(permissionAction.isUpdate()).toBe(false);
      expect(permissionAction.isDelete()).toBe(false);
    });

    it('应该正确识别创建操作', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.CREATE);
      expect(permissionAction.isManage()).toBe(false);
      expect(permissionAction.isCreate()).toBe(true);
      expect(permissionAction.isRead()).toBe(false);
      expect(permissionAction.isUpdate()).toBe(false);
      expect(permissionAction.isDelete()).toBe(false);
    });

    it('应该正确识别读取操作', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.READ);
      expect(permissionAction.isManage()).toBe(false);
      expect(permissionAction.isCreate()).toBe(false);
      expect(permissionAction.isRead()).toBe(true);
      expect(permissionAction.isUpdate()).toBe(false);
      expect(permissionAction.isDelete()).toBe(false);
    });

    it('应该正确识别更新操作', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.UPDATE);
      expect(permissionAction.isManage()).toBe(false);
      expect(permissionAction.isCreate()).toBe(false);
      expect(permissionAction.isRead()).toBe(false);
      expect(permissionAction.isUpdate()).toBe(true);
      expect(permissionAction.isDelete()).toBe(false);
    });

    it('应该正确识别删除操作', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.DELETE);
      expect(permissionAction.isManage()).toBe(false);
      expect(permissionAction.isCreate()).toBe(false);
      expect(permissionAction.isRead()).toBe(false);
      expect(permissionAction.isUpdate()).toBe(false);
      expect(permissionAction.isDelete()).toBe(true);
    });
  });

  describe('business logic methods', () => {
    it('应该正确识别危险操作', () => {
      const manageAction = new PermissionActionValue(PermissionAction.MANAGE);
      const deleteAction = new PermissionActionValue(PermissionAction.DELETE);
      const rejectAction = new PermissionActionValue(PermissionAction.REJECT);
      const createAction = new PermissionActionValue(PermissionAction.CREATE);
      const readAction = new PermissionActionValue(PermissionAction.READ);

      expect(manageAction.isDangerous()).toBe(true);
      expect(deleteAction.isDangerous()).toBe(true);
      expect(rejectAction.isDangerous()).toBe(true);
      expect(createAction.isDangerous()).toBe(false);
      expect(readAction.isDangerous()).toBe(false);
    });

    it('应该正确判断是否需要确认', () => {
      const manageAction = new PermissionActionValue(PermissionAction.MANAGE);
      const deleteAction = new PermissionActionValue(PermissionAction.DELETE);
      const createAction = new PermissionActionValue(PermissionAction.CREATE);

      expect(manageAction.requiresConfirmation()).toBe(true);
      expect(deleteAction.requiresConfirmation()).toBe(true);
      expect(createAction.requiresConfirmation()).toBe(false);
    });
  });

  describe('equals', () => {
    it('应该正确比较两个相同的权限操作', () => {
      const action1 = new PermissionActionValue(PermissionAction.MANAGE);
      const action2 = new PermissionActionValue(PermissionAction.MANAGE);
      expect(action1.equals(action2)).toBe(true);
    });

    it('应该正确比较两个不同的权限操作', () => {
      const action1 = new PermissionActionValue(PermissionAction.MANAGE);
      const action2 = new PermissionActionValue(PermissionAction.CREATE);
      expect(action1.equals(action2)).toBe(false);
    });

    it('应该处理null比较', () => {
      const action1 = new PermissionActionValue(PermissionAction.MANAGE);
      expect(action1.equals(null as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('应该返回权限操作字符串', () => {
      const permissionAction = new PermissionActionValue(PermissionAction.MANAGE);
      expect(permissionAction.toString()).toBe(PermissionAction.MANAGE);
    });
  });

  describe('static factory methods', () => {
    it('应该通过静态方法创建管理操作', () => {
      const permissionAction = PermissionActionValue.getManage();
      expect(permissionAction.getValue()).toBe(PermissionAction.MANAGE);
      expect(permissionAction.isManage()).toBe(true);
    });

    it('应该通过静态方法创建创建操作', () => {
      const permissionAction = PermissionActionValue.getCreate();
      expect(permissionAction.getValue()).toBe(PermissionAction.CREATE);
      expect(permissionAction.isCreate()).toBe(true);
    });

    it('应该通过静态方法创建读取操作', () => {
      const permissionAction = PermissionActionValue.getRead();
      expect(permissionAction.getValue()).toBe(PermissionAction.READ);
      expect(permissionAction.isRead()).toBe(true);
    });

    it('应该通过静态方法创建更新操作', () => {
      const permissionAction = PermissionActionValue.getUpdate();
      expect(permissionAction.getValue()).toBe(PermissionAction.UPDATE);
      expect(permissionAction.isUpdate()).toBe(true);
    });

    it('应该通过静态方法创建删除操作', () => {
      const permissionAction = PermissionActionValue.getDelete();
      expect(permissionAction.getValue()).toBe(PermissionAction.DELETE);
      expect(permissionAction.isDelete()).toBe(true);
    });
  });
}); 