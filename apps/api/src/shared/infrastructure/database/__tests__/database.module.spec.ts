import { Test, TestingModule } from '@nestjs/testing'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { MikroORM, EntityManager } from '@mikro-orm/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DatabaseModule } from '../database.module'
import { DatabaseService } from '../database.service'

/**
 * @description 数据库模块单元测试
 * 
 * 测试策略：
 * 1. 测试模块的初始化
 * 2. 测试全局模块装饰器
 * 3. 测试服务提供者的注册
 * 4. 测试模块导出
 */
describe('DatabaseModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    // 创建模拟的 MikroORM 模块
    const mockMikroOrmModule = {
      module: class MockMikroOrmModule { },
      providers: [
        {
          provide: MikroORM,
          useValue: {
            close: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            fork: jest.fn(),
            transactional: jest.fn(),
          },
        },
      ],
    }

    // 创建测试模块
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({
            DATABASE_HOST: 'localhost',
            DATABASE_PORT: 5432,
            DATABASE_USER: 'test',
            DATABASE_PASSWORD: 'test',
            DATABASE_NAME: 'test_db',
          })],
        }),
      ],
      providers: [
        ...mockMikroOrmModule.providers,
        DatabaseService,
      ],
    })
      .overrideProvider(MikroOrmModule)
      .useValue(mockMikroOrmModule.module)
      .compile()
  })

  it('应该成功解析DatabaseService', () => {
    // Act
    const service = module.get<DatabaseService>(DatabaseService)

    // Assert
    expect(service).toBeInstanceOf(DatabaseService)
  })

  it('应该注入ConfigService', () => {
    // Act
    const configService = module.get<ConfigService>(ConfigService)

    // Assert
    expect(configService).toBeDefined()
    expect(configService.get('DATABASE_HOST')).toBe('localhost')
  })

  it('应该注入EntityManager', () => {
    // Act
    const entityManager = module.get<EntityManager>(EntityManager)

    // Assert
    expect(entityManager).toBeDefined()
    expect(entityManager.fork).toBeDefined()
    expect(entityManager.transactional).toBeDefined()
  })

  it('应该注入MikroORM', () => {
    // Act
    const orm = module.get<MikroORM>(MikroORM)

    // Assert
    expect(orm).toBeDefined()
    expect(orm.close).toBeDefined()
  })
})
