import {
  PermissionType,
  PermissionTypeValue,
} from '../../value-objects/permission-type.value-object'

describe('PermissionTypeValue', () => {
  describe('constructor', () => {
    it('应该成功创建菜单权限类型', () => {
      const permissionType = new PermissionTypeValue(PermissionType.MENU)
      expect(permissionType.getValue()).toBe(PermissionType.MENU)
    })

    it('应该成功创建按钮权限类型', () => {
      const permissionType = new PermissionTypeValue(PermissionType.BUTTON)
      expect(permissionType.getValue()).toBe(PermissionType.BUTTON)
    })

    it('应该成功创建接口权限类型', () => {
      const permissionType = new PermissionTypeValue(PermissionType.API)
      expect(permissionType.getValue()).toBe(PermissionType.API)
    })

    it('应该成功创建数据权限类型', () => {
      const permissionType = new PermissionTypeValue(PermissionType.DATA)
      expect(permissionType.getValue()).toBe(PermissionType.DATA)
    })
  })

  describe('validation', () => {
    it('应该拒绝无效的权限类型', () => {
      expect(() => new PermissionTypeValue('invalid' as any)).toThrow(
        '无效的权限类型: invalid',
      )
    })
  })

  describe('getValue', () => {
    it('应该返回权限类型值', () => {
      const permissionType = new PermissionTypeValue(PermissionType.MENU)
      expect(permissionType.getValue()).toBe(PermissionType.MENU)
    })
  })

  describe('getDisplayName', () => {
    it('应该返回菜单权限的显示名称', () => {
      const permissionType = new PermissionTypeValue(PermissionType.MENU)
      expect(permissionType.getDisplayName()).toBe('菜单权限')
    })

    it('应该返回按钮权限的显示名称', () => {
      const permissionType = new PermissionTypeValue(PermissionType.BUTTON)
      expect(permissionType.getDisplayName()).toBe('按钮权限')
    })

    it('应该返回接口权限的显示名称', () => {
      const permissionType = new PermissionTypeValue(PermissionType.API)
      expect(permissionType.getDisplayName()).toBe('接口权限')
    })

    it('应该返回数据权限的显示名称', () => {
      const permissionType = new PermissionTypeValue(PermissionType.DATA)
      expect(permissionType.getDisplayName()).toBe('数据权限')
    })
  })

  describe('getDescription', () => {
    it('应该返回菜单权限的描述', () => {
      const permissionType = new PermissionTypeValue(PermissionType.MENU)
      expect(permissionType.getDescription()).toBe(
        '控制用户对系统菜单的访问权限',
      )
    })

    it('应该返回按钮权限的描述', () => {
      const permissionType = new PermissionTypeValue(PermissionType.BUTTON)
      expect(permissionType.getDescription()).toBe(
        '控制用户对页面按钮的操作权限',
      )
    })

    it('应该返回接口权限的描述', () => {
      const permissionType = new PermissionTypeValue(PermissionType.API)
      expect(permissionType.getDescription()).toBe(
        '控制用户对后端接口的调用权限',
      )
    })

    it('应该返回数据权限的描述', () => {
      const permissionType = new PermissionTypeValue(PermissionType.DATA)
      expect(permissionType.getDescription()).toBe(
        '控制用户对数据的访问和操作权限',
      )
    })
  })

  describe('type checking methods', () => {
    it('应该正确识别菜单权限', () => {
      const permissionType = new PermissionTypeValue(PermissionType.MENU)
      expect(permissionType.isMenu()).toBe(true)
      expect(permissionType.isButton()).toBe(false)
      expect(permissionType.isApi()).toBe(false)
      expect(permissionType.isData()).toBe(false)
    })

    it('应该正确识别按钮权限', () => {
      const permissionType = new PermissionTypeValue(PermissionType.BUTTON)
      expect(permissionType.isMenu()).toBe(false)
      expect(permissionType.isButton()).toBe(true)
      expect(permissionType.isApi()).toBe(false)
      expect(permissionType.isData()).toBe(false)
    })

    it('应该正确识别接口权限', () => {
      const permissionType = new PermissionTypeValue(PermissionType.API)
      expect(permissionType.isMenu()).toBe(false)
      expect(permissionType.isButton()).toBe(false)
      expect(permissionType.isApi()).toBe(true)
      expect(permissionType.isData()).toBe(false)
    })

    it('应该正确识别数据权限', () => {
      const permissionType = new PermissionTypeValue(PermissionType.DATA)
      expect(permissionType.isMenu()).toBe(false)
      expect(permissionType.isButton()).toBe(false)
      expect(permissionType.isApi()).toBe(false)
      expect(permissionType.isData()).toBe(true)
    })
  })

  describe('business logic methods', () => {
    it('应该正确判断是否可以设置条件', () => {
      const menuType = new PermissionTypeValue(PermissionType.MENU)
      const buttonType = new PermissionTypeValue(PermissionType.BUTTON)
      const apiType = new PermissionTypeValue(PermissionType.API)
      const dataType = new PermissionTypeValue(PermissionType.DATA)

      expect(menuType.canHaveConditions()).toBe(false)
      expect(buttonType.canHaveConditions()).toBe(false)
      expect(apiType.canHaveConditions()).toBe(true)
      expect(dataType.canHaveConditions()).toBe(true)
    })

    it('应该正确判断是否可以设置字段权限', () => {
      const menuType = new PermissionTypeValue(PermissionType.MENU)
      const buttonType = new PermissionTypeValue(PermissionType.BUTTON)
      const apiType = new PermissionTypeValue(PermissionType.API)
      const dataType = new PermissionTypeValue(PermissionType.DATA)

      expect(menuType.canHaveFields()).toBe(false)
      expect(buttonType.canHaveFields()).toBe(false)
      expect(apiType.canHaveFields()).toBe(false)
      expect(dataType.canHaveFields()).toBe(true)
    })
  })

  describe('equals', () => {
    it('应该正确比较两个相同的权限类型', () => {
      const type1 = new PermissionTypeValue(PermissionType.MENU)
      const type2 = new PermissionTypeValue(PermissionType.MENU)
      expect(type1.equals(type2)).toBe(true)
    })

    it('应该正确比较两个不同的权限类型', () => {
      const type1 = new PermissionTypeValue(PermissionType.MENU)
      const type2 = new PermissionTypeValue(PermissionType.BUTTON)
      expect(type1.equals(type2)).toBe(false)
    })

    it('应该处理null比较', () => {
      const type1 = new PermissionTypeValue(PermissionType.MENU)
      expect(type1.equals(null as any)).toBe(false)
    })
  })

  describe('toString', () => {
    it('应该返回权限类型字符串', () => {
      const permissionType = new PermissionTypeValue(PermissionType.MENU)
      expect(permissionType.toString()).toBe(PermissionType.MENU)
    })
  })

  describe('static factory methods', () => {
    it('应该通过静态方法创建菜单权限类型', () => {
      const permissionType = PermissionTypeValue.getMenu()
      expect(permissionType.getValue()).toBe(PermissionType.MENU)
      expect(permissionType.isMenu()).toBe(true)
    })

    it('应该通过静态方法创建按钮权限类型', () => {
      const permissionType = PermissionTypeValue.getButton()
      expect(permissionType.getValue()).toBe(PermissionType.BUTTON)
      expect(permissionType.isButton()).toBe(true)
    })

    it('应该通过静态方法创建接口权限类型', () => {
      const permissionType = PermissionTypeValue.getApi()
      expect(permissionType.getValue()).toBe(PermissionType.API)
      expect(permissionType.isApi()).toBe(true)
    })

    it('应该通过静态方法创建数据权限类型', () => {
      const permissionType = PermissionTypeValue.getData()
      expect(permissionType.getValue()).toBe(PermissionType.DATA)
      expect(permissionType.isData()).toBe(true)
    })
  })
})
