import { TenantStatusValue, TenantStatus } from '../tenant-status.value-object';

/**
 * @describe TenantStatusValue值对象测试
 * @description
 * 测试TenantStatusValue值对象的业务规则和功能。
 * 
 * 测试覆盖范围：
 * 1. 构造函数验证
 * 2. 状态查询方法
 * 3. 状态转换验证
 * 4. 状态机逻辑
 * 5. 显示名称映射
 * 6. 相等性比较
 */
describe('TenantStatusValue', () => {
  /**
   * @test 正常创建测试
   * @description 测试正常情况下的租户状态创建
   */
  describe('正常创建', () => {
    it('应该成功创建待激活状态', () => {
      const status = new TenantStatusValue(TenantStatus.PENDING);
      expect(status.value).toBe(TenantStatus.PENDING);
    });

    it('应该成功创建激活状态', () => {
      const status = new TenantStatusValue(TenantStatus.ACTIVE);
      expect(status.value).toBe(TenantStatus.ACTIVE);
    });

    it('应该成功创建禁用状态', () => {
      const status = new TenantStatusValue(TenantStatus.SUSPENDED);
      expect(status.value).toBe(TenantStatus.SUSPENDED);
    });

    it('应该成功创建已删除状态', () => {
      const status = new TenantStatusValue(TenantStatus.DELETED);
      expect(status.value).toBe(TenantStatus.DELETED);
    });
  });

  /**
   * @test 状态查询测试
   * @description 测试各种状态查询方法
   */
  describe('状态查询', () => {
    it('isPending应该正确识别待激活状态', () => {
      const status = new TenantStatusValue(TenantStatus.PENDING);
      expect(status.isPending()).toBe(true);
      expect(status.isActive()).toBe(false);
      expect(status.isSuspended()).toBe(false);
      expect(status.isDeleted()).toBe(false);
    });

    it('isActive应该正确识别激活状态', () => {
      const status = new TenantStatusValue(TenantStatus.ACTIVE);
      expect(status.isPending()).toBe(false);
      expect(status.isActive()).toBe(true);
      expect(status.isSuspended()).toBe(false);
      expect(status.isDeleted()).toBe(false);
    });

    it('isSuspended应该正确识别禁用状态', () => {
      const status = new TenantStatusValue(TenantStatus.SUSPENDED);
      expect(status.isPending()).toBe(false);
      expect(status.isActive()).toBe(false);
      expect(status.isSuspended()).toBe(true);
      expect(status.isDeleted()).toBe(false);
    });

    it('isDeleted应该正确识别已删除状态', () => {
      const status = new TenantStatusValue(TenantStatus.DELETED);
      expect(status.isPending()).toBe(false);
      expect(status.isActive()).toBe(false);
      expect(status.isSuspended()).toBe(false);
      expect(status.isDeleted()).toBe(true);
    });
  });

  /**
   * @test 状态转换验证测试
   * @description 测试状态转换的合法性验证
   */
  describe('状态转换验证', () => {
    it('canActivate应该正确验证激活权限', () => {
      const pendingStatus = new TenantStatusValue(TenantStatus.PENDING);
      const suspendedStatus = new TenantStatusValue(TenantStatus.SUSPENDED);
      const activeStatus = new TenantStatusValue(TenantStatus.ACTIVE);
      const deletedStatus = new TenantStatusValue(TenantStatus.DELETED);

      expect(pendingStatus.canActivate()).toBe(true);
      expect(suspendedStatus.canActivate()).toBe(true);
      expect(activeStatus.canActivate()).toBe(false);
      expect(deletedStatus.canActivate()).toBe(false);
    });

    it('canSuspend应该正确验证禁用权限', () => {
      const pendingStatus = new TenantStatusValue(TenantStatus.PENDING);
      const activeStatus = new TenantStatusValue(TenantStatus.ACTIVE);
      const suspendedStatus = new TenantStatusValue(TenantStatus.SUSPENDED);
      const deletedStatus = new TenantStatusValue(TenantStatus.DELETED);

      expect(pendingStatus.canSuspend()).toBe(true);
      expect(activeStatus.canSuspend()).toBe(true);
      expect(suspendedStatus.canSuspend()).toBe(false);
      expect(deletedStatus.canSuspend()).toBe(false);
    });

    it('canDelete应该正确验证删除权限', () => {
      const pendingStatus = new TenantStatusValue(TenantStatus.PENDING);
      const activeStatus = new TenantStatusValue(TenantStatus.ACTIVE);
      const suspendedStatus = new TenantStatusValue(TenantStatus.SUSPENDED);
      const deletedStatus = new TenantStatusValue(TenantStatus.DELETED);

      expect(pendingStatus.canDelete()).toBe(true);
      expect(activeStatus.canDelete()).toBe(true);
      expect(suspendedStatus.canDelete()).toBe(true);
      expect(deletedStatus.canDelete()).toBe(false);
    });

    it('canRestore应该正确验证恢复权限', () => {
      const pendingStatus = new TenantStatusValue(TenantStatus.PENDING);
      const activeStatus = new TenantStatusValue(TenantStatus.ACTIVE);
      const suspendedStatus = new TenantStatusValue(TenantStatus.SUSPENDED);
      const deletedStatus = new TenantStatusValue(TenantStatus.DELETED);

      expect(pendingStatus.canRestore()).toBe(false);
      expect(activeStatus.canRestore()).toBe(false);
      expect(suspendedStatus.canRestore()).toBe(false);
      expect(deletedStatus.canRestore()).toBe(true);
    });
  });

  /**
   * @test 显示名称测试
   * @description 测试状态显示名称的映射
   */
  describe('显示名称', () => {
    it('getDisplayName应该返回正确的中文显示名称', () => {
      const testCases = [
        { status: TenantStatus.PENDING, expected: '待激活' },
        { status: TenantStatus.ACTIVE, expected: '激活' },
        { status: TenantStatus.SUSPENDED, expected: '禁用' },
        { status: TenantStatus.DELETED, expected: '已删除' }
      ];

      testCases.forEach(({ status, expected }) => {
        const statusValue = new TenantStatusValue(status);
        expect(statusValue.getDisplayName()).toBe(expected);
      });
    });

    it('getDescription应该返回正确的状态描述', () => {
      const pendingStatus = new TenantStatusValue(TenantStatus.PENDING);
      const activeStatus = new TenantStatusValue(TenantStatus.ACTIVE);
      const suspendedStatus = new TenantStatusValue(TenantStatus.SUSPENDED);
      const deletedStatus = new TenantStatusValue(TenantStatus.DELETED);

      expect(pendingStatus.getDescription()).toBe('租户已创建但尚未激活，需要管理员审核');
      expect(activeStatus.getDescription()).toBe('租户已激活，可以正常使用系统功能');
      expect(suspendedStatus.getDescription()).toBe('租户已被禁用，无法使用系统功能');
      expect(deletedStatus.getDescription()).toBe('租户已被删除，数据保留但无法访问');
    });
  });

  /**
   * @test 字符串转换测试
   * @description 测试toString方法和字符串转换
   */
  describe('字符串转换', () => {
    it('toString应该返回正确的状态字符串', () => {
      const testCases = [
        { status: TenantStatus.PENDING, expected: 'pending' },
        { status: TenantStatus.ACTIVE, expected: 'active' },
        { status: TenantStatus.SUSPENDED, expected: 'suspended' },
        { status: TenantStatus.DELETED, expected: 'deleted' }
      ];

      testCases.forEach(({ status, expected }) => {
        const statusValue = new TenantStatusValue(status);
        expect(statusValue.toString()).toBe(expected);
      });
    });

    it('应该支持字符串拼接', () => {
      const status = new TenantStatusValue(TenantStatus.ACTIVE);
      const result = `租户状态: ${status}`;
      expect(result).toBe('租户状态: active');
    });
  });

  /**
   * @test 相等性测试
   * @description 测试值对象的相等性比较
   */
  describe('相等性', () => {
    it('应该正确比较相等的值对象', () => {
      const status1 = new TenantStatusValue(TenantStatus.ACTIVE);
      const status2 = new TenantStatusValue(TenantStatus.ACTIVE);

      expect(status1.equals(status2)).toBe(true);
    });

    it('应该正确比较不相等的值对象', () => {
      const status1 = new TenantStatusValue(TenantStatus.ACTIVE);
      const status2 = new TenantStatusValue(TenantStatus.SUSPENDED);

      expect(status1.equals(status2)).toBe(false);
    });

    it('应该处理null和undefined', () => {
      const status = new TenantStatusValue(TenantStatus.ACTIVE);

      expect(status.equals(null as any)).toBe(false);
      expect(status.equals(undefined as any)).toBe(false);
    });
  });

  /**
   * @test 静态方法测试
   * @description 测试静态工厂方法
   */
  describe('静态方法', () => {
    it('fromString应该从字符串创建状态值对象', () => {
      const testCases = [
        { input: 'pending', expected: TenantStatus.PENDING },
        { input: 'active', expected: TenantStatus.ACTIVE },
        { input: 'suspended', expected: TenantStatus.SUSPENDED },
        { input: 'deleted', expected: TenantStatus.DELETED }
      ];

      testCases.forEach(({ input, expected }) => {
        const statusValue = TenantStatusValue.fromString(input);
        expect(statusValue.value).toBe(expected);
      });
    });

    it('fromString应该拒绝无效的状态字符串', () => {
      const invalidStatuses = ['invalid', 'unknown', 'test', ''];

      invalidStatuses.forEach(invalidStatus => {
        expect(() => TenantStatusValue.fromString(invalidStatus)).toThrow(
          `无效的租户状态: ${invalidStatus}`
        );
      });
    });

    it('getAvailableStatuses应该返回所有可用状态', () => {
      const availableStatuses = TenantStatusValue.getAvailableStatuses();

      expect(availableStatuses).toContain(TenantStatus.PENDING);
      expect(availableStatuses).toContain(TenantStatus.ACTIVE);
      expect(availableStatuses).toContain(TenantStatus.SUSPENDED);
      expect(availableStatuses).toContain(TenantStatus.DELETED);
      expect(availableStatuses).toHaveLength(4);
    });
  });

  /**
   * @test 状态机逻辑测试
   * @description 测试状态机的业务逻辑
   */
  describe('状态机逻辑', () => {
    it('应该支持从待激活到激活的转换', () => {
      const pendingStatus = new TenantStatusValue(TenantStatus.PENDING);
      expect(pendingStatus.canActivate()).toBe(true);
    });

    it('应该支持从禁用到激活的转换', () => {
      const suspendedStatus = new TenantStatusValue(TenantStatus.SUSPENDED);
      expect(suspendedStatus.canActivate()).toBe(true);
    });

    it('应该支持从激活到禁用的转换', () => {
      const activeStatus = new TenantStatusValue(TenantStatus.ACTIVE);
      expect(activeStatus.canSuspend()).toBe(true);
    });

    it('应该支持从待激活到禁用的转换', () => {
      const pendingStatus = new TenantStatusValue(TenantStatus.PENDING);
      expect(pendingStatus.canSuspend()).toBe(true);
    });

    it('应该阻止从已删除状态进行任何转换', () => {
      const deletedStatus = new TenantStatusValue(TenantStatus.DELETED);
      expect(deletedStatus.canActivate()).toBe(false);
      expect(deletedStatus.canSuspend()).toBe(false);
      expect(deletedStatus.canDelete()).toBe(false);
      expect(deletedStatus.canRestore()).toBe(true);
    });
  });

  /**
   * @test 边界条件测试
   * @description 测试各种边界条件
   */
  describe('边界条件', () => {
    it('应该处理大小写不敏感的状态字符串', () => {
      expect(() => TenantStatusValue.fromString('PENDING')).toThrow();
      expect(() => TenantStatusValue.fromString('Active')).toThrow();
    });

    it('应该处理空字符串和空白字符串', () => {
      expect(() => TenantStatusValue.fromString('')).toThrow();
      expect(() => TenantStatusValue.fromString('   ')).toThrow();
    });
  });

  /**
   * @test 性能测试
   * @description 测试性能相关的场景
   */
  describe('性能', () => {
    it('应该能够快速创建多个状态实例', () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        new TenantStatusValue(TenantStatus.ACTIVE);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该能够快速进行状态查询', () => {
      const status = new TenantStatusValue(TenantStatus.ACTIVE);
      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        status.isActive();
        status.canActivate();
        status.getDisplayName();
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
}); 