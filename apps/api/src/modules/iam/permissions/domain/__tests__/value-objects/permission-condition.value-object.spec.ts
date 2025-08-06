import {
  PermissionCondition,
  type PermissionConditionData,
} from '../../value-objects/permission-condition.value-object'

describe('PermissionCondition', () => {
  describe('constructor', () => {
    it('应该成功创建空条件', () => {
      const condition = new PermissionCondition([])
      expect(condition.getValue()).toEqual([])
    })

    it('应该成功创建单个条件', () => {
      const conditionData: PermissionConditionData = {
        field: 'status',
        operator: 'eq',
        value: 'active',
      }
      const condition = new PermissionCondition([conditionData])
      expect(condition.getValue()).toEqual([conditionData])
    })

    it('应该成功创建多个条件', () => {
      const conditionData: PermissionConditionData[] = [
        { field: 'status', operator: 'eq', value: 'active' },
        {
          field: 'type',
          operator: 'in',
          value: ['user', 'admin'],
          logicalOperator: 'and',
        },
      ]
      const condition = new PermissionCondition(conditionData)
      expect(condition.getValue()).toEqual(conditionData)
    })
  })

  describe('validation', () => {
    it('应该拒绝非数组输入', () => {
      expect(() => new PermissionCondition(null as any)).toThrow(
        '权限条件必须是数组格式',
      )
    })

    it('应该拒绝包含无效字段的条件', () => {
      const invalidCondition: PermissionConditionData = {
        field: '',
        operator: 'eq',
        value: 'active',
      }
      expect(() => new PermissionCondition([invalidCondition])).toThrow(
        '权限条件字段不能为空且必须是字符串',
      )
    })

    it('应该拒绝包含无效操作符的条件', () => {
      const invalidCondition: PermissionConditionData = {
        field: 'status',
        operator: 'invalid' as any,
        value: 'active',
      }
      expect(() => new PermissionCondition([invalidCondition])).toThrow(
        '无效的操作符: invalid',
      )
    })

    it('应该拒绝包含空值的条件', () => {
      const invalidCondition: PermissionConditionData = {
        field: 'status',
        operator: 'eq',
        value: null,
      }
      expect(() => new PermissionCondition([invalidCondition])).toThrow(
        '权限条件值不能为空',
      )
    })

    it('应该拒绝包含无效逻辑运算符的条件', () => {
      const invalidCondition: PermissionConditionData = {
        field: 'status',
        operator: 'eq',
        value: 'active',
        logicalOperator: 'invalid' as any,
      }
      expect(() => new PermissionCondition([invalidCondition])).toThrow(
        '无效的逻辑运算符: invalid',
      )
    })
  })

  describe('getValue', () => {
    it('应该返回权限条件值', () => {
      const conditionData: PermissionConditionData = {
        field: 'status',
        operator: 'eq',
        value: 'active',
      }
      const condition = new PermissionCondition([conditionData])
      expect(condition.getValue()).toEqual([conditionData])
    })
  })

  describe('getConditions', () => {
    it('应该返回条件数组的副本', () => {
      const conditionData: PermissionConditionData = {
        field: 'status',
        operator: 'eq',
        value: 'active',
      }
      const condition = new PermissionCondition([conditionData])
      const result = condition.getConditions()
      expect(result).toEqual([conditionData])
      expect(result).not.toBe(condition.getValue()) // 应该是副本
    })
  })

  describe('hasConditions', () => {
    it('应该正确判断是否有条件', () => {
      const emptyCondition = new PermissionCondition([])
      const nonEmptyCondition = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
      ])

      expect(emptyCondition.hasConditions()).toBe(false)
      expect(nonEmptyCondition.hasConditions()).toBe(true)
    })
  })

  describe('getConditionCount', () => {
    it('应该返回正确的条件数量', () => {
      const emptyCondition = new PermissionCondition([])
      const singleCondition = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
      ])
      const multipleConditions = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'type', operator: 'in', value: ['user', 'admin'] },
      ])

      expect(emptyCondition.getConditionCount()).toBe(0)
      expect(singleCondition.getConditionCount()).toBe(1)
      expect(multipleConditions.getConditionCount()).toBe(2)
    })
  })

  describe('getFields', () => {
    it('应该返回所有涉及的字段', () => {
      const condition = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'type', operator: 'in', value: ['user', 'admin'] },
        { field: 'status', operator: 'ne', value: 'deleted' }, // 重复字段
      ])

      const fields = condition.getFields()
      expect(fields).toEqual(['status', 'type'])
    })
  })

  describe('getOperators', () => {
    it('应该返回所有使用的操作符', () => {
      const condition = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'type', operator: 'in', value: ['user', 'admin'] },
        { field: 'age', operator: 'gt', value: 18 },
      ])

      const operators = condition.getOperators()
      expect(operators).toEqual(['eq', 'in', 'gt'])
    })
  })

  describe('isComplex', () => {
    it('应该正确判断是否为复杂条件', () => {
      const singleCondition = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
      ])
      const multipleConditions = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'type', operator: 'in', value: ['user', 'admin'] },
      ])

      expect(singleCondition.isComplex()).toBe(false)
      expect(multipleConditions.isComplex()).toBe(true)
    })
  })

  describe('hasLogicalOperator', () => {
    it('应该正确判断是否包含逻辑运算符', () => {
      const simpleCondition = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
      ])
      const logicalCondition = new PermissionCondition([
        {
          field: 'status',
          operator: 'eq',
          value: 'active',
          logicalOperator: 'and',
        },
      ])

      expect(simpleCondition.hasLogicalOperator()).toBe(false)
      expect(logicalCondition.hasLogicalOperator()).toBe(true)
    })
  })

  describe('toCaslCondition', () => {
    it('应该转换空条件为空对象', () => {
      const condition = new PermissionCondition([])
      const caslCondition = condition.toCaslCondition()
      expect(caslCondition).toEqual({})
    })

    it('应该转换单个条件', () => {
      const condition = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
      ])
      const caslCondition = condition.toCaslCondition()
      expect(caslCondition).toEqual({
        status: { $eq: 'active' },
      })
    })

    it('应该转换多个条件为AND条件', () => {
      const condition = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
        { field: 'type', operator: 'in', value: ['user', 'admin'] },
      ])
      const caslCondition = condition.toCaslCondition()
      expect(caslCondition).toEqual({
        $and: [
          { status: { $eq: 'active' } },
          { type: { $in: ['user', 'admin'] } },
        ],
      })
    })

    it('应该转换包含OR逻辑运算符的条件', () => {
      const condition = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
        {
          field: 'type',
          operator: 'in',
          value: ['user', 'admin'],
          logicalOperator: 'or',
        },
      ])
      const caslCondition = condition.toCaslCondition()
      expect(caslCondition).toEqual({
        $or: [
          { status: { $eq: 'active' } },
          { type: { $in: ['user', 'admin'] } },
        ],
      })
    })
  })

  describe('equals', () => {
    it('应该正确比较两个相同的条件', () => {
      const conditionData: PermissionConditionData[] = [
        { field: 'status', operator: 'eq', value: 'active' },
      ]
      const condition1 = new PermissionCondition(conditionData)
      const condition2 = new PermissionCondition(conditionData)
      expect(condition1.equals(condition2)).toBe(true)
    })

    it('应该正确比较两个不同的条件', () => {
      const condition1 = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
      ])
      const condition2 = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'inactive' },
      ])
      expect(condition1.equals(condition2)).toBe(false)
    })

    it('应该处理null比较', () => {
      const condition1 = new PermissionCondition([
        { field: 'status', operator: 'eq', value: 'active' },
      ])
      expect(condition1.equals(null as any)).toBe(false)
    })
  })

  describe('toString', () => {
    it('应该返回条件字符串', () => {
      const conditionData: PermissionConditionData[] = [
        { field: 'status', operator: 'eq', value: 'active' },
      ]
      const condition = new PermissionCondition(conditionData)
      expect(condition.toString()).toBe(JSON.stringify(conditionData))
    })
  })

  describe('static factory methods', () => {
    it('应该通过静态方法创建条件', () => {
      const conditionData: PermissionConditionData[] = [
        { field: 'status', operator: 'eq', value: 'active' },
      ]
      const condition = PermissionCondition.create(conditionData)
      expect(condition.getValue()).toEqual(conditionData)
    })

    it('应该通过静态方法创建简单条件', () => {
      const condition = PermissionCondition.createSimple(
        'status',
        'eq',
        'active',
      )
      expect(condition.getValue()).toEqual([
        { field: 'status', operator: 'eq', value: 'active' },
      ])
    })

    it('应该通过静态方法创建空条件', () => {
      const condition = PermissionCondition.createEmpty()
      expect(condition.getValue()).toEqual([])
    })
  })
})
