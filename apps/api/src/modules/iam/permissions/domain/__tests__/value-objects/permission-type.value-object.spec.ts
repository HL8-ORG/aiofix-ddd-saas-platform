import { PermissionType, PermissionTypeValue } from '../../value-objects/permission-type.value-object'

/**
 * @description 权限类型值对象测试
 * 测试权限类型枚举和值对象的创建、验证和比较功能
 */
describe('权限类型值对象测试', () => {
  describe('PermissionType枚举', () => {
    it('应该包含所有预定义的权限类型', () => {
      expect(PermissionType.API).toBe('api')
      expect(PermissionType.MENU).toBe('menu')
      expect(PermissionType.BUTTON).toBe('button')
      expect(PermissionType.DATA).toBe('data')
    })

    it('应该包含所有权限类型值', () => {
      const allTypes = Object.values(PermissionType)
      expect(allTypes).toContain('api')
      expect(allTypes).toContain('menu')
      expect(allTypes).toContain('button')
      expect(allTypes).toContain('data')
    })

    it('应该包含4个权限类型', () => {
      const allTypes = Object.values(PermissionType)
      expect(allTypes).toHaveLength(4)
    })
  })

  describe('PermissionTypeValue类', () => {
    it('应该正确创建权限类型值对象', () => {
      const apiType = new PermissionTypeValue(PermissionType.API)
      expect(apiType.getValue()).toBe(PermissionType.API)
      expect(apiType.toString()).toBe('api')
    })

    it('应该正确创建所有权限类型', () => {
      const apiType = new PermissionTypeValue(PermissionType.API)
      const menuType = new PermissionTypeValue(PermissionType.MENU)
      const buttonType = new PermissionTypeValue(PermissionType.BUTTON)
      const dataType = new PermissionTypeValue(PermissionType.DATA)

      expect(apiType.getValue()).toBe('api')
      expect(menuType.getValue()).toBe('menu')
      expect(buttonType.getValue()).toBe('button')
      expect(dataType.getValue()).toBe('data')
    })

    it('应该正确比较权限类型', () => {
      const type1 = new PermissionTypeValue(PermissionType.API)
      const type2 = new PermissionTypeValue(PermissionType.API)
      const type3 = new PermissionTypeValue(PermissionType.MENU)

      expect(type1.equals(type2)).toBe(true)
      expect(type1.equals(type3)).toBe(false)
    })

    it('应该正确转换为字符串', () => {
      const type = new PermissionTypeValue(PermissionType.BUTTON)
      expect(type.toString()).toBe('button')
      expect(String(type)).toBe('button')
    })

    it('应该正确进行JSON序列化', () => {
      const type = new PermissionTypeValue(PermissionType.DATA)
      const serialized = JSON.stringify(type)
      expect(serialized).toBe('"data"')
    })

    it('应该正确获取显示名称', () => {
      const apiType = new PermissionTypeValue(PermissionType.API)
      const menuType = new PermissionTypeValue(PermissionType.MENU)
      const buttonType = new PermissionTypeValue(PermissionType.BUTTON)
      const dataType = new PermissionTypeValue(PermissionType.DATA)

      expect(apiType.getDisplayName()).toBe('接口权限')
      expect(menuType.getDisplayName()).toBe('菜单权限')
      expect(buttonType.getDisplayName()).toBe('按钮权限')
      expect(dataType.getDisplayName()).toBe('数据权限')
    })

    it('应该正确获取描述', () => {
      const apiType = new PermissionTypeValue(PermissionType.API)
      const menuType = new PermissionTypeValue(PermissionType.MENU)

      expect(apiType.getDescription()).toBe('控制用户对后端接口的调用权限')
      expect(menuType.getDescription()).toBe('控制用户对系统菜单的访问权限')
    })
  })

  describe('权限类型验证', () => {
    it('应该验证有效的权限类型', () => {
      const validTypes = [
        PermissionType.API,
        PermissionType.MENU,
        PermissionType.BUTTON,
        PermissionType.DATA,
      ]

      validTypes.forEach(type => {
        expect(() => new PermissionTypeValue(type)).not.toThrow()
      })
    })

    it('应该拒绝无效的权限类型', () => {
      const invalidTypes = ['invalid', 'test', 'unknown', '']

      invalidTypes.forEach(type => {
        expect(() => {
          new PermissionTypeValue(type as PermissionType)
        }).toThrow()
      })
    })
  })

  describe('权限类型业务逻辑', () => {
    it('应该正确判断是否为API权限', () => {
      const apiType = new PermissionTypeValue(PermissionType.API)
      const menuType = new PermissionTypeValue(PermissionType.MENU)

      expect(apiType.isApi()).toBe(true)
      expect(menuType.isApi()).toBe(false)
    })

    it('应该正确判断是否为菜单权限', () => {
      const apiType = new PermissionTypeValue(PermissionType.API)
      const menuType = new PermissionTypeValue(PermissionType.MENU)

      expect(apiType.isMenu()).toBe(false)
      expect(menuType.isMenu()).toBe(true)
    })

    it('应该正确判断是否为按钮权限', () => {
      const buttonType = new PermissionTypeValue(PermissionType.BUTTON)
      const apiType = new PermissionTypeValue(PermissionType.API)

      expect(buttonType.isButton()).toBe(true)
      expect(apiType.isButton()).toBe(false)
    })

    it('应该正确判断是否为数据权限', () => {
      const dataType = new PermissionTypeValue(PermissionType.DATA)
      const apiType = new PermissionTypeValue(PermissionType.API)

      expect(dataType.isData()).toBe(true)
      expect(apiType.isData()).toBe(false)
    })
  })

  describe('权限类型功能检查', () => {
    it('应该正确检查是否可以设置条件', () => {
      const apiType = new PermissionTypeValue(PermissionType.API)
      const dataType = new PermissionTypeValue(PermissionType.DATA)
      const menuType = new PermissionTypeValue(PermissionType.MENU)

      expect(apiType.canHaveConditions()).toBe(true)
      expect(dataType.canHaveConditions()).toBe(true)
      expect(menuType.canHaveConditions()).toBe(false)
    })

    it('应该正确检查是否可以设置字段权限', () => {
      const dataType = new PermissionTypeValue(PermissionType.DATA)
      const apiType = new PermissionTypeValue(PermissionType.API)
      const menuType = new PermissionTypeValue(PermissionType.MENU)

      expect(dataType.canHaveFields()).toBe(true)
      expect(apiType.canHaveFields()).toBe(false)
      expect(menuType.canHaveFields()).toBe(false)
    })
  })

  describe('静态方法', () => {
    it('应该正确获取API权限类型', () => {
      const apiType = PermissionTypeValue.getApi()
      expect(apiType.getValue()).toBe(PermissionType.API)
    })

    it('应该正确获取菜单权限类型', () => {
      const menuType = PermissionTypeValue.getMenu()
      expect(menuType.getValue()).toBe(PermissionType.MENU)
    })

    it('应该正确获取按钮权限类型', () => {
      const buttonType = PermissionTypeValue.getButton()
      expect(buttonType.getValue()).toBe(PermissionType.BUTTON)
    })

    it('应该正确获取数据权限类型', () => {
      const dataType = PermissionTypeValue.getData()
      expect(dataType.getValue()).toBe(PermissionType.DATA)
    })
  })

  describe('权限类型分类', () => {
    it('应该正确分类接口权限', () => {
      expect(PermissionType.API).toBe('api')
    })

    it('应该正确分类界面权限', () => {
      const uiTypes = [PermissionType.MENU, PermissionType.BUTTON]
      uiTypes.forEach(type => {
        expect(Object.values(PermissionType)).toContain(type)
      })
    })

    it('应该正确分类数据权限', () => {
      expect(PermissionType.DATA).toBe('data')
    })
  })

  describe('权限类型字符串表示', () => {
    it('应该正确转换为字符串', () => {
      expect(String(PermissionType.API)).toBe('api')
      expect(String(PermissionType.MENU)).toBe('menu')
      expect(String(PermissionType.BUTTON)).toBe('button')
      expect(String(PermissionType.DATA)).toBe('data')
    })

    it('应该正确进行JSON序列化', () => {
      const type = PermissionType.API
      const serialized = JSON.stringify(type)
      expect(serialized).toBe('"api"')
    })
  })

  describe('权限类型类型安全', () => {
    it('应该确保所有类型都是字符串类型', () => {
      Object.values(PermissionType).forEach(type => {
        expect(typeof type).toBe('string')
      })
    })

    it('应该确保所有类型都是小写', () => {
      Object.values(PermissionType).forEach(type => {
        expect(type).toBe(type.toLowerCase())
      })
    })
  })

  describe('权限类型错误处理', () => {
    it('应该拒绝无效的类型值', () => {
      expect(() => {
        new PermissionTypeValue('invalid' as PermissionType)
      }).toThrow('无效的权限类型: invalid')
    })

    it('应该处理空值', () => {
      expect(() => {
        new PermissionTypeValue('' as PermissionType)
      }).toThrow('无效的权限类型: ')
    })
  })
}) 