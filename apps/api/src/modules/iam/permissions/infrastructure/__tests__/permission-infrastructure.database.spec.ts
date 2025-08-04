import { EntityManager } from '@mikro-orm/core'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, type TestingModule } from '@nestjs/testing'
import { generateUuid } from '../../../../../shared/domain/utils/uuid.util'
import config from '../../../../../shared/infrastructure/config/mikro-orm.config'
import { Permission } from '../../domain/entities/permission.entity'
import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import { PermissionStatus, PermissionStatusValue } from '../../domain/value-objects/permission-status.value-object'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import { PermissionOrmEntity } from '../entities/permission.orm.entity'
import { PermissionRepositoryMikroOrm } from '../repositories/permission.repository.mikroorm'

/**
 * @description 权限基础设施层数据库连接测试
 * 使用真实的PostgreSQL数据库测试MikroORM实现
 */
describe('权限基础设施层数据库连接测试', () => {
  let module: TestingModule
  let permissionRepository: PermissionRepositoryMikroOrm
  let em: EntityManager

  beforeAll(async () => {
    console.log('开始权限数据库连接测试...')
    console.log('数据库配置:', {
      host: config.host,
      port: config.port,
      dbName: config.dbName,
      user: config.user,
    })

    try {
      module = await Test.createTestingModule({
        imports: [
          MikroOrmModule.forRoot({
            ...config,
            debug: true,
            allowGlobalContext: true, // 允许全局上下文
            entities: [PermissionOrmEntity], // 明确指定实体
          }),
        ],
        providers: [
          {
            provide: 'PermissionRepository',
            useClass: PermissionRepositoryMikroOrm,
          },
        ],
      }).compile()

      permissionRepository =
        module.get<PermissionRepositoryMikroOrm>('PermissionRepository')
      em = module.get<EntityManager>(EntityManager)

      // 测试数据库连接
      await em.getConnection().execute('SELECT 1')
      console.log('✅ 数据库连接成功')

      // 创建数据库表（如果不存在）
      try {
        await em.getConnection().execute(`
          CREATE TABLE IF NOT EXISTS permissions (
            id UUID PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) NOT NULL,
            description TEXT,
            type VARCHAR(20) NOT NULL,
            status VARCHAR(20) NOT NULL,
            action VARCHAR(20) NOT NULL,
            tenant_id UUID NOT NULL,
            organization_id UUID,
            admin_user_id UUID NOT NULL,
            role_ids JSONB,
            is_system_permission BOOLEAN DEFAULT FALSE,
            is_default_permission BOOLEAN DEFAULT FALSE,
            conditions JSONB,
            fields JSONB,
            expires_at TIMESTAMP,
            parent_permission_id UUID,
            child_permission_ids JSONB,
            resource VARCHAR(100),
            module VARCHAR(50),
            tags VARCHAR(500),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_permissions_tenant_id ON permissions(tenant_id);
          CREATE INDEX IF NOT EXISTS idx_permissions_status ON permissions(status);
          CREATE INDEX IF NOT EXISTS idx_permissions_type ON permissions(type);
          CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
          CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
          CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
          CREATE INDEX IF NOT EXISTS idx_permissions_admin_user_id ON permissions(admin_user_id);
          CREATE INDEX IF NOT EXISTS idx_permissions_organization_id ON permissions(organization_id);
          CREATE INDEX IF NOT EXISTS idx_permissions_parent_permission_id ON permissions(parent_permission_id);
          CREATE INDEX IF NOT EXISTS idx_permissions_created_at ON permissions(created_at);
          CREATE INDEX IF NOT EXISTS idx_permissions_updated_at ON permissions(updated_at);
          CREATE UNIQUE INDEX IF NOT EXISTS uk_permissions_tenant_code ON permissions(tenant_id, code);
          CREATE UNIQUE INDEX IF NOT EXISTS uk_permissions_tenant_name ON permissions(tenant_id, name);
        `)
        console.log('✅ 权限数据库表创建成功')
      } catch (error) {
        console.log('⚠️ 表可能已存在或创建失败:', (error as Error).message)
      }

      // 清理测试数据
      try {
        await em.nativeDelete(PermissionOrmEntity, {})
        console.log('✅ 测试数据清理完成')
      } catch (error) {
        console.log('⚠️ 清理测试数据失败:', (error as Error).message)
      }
    } catch (error) {
      console.error('❌ 数据库连接失败:', (error as Error).message)
      throw error
    }
  })

  afterAll(async () => {
    if (module) {
      try {
        await em.nativeDelete(PermissionOrmEntity, {})
        console.log('✅ 测试数据清理完成')
      } catch (error) {
        console.error('❌ 清理测试数据失败:', (error as Error).message)
      }

      // 正确关闭 MikroORM 连接
      try {
        const orm = module.get('MikroORM')
        if (orm) {
          await orm.close()
        }
      } catch (error) {
        console.log('⚠️ 关闭MikroORM连接失败:', (error as Error).message)
      }

      await module.close()
    }
  })

  afterEach(async () => {
    try {
      await em.nativeDelete(PermissionOrmEntity, {})
    } catch (error) {
      console.error('清理测试数据失败:', (error as Error).message)
    }
  })

  describe('数据库连接测试', () => {
    it('应该能够成功连接到PostgreSQL数据库', async () => {
      const result = await em.getConnection().execute('SELECT version()')
      expect(result).toBeDefined()
      console.log('数据库版本:', result)
    })

    it('应该能够创建和查询权限表', async () => {
      const tables = await em.getConnection().execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'permissions'
      `)

      expect(tables.length).toBeGreaterThan(0)
      console.log('✅ 权限表存在')
    })
  })

  describe('MikroORM仓储数据库操作测试', () => {
    it('应该能够保存权限到数据库', async () => {
      const permission = new Permission(
        generateUuid(),
        '数据库测试权限',
        'DB_TEST_PERMISSION',
        PermissionType.API,
        PermissionAction.READ,
        generateUuid(),
        generateUuid(),
        '这是一个数据库测试权限',
        generateUuid(),
        'user',
        'system',
      )
      permission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      permission.tags = 'admin,system'

      const savedPermission = await permissionRepository.save(permission)
      expect(savedPermission.id).toBe(permission.id)
      expect(savedPermission.getName()).toBe('数据库测试权限')

      // 验证数据确实保存到了数据库
      const dbPermission = await em.findOne(PermissionOrmEntity, { id: permission.id })
      expect(dbPermission).toBeDefined()
      expect(dbPermission?.name).toBe('数据库测试权限')
      expect(dbPermission?.code).toBe('DB_TEST_PERMISSION')

      console.log('✅ 权限保存到数据库成功')
    })

    it('应该能够从数据库查询权限', async () => {
      const permission = new Permission(
        generateUuid(),
        '查询测试权限',
        'QUERY_TEST_PERMISSION',
        PermissionType.MENU,
        PermissionAction.CREATE,
        generateUuid(),
        generateUuid(),
      )
      permission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      await permissionRepository.save(permission)

      const foundPermission = await permissionRepository.findById(permission.id, permission.tenantId)
      expect(foundPermission).toBeDefined()
      expect(foundPermission?.getName()).toBe('查询测试权限')

      const foundByCode = await permissionRepository.findByCode(permission.getCode(), permission.tenantId)
      expect(foundByCode).toBeDefined()
      expect(foundByCode?.getCode()).toBe('QUERY_TEST_PERMISSION')

      console.log('✅ 数据库查询成功')
    })

    it('应该能够更新权限状态', async () => {
      const permission = new Permission(
        generateUuid(),
        '状态更新测试权限',
        'STATUS_TEST_PERMISSION',
        PermissionType.BUTTON,
        PermissionAction.UPDATE,
        generateUuid(),
        generateUuid(),
      )
      permission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      await permissionRepository.save(permission)

      // 更新权限状态
      permission.status = new PermissionStatusValue(PermissionStatus.SUSPENDED)
      await permissionRepository.save(permission)

      const foundPermission = await permissionRepository.findById(permission.id, permission.tenantId)
      expect(foundPermission?.getStatus()).toBe(PermissionStatus.SUSPENDED)

      console.log('✅ 状态更新成功')
    })

    it('应该能够统计权限数量', async () => {
      const tenantId = generateUuid() // 使用相同的tenantId
      const permission1 = new Permission(
        generateUuid(),
        '统计测试权限1',
        'COUNT_TEST_PERMISSION_1',
        PermissionType.API,
        PermissionAction.READ,
        tenantId, // 使用相同的tenantId
        generateUuid(),
      )
      permission1.status = new PermissionStatusValue(PermissionStatus.ACTIVE)

      const permission2 = new Permission(
        generateUuid(),
        '统计测试权限2',
        'COUNT_TEST_PERMISSION_2',
        PermissionType.MENU,
        PermissionAction.CREATE,
        tenantId, // 使用相同的tenantId
        generateUuid(),
      )
      permission2.status = new PermissionStatusValue(PermissionStatus.ACTIVE)

      await permissionRepository.save(permission1)
      await permissionRepository.save(permission2)

      const count = await permissionRepository.countByTenant(tenantId)
      expect(count).toBe(2)

      console.log('✅ 统计功能正常')
    })

    it('应该能够根据类型查找权限', async () => {
      const permission = new Permission(
        generateUuid(),
        '类型测试权限',
        'TYPE_TEST_PERMISSION',
        PermissionType.DATA,
        PermissionAction.DELETE,
        generateUuid(),
        generateUuid(),
      )
      permission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      await permissionRepository.save(permission)

      const dataPermissions = await permissionRepository.findByType(PermissionType.DATA, permission.tenantId)
      expect(dataPermissions.length).toBeGreaterThan(0)
      expect(dataPermissions[0].getType()).toBe(PermissionType.DATA)

      console.log('✅ 按类型查找成功')
    })

    it('应该能够根据操作查找权限', async () => {
      const permission = new Permission(
        generateUuid(),
        '操作测试权限',
        'ACTION_TEST_PERMISSION',
        PermissionType.API,
        PermissionAction.MANAGE,
        generateUuid(),
        generateUuid(),
      )
      permission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      await permissionRepository.save(permission)

      const managePermissions = await permissionRepository.findByAction(PermissionAction.MANAGE, permission.tenantId)
      expect(managePermissions.length).toBeGreaterThan(0)
      expect(managePermissions[0].getAction()).toBe(PermissionAction.MANAGE)

      console.log('✅ 按操作查找成功')
    })

    it('应该能够软删除权限', async () => {
      const permission = new Permission(
        generateUuid(),
        '删除测试权限',
        'DELETE_TEST_PERMISSION',
        PermissionType.BUTTON,
        PermissionAction.READ,
        generateUuid(),
        generateUuid(),
      )
      permission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      await permissionRepository.save(permission)

      const deleted = await permissionRepository.delete(permission.id, permission.tenantId)
      expect(deleted).toBe(true)

      // 验证权限被软删除（状态变为INACTIVE）
      const foundPermission = await permissionRepository.findById(permission.id, permission.tenantId)
      expect(foundPermission?.getStatus()).toBe(PermissionStatus.INACTIVE)

      console.log('✅ 软删除成功')
    })

    it('应该能够搜索权限', async () => {
      const permission = new Permission(
        generateUuid(),
        '搜索测试权限',
        'SEARCH_TEST_PERMISSION',
        PermissionType.MENU,
        PermissionAction.CREATE,
        generateUuid(),
        generateUuid(),
      )
      permission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      await permissionRepository.save(permission)

      const searchResult = await permissionRepository.search('搜索测试', permission.tenantId, undefined, 1, 10)
      expect(searchResult.permissions.length).toBeGreaterThan(0)
      expect(searchResult.total).toBeGreaterThan(0)

      console.log('✅ 搜索功能正常')
    })
  })
}) 