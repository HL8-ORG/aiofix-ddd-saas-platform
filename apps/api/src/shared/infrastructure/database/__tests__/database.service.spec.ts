import { Test, TestingModule } from '@nestjs/testing'
import { MikroORM, EntityManager } from '@mikro-orm/core'
import { DatabaseService } from '../database.service'

/**
 * @description 数据库服务单元测试
 * 
 * 测试策略：
 * 1. 测试实体管理器的获取
 * 2. 测试事务管理
 * 3. 测试应用关闭时的清理
 * 4. 测试错误处理
 */
describe('DatabaseService', () => {
  let service: DatabaseService
  let orm: jest.Mocked<MikroORM>
  let em: jest.Mocked<EntityManager>

  beforeEach(async () => {
    // 创建模拟对象
    const mockEm = {
      fork: jest.fn(),
      transactional: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>

    const mockOrm = {
      close: jest.fn(),
    } as unknown as jest.Mocked<MikroORM>

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: MikroORM,
          useValue: mockOrm,
        },
        {
          provide: EntityManager,
          useValue: mockEm,
        },
      ],
    }).compile()

    service = module.get<DatabaseService>(DatabaseService)
    orm = module.get(MikroORM)
    em = module.get(EntityManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getEntityManager', () => {
    it('应该返回一个新的实体管理器实例', () => {
      // Arrange
      const forkedEm = {} as EntityManager
      em.fork.mockReturnValue(forkedEm)

      // Act
      const result = service.getEntityManager()

      // Assert
      expect(em.fork).toHaveBeenCalled()
      expect(result).toBe(forkedEm)
    })
  })

  describe('withTransaction', () => {
    it('应该在事务中执行回调', async () => {
      // Arrange
      const callback = jest.fn().mockResolvedValue('result')
      const forkedEm = {
        transactional: jest.fn().mockImplementation((cb) => cb(forkedEm)),
      } as unknown as EntityManager
      em.fork.mockReturnValue(forkedEm)

      // Act
      const result = await service.withTransaction(callback)

      // Assert
      expect(em.fork).toHaveBeenCalled()
      expect(forkedEm.transactional).toHaveBeenCalledWith(callback)
      expect(callback).toHaveBeenCalledWith(forkedEm)
      expect(result).toBe('result')
    })

    it('应该在事务失败时抛出错误', async () => {
      // Arrange
      const error = new Error('Transaction failed')
      const callback = jest.fn().mockRejectedValue(error)
      const forkedEm = {
        transactional: jest.fn().mockImplementation((cb) => cb(forkedEm)),
      } as unknown as EntityManager
      em.fork.mockReturnValue(forkedEm)

      // Act & Assert
      await expect(service.withTransaction(callback)).rejects.toThrow(error)
      expect(em.fork).toHaveBeenCalled()
      expect(forkedEm.transactional).toHaveBeenCalledWith(callback)
      expect(callback).toHaveBeenCalledWith(forkedEm)
    })
  })

  describe('onApplicationShutdown', () => {
    it('应该关闭数据库连接', async () => {
      // Act
      await service.onApplicationShutdown()

      // Assert
      expect(orm.close).toHaveBeenCalled()
    })

    it('应该处理关闭连接时的错误', async () => {
      // Arrange
      const error = new Error('Close failed')
      orm.close.mockRejectedValue(error)

      // Act & Assert
      await expect(service.onApplicationShutdown()).rejects.toThrow(error)
      expect(orm.close).toHaveBeenCalled()
    })
  })
})
