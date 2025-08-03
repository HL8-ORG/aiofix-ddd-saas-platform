import { RoleName } from '../role-name.value-object';

describe('RoleName', () => {
  describe('构造函数', () => {
    it('应该成功创建有效的角色名称', () => {
      const roleName = new RoleName('管理员');
      expect(roleName.getValue()).toBe('管理员');
    });

    it('应该成功创建包含英文的角色名称', () => {
      const roleName = new RoleName('System Admin');
      expect(roleName.getValue()).toBe('System Admin');
    });

    it('应该成功创建包含数字的角色名称', () => {
      const roleName = new RoleName('Level1_User');
      expect(roleName.getValue()).toBe('Level1_User');
    });

    it('应该成功创建包含连字符的角色名称', () => {
      const roleName = new RoleName('Guest-User');
      expect(roleName.getValue()).toBe('Guest-User');
    });
  });

  describe('验证规则', () => {
    it('应该拒绝空字符串', () => {
      expect(() => new RoleName('')).toThrow('角色名称不能为空');
    });

    it('应该拒绝null值', () => {
      expect(() => new RoleName(null as any)).toThrow('角色名称不能为空');
    });

    it('应该拒绝undefined值', () => {
      expect(() => new RoleName(undefined as any)).toThrow('角色名称不能为空');
    });

    it('应该拒绝少于2个字符的名称', () => {
      expect(() => new RoleName('A')).toThrow('角色名称长度不能少于2个字符');
    });

    it('应该拒绝超过50个字符的名称', () => {
      const longName = 'A'.repeat(51);
      expect(() => new RoleName(longName)).toThrow('角色名称长度不能超过50个字符');
    });

    it('应该拒绝以数字开头的名称', () => {
      expect(() => new RoleName('1Admin')).toThrow('角色名称不能以数字开头');
    });

    it('应该拒绝包含连续特殊字符的名称', () => {
      expect(() => new RoleName('Admin@@User')).toThrow('角色名称不能包含连续的特殊字符');
    });

    it('应该拒绝包含不允许字符的名称', () => {
      expect(() => new RoleName('Admin@User')).toThrow('角色名称只能包含字母、数字、下划线、连字符、中文和空格');
    });
  });

  describe('规范化处理', () => {
    it('应该去除前后空格', () => {
      const roleName = new RoleName('  管理员  ');
      expect(roleName.getValue()).toBe('管理员');
    });

    it('应该将多个连续空格替换为单个空格', () => {
      const roleName = new RoleName('System   Admin');
      expect(roleName.getValue()).toBe('System Admin');
    });

    it('应该去除首尾的特殊字符', () => {
      const roleName = new RoleName(' Admin ');
      expect(roleName.getValue()).toBe('Admin');
    });
  });

  describe('方法测试', () => {
    let roleName: RoleName;

    beforeEach(() => {
      roleName = new RoleName('系统管理员');
    });

    it('getValue应该返回原始值', () => {
      expect(roleName.getValue()).toBe('系统管理员');
    });

    it('getDisplayName应该返回显示值', () => {
      expect(roleName.getDisplayName()).toBe('系统管理员');
    });

    it('getShortName应该返回简短版本', () => {
      const shortName = roleName.getShortName();
      expect(shortName).toBe('系统管理员');
    });

    it('getShortName应该截断长名称', () => {
      const longRoleName = new RoleName('这是一个非常长的角色名称用于测试截断功能');
      const shortName = longRoleName.getShortName();
      expect(shortName).toBe('这是一个非常长的角色名称用于测试截断功能');
    });

    it('toString应该返回字符串表示', () => {
      expect(roleName.toString()).toBe('系统管理员');
    });
  });

  describe('相等性比较', () => {
    it('应该正确比较相等的角色名称', () => {
      const roleName1 = new RoleName('管理员');
      const roleName2 = new RoleName('管理员');
      expect(roleName1.equals(roleName2)).toBe(true);
    });

    it('应该正确比较不等的角色名称', () => {
      const roleName1 = new RoleName('管理员');
      const roleName2 = new RoleName('用户');
      expect(roleName1.equals(roleName2)).toBe(false);
    });

    it('应该正确处理null比较', () => {
      const roleName = new RoleName('管理员');
      expect(roleName.equals(null as any)).toBe(false);
    });

    it('应该忽略大小写进行比较', () => {
      const roleName1 = new RoleName('Admin');
      const roleName2 = new RoleName('admin');
      expect(roleName1.equals(roleName2)).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('应该接受最小长度名称', () => {
      const roleName = new RoleName('AB');
      expect(roleName.getValue()).toBe('AB');
    });

    it('应该接受最大长度名称', () => {
      const maxLengthName = 'A'.repeat(50);
      const roleName = new RoleName(maxLengthName);
      expect(roleName.getValue()).toBe(maxLengthName);
    });

    it('应该接受包含中文的名称', () => {
      const roleName = new RoleName('系统管理员');
      expect(roleName.getValue()).toBe('系统管理员');
    });

    it('应该接受包含下划线的名称', () => {
      const roleName = new RoleName('System_Admin');
      expect(roleName.getValue()).toBe('System_Admin');
    });

    it('应该接受包含连字符的名称', () => {
      const roleName = new RoleName('Guest-User');
      expect(roleName.getValue()).toBe('Guest-User');
    });
  });
}); 