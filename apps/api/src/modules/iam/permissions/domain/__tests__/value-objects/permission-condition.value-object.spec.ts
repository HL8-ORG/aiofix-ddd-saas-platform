import { PermissionCondition, PermissionConditionData } from '../../value-objects/permission-condition.value-object'

/**
 * @description 权限条件值对象测试
 * 测试权限条件值对象的创建、验证和比较功能
 */
describe('权限条件值对象测试', () => {
  describe('PermissionCondition类', () => {
    it('应该正确创建权限条件', () => {
      const conditionData: PermissionConditionData = {
        field: 'status',
        operator: 'equals',
        value: 'active',
      }

      const condition = new PermissionCondition(conditionData)
      expect(condition.getField()).toBe('status')
      expect(condition.getOperator()).toBe('equals')
      expect(condition.getValue()).toBe('active')
    })

    it('应该正确创建复杂权限条件', () => {
      const conditionData: PermissionConditionData = {
        field: 'createdAt',
        operator: 'greaterThan',
        value: '2023-01-01',
        logicalOperator: 'AND',
      }

      const condition = new PermissionCondition(conditionData)
      expect(condition.getField()).toBe('createdAt')
      expect(condition.getOperator()).toBe('greaterThan')
      expect(condition.getValue()).toBe('2023-01-01')
      expect(condition.getLogicalOperator()).toBe('AND')
    })

    it('应该正确比较权限条件', () => {
      const conditionData1: PermissionConditionData = {
        field: 'status',
        operator: 'equals',
        value: 'active',
      }

      const conditionData2: PermissionConditionData = {
        field: 'status',
        operator: 'equals',
        value: 'active',
      }

      const condition1 = new PermissionCondition(conditionData1)
      const condition2 = new PermissionCondition(conditionData2)
      const condition3 = new PermissionCondition({
        field: 'status',
        operator: 'notEquals',
        value: 'active',
      })

      expect(condition1.equals(condition2)).toBe(true)
      expect(condition1.equals(condition3)).toBe(false)
    })

    it('应该正确转换为字符串', () => {
      const conditionData: PermissionConditionData = {
        field: 'status',
        operator: 'equals',
        value: 'active',
      }

      const condition = new PermissionCondition(conditionData)
      expect(condition.toString()).toBe('status equals active')
    })

    it('应该正确进行JSON序列化', () => {
      const conditionData: PermissionConditionData = {
        field: 'createdAt',
        operator: 'greaterThan',
        value: '2023-01-01',
      }

      const condition = new PermissionCondition(conditionData)
      const serialized = JSON.stringify(condition)
      expect(serialized).toContain('"field":"createdAt"')
      expect(serialized).toContain('"operator":"greaterThan"')
      expect(serialized).toContain('"value":"2023-01-01"')
    })
  })

  describe('权限条件验证', () => {
    it('应该验证有效的权限条件', () => {
      const validConditions: PermissionConditionData[] = [
        {
          field: 'status',
          operator: 'equals',
          value: 'active',
        },
        {
          field: 'createdAt',
          operator: 'greaterThan',
          value: '2023-01-01',
          logicalOperator: 'AND',
        },
        {
          field: 'userId',
          operator: 'in',
          value: ['1', '2', '3'],
        },
      ]

      validConditions.forEach(conditionData => {
        expect(() => new PermissionCondition(conditionData)).not.toThrow()
      })
    })

    it('应该拒绝无效的权限条件', () => {
      const invalidConditions = [
        {
          field: '',
          operator: 'equals',
          value: 'active',
        },
        {
          field: 'status',
          operator: '',
          value: 'active',
        },
        {
          field: 'status',
          operator: 'equals',
          value: null,
        },
      ]

      invalidConditions.forEach(conditionData => {
        expect(() => {
          new PermissionCondition(conditionData as PermissionConditionData)
        }).toThrow()
      })
    })

    it('应该验证字段名称', () => {
      expect(() => {
        new PermissionCondition({
          field: '',
          operator: 'equals',
          value: 'active',
        })
      }).toThrow()
    })

    it('应该验证操作符', () => {
      expect(() => {
        new PermissionCondition({
          field: 'status',
          operator: '',
          value: 'active',
        })
      }).toThrow()
    })

    it('应该验证值', () => {
      expect(() => {
        new PermissionCondition({
          field: 'status',
          operator: 'equals',
          value: null,
        })
      }).toThrow()
    })
  })

  describe('权限条件业务逻辑', () => {
    it('应该正确获取字段名称', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'equals',
        value: 'active',
      })

      expect(condition.getField()).toBe('status')
    })

    it('应该正确获取操作符', () => {
      const condition = new PermissionCondition({
        field: 'createdAt',
        operator: 'greaterThan',
        value: '2023-01-01',
      })

      expect(condition.getOperator()).toBe('greaterThan')
    })

    it('应该正确获取值', () => {
      const condition = new PermissionCondition({
        field: 'userId',
        operator: 'in',
        value: ['1', '2', '3'],
      })

      expect(condition.getValue()).toEqual(['1', '2', '3'])
    })

    it('应该正确获取逻辑操作符', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'equals',
        value: 'active',
        logicalOperator: 'AND',
      })

      expect(condition.getLogicalOperator()).toBe('AND')
    })

    it('应该正确获取默认逻辑操作符', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'equals',
        value: 'active',
      })

      expect(condition.getLogicalOperator()).toBe('AND')
    })
  })

  describe('权限条件操作符验证', () => {
    it('应该支持equals操作符', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'equals',
        value: 'active',
      })

      expect(condition.getOperator()).toBe('equals')
    })

    it('应该支持notEquals操作符', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'notEquals',
        value: 'inactive',
      })

      expect(condition.getOperator()).toBe('notEquals')
    })

    it('应该支持greaterThan操作符', () => {
      const condition = new PermissionCondition({
        field: 'createdAt',
        operator: 'greaterThan',
        value: '2023-01-01',
      })

      expect(condition.getOperator()).toBe('greaterThan')
    })

    it('应该支持lessThan操作符', () => {
      const condition = new PermissionCondition({
        field: 'createdAt',
        operator: 'lessThan',
        value: '2023-12-31',
      })

      expect(condition.getOperator()).toBe('lessThan')
    })

    it('应该支持in操作符', () => {
      const condition = new PermissionCondition({
        field: 'userId',
        operator: 'in',
        value: ['1', '2', '3'],
      })

      expect(condition.getOperator()).toBe('in')
    })

    it('应该支持notIn操作符', () => {
      const condition = new PermissionCondition({
        field: 'userId',
        operator: 'notIn',
        value: ['1', '2', '3'],
      })

      expect(condition.getOperator()).toBe('notIn')
    })
  })

  describe('权限条件逻辑操作符', () => {
    it('应该支持AND逻辑操作符', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'equals',
        value: 'active',
        logicalOperator: 'AND',
      })

      expect(condition.getLogicalOperator()).toBe('AND')
    })

    it('应该支持OR逻辑操作符', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'equals',
        value: 'active',
        logicalOperator: 'OR',
      })

      expect(condition.getLogicalOperator()).toBe('OR')
    })

    it('应该使用默认AND逻辑操作符', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'equals',
        value: 'active',
      })

      expect(condition.getLogicalOperator()).toBe('AND')
    })
  })

  describe('权限条件类型安全', () => {
    it('应该确保字段名称是字符串类型', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'equals',
        value: 'active',
      })

      expect(typeof condition.getField()).toBe('string')
    })

    it('应该确保操作符是字符串类型', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'equals',
        value: 'active',
      })

      expect(typeof condition.getOperator()).toBe('string')
    })

    it('应该确保逻辑操作符是字符串类型', () => {
      const condition = new PermissionCondition({
        field: 'status',
        operator: 'equals',
        value: 'active',
        logicalOperator: 'AND',
      })

      expect(typeof condition.getLogicalOperator()).toBe('string')
    })
  })

  describe('权限条件错误处理', () => {
    it('应该拒绝空的字段名称', () => {
      expect(() => {
        new PermissionCondition({
          field: '',
          operator: 'equals',
          value: 'active',
        })
      }).toThrow()
    })

    it('应该拒绝空的操作符', () => {
      expect(() => {
        new PermissionCondition({
          field: 'status',
          operator: '',
          value: 'active',
        })
      }).toThrow()
    })

    it('应该拒绝null值', () => {
      expect(() => {
        new PermissionCondition({
          field: 'status',
          operator: 'equals',
          value: null,
        })
      }).toThrow()
    })

    it('应该拒绝undefined值', () => {
      expect(() => {
        new PermissionCondition({
          field: 'status',
          operator: 'equals',
          value: undefined,
        })
      }).toThrow()
    })
  })

  describe('权限条件序列化', () => {
    it('应该正确序列化为对象', () => {
      const conditionData: PermissionConditionData = {
        field: 'status',
        operator: 'equals',
        value: 'active',
        logicalOperator: 'AND',
      }

      const condition = new PermissionCondition(conditionData)
      const serialized = condition.toObject()

      expect(serialized.field).toBe('status')
      expect(serialized.operator).toBe('equals')
      expect(serialized.value).toBe('active')
      expect(serialized.logicalOperator).toBe('AND')
    })

    it('应该正确反序列化对象', () => {
      const conditionData: PermissionConditionData = {
        field: 'createdAt',
        operator: 'greaterThan',
        value: '2023-01-01',
      }

      const condition = new PermissionCondition(conditionData)
      const serialized = condition.toObject()
      const deserialized = new PermissionCondition(serialized)

      expect(deserialized.equals(condition)).toBe(true)
    })
  })
}) 