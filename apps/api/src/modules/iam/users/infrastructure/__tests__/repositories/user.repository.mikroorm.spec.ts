import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { UserRepositoryMikroOrm } from '../../repositories/user.repository.mikroorm';
import { User } from '../../../domain/entities/user.entity';
import { UserStatusValue } from '../../../domain/value-objects/user-status.value-object';
import { UserOrmEntity } from '../../entities/user.orm.entity';
import { UserMapper } from '../../mappers/user.mapper';

/**
 * @description UserRepositoryMikroOrm的单元测试
 */
describe('UserRepositoryMikroOrm', () => {
  let repository: UserRepositoryMikroOrm;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryMikroOrm,
        {
          provide: EntityManager,
          useValue: {
            persistAndFlush: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            nativeUpdate: jest.fn(),
            nativeDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepositoryMikroOrm>(UserRepositoryMikroOrm);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  describe('save', () => {
    it('应该成功保存用户', async () => {
      // Arrange
      const user = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      const ormEntity = UserMapper.toOrm(user);

      jest.spyOn(entityManager, 'persistAndFlush').mockResolvedValue(undefined);
      jest.spyOn(UserMapper, 'toOrm').mockReturnValue(ormEntity);
      jest.spyOn(UserMapper, 'toDomain').mockReturnValue(user);

      // Act
      const result = await repository.save(user);

      // Assert
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(ormEntity);
      expect(UserMapper.toOrm).toHaveBeenCalledWith(user);
      expect(UserMapper.toDomain).toHaveBeenCalledWith(ormEntity);
      expect(result).toBe(user);
    });
  });

  describe('findById', () => {
    it('应该根据ID找到用户', async () => {
      // Arrange
      const user = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'john_doe',
        'john.doe@example.com',
        'John',
        'Doe',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        'hashedPassword123'
      );
      const ormEntity = UserMapper.toOrm(user);

      jest.spyOn(entityManager, 'findOne').mockResolvedValue(ormEntity);
      jest.spyOn(UserMapper, 'toDomain').mockReturnValue(user);

      // Act
      const result = await repository.findById('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(entityManager.findOne).toHaveBeenCalledWith(UserOrmEntity, {
        id: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001'
      });
      expect(UserMapper.toDomain).toHaveBeenCalledWith(ormEntity);
      expect(result).toBe(user);
    });

    it('应该返回null当用户不存在', async () => {
      // Arrange
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(null);

      // Act
      const result = await repository.findById('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(entityManager.findOne).toHaveBeenCalledWith(UserOrmEntity, {
        id: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001'
      });
      expect(result).toBeNull();
    });
  });
}); 