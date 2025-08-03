import { Test, TestingModule } from '@nestjs/testing';
import { RoleMapper } from '../mappers/role.mapper';
import { Role } from '@/modules/iam/roles/domain/entities/role.entity';
import { RoleOrmEntity } from '../entities/role.orm.entity';

describe('RoleMapper', () => {
  let mapper: RoleMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleMapper],
    }).compile();

    mapper = module.get<RoleMapper>(RoleMapper);
  });

  describe('toDomain', () => {
    it('应该将ORM实体转换为领域实体', () => {
      const ormEntity = new RoleOrmEntity();
      ormEntity.id = 'role-1';
      ormEntity.name = '测试角色';
      ormEntity.code = 'TEST_ROLE';
      ormEntity.status = 'ACTIVE';
      ormEntity.tenantId = 'tenant-1';
      ormEntity.adminUserId = 'admin-1';
      ormEntity.priority = 100;
      ormEntity.createdAt = new Date();
      ormEntity.updatedAt = new Date();

      const domainEntity = mapper.toDomain(ormEntity);

      expect(domainEntity).toBeInstanceOf(Role);
      expect(domainEntity.id).toBe('role-1');
      expect(domainEntity.getName()).toBe('测试角色');
      expect(domainEntity.getCode()).toBe('TEST_ROLE');
      expect(domainEntity.getStatus()).toBe('ACTIVE');
      expect(domainEntity.tenantId).toBe('tenant-1');
      expect(domainEntity.adminUserId).toBe('admin-1');
      expect(domainEntity.getPriority()).toBe(100);
    });

    it('应该在ORM实体为空时抛出错误', () => {
      expect(() => mapper.toDomain(null as any)).toThrow('ORM实体不能为空');
    });
  });

  describe('toOrm', () => {
    it('应该将领域实体转换为ORM实体', () => {
      const domainEntity = new Role(
        'role-1',
        '测试角色',
        'TEST_ROLE',
        'tenant-1',
        'admin-1'
      );

      const ormEntity = mapper.toOrm(domainEntity);

      expect(ormEntity).toBeInstanceOf(RoleOrmEntity);
      expect(ormEntity.id).toBe('role-1');
      expect(ormEntity.name).toBe('测试角色');
      expect(ormEntity.code).toBe('TEST_ROLE');
      expect(ormEntity.status).toBe('ACTIVE');
      expect(ormEntity.tenantId).toBe('tenant-1');
      expect(ormEntity.adminUserId).toBe('admin-1');
      expect(ormEntity.priority).toBe(100);
    });

    it('应该在领域实体为空时抛出错误', () => {
      expect(() => mapper.toOrm(null as any)).toThrow('领域实体不能为空');
    });
  });

  describe('toDomainList', () => {
    it('应该将ORM实体列表转换为领域实体列表', () => {
      const ormEntities = [
        new RoleOrmEntity(),
        new RoleOrmEntity()
      ];

      ormEntities[0].id = 'role-1';
      ormEntities[0].name = '角色1';
      ormEntities[0].code = 'ROLE_1';
      ormEntities[0].status = 'ACTIVE';
      ormEntities[0].tenantId = 'tenant-1';
      ormEntities[0].adminUserId = 'admin-1';
      ormEntities[0].priority = 100;
      ormEntities[0].createdAt = new Date();
      ormEntities[0].updatedAt = new Date();

      ormEntities[1].id = 'role-2';
      ormEntities[1].name = '角色2';
      ormEntities[1].code = 'ROLE_2';
      ormEntities[1].status = 'SUSPENDED';
      ormEntities[1].tenantId = 'tenant-1';
      ormEntities[1].adminUserId = 'admin-1';
      ormEntities[1].priority = 200;
      ormEntities[1].createdAt = new Date();
      ormEntities[1].updatedAt = new Date();

      const domainEntities = mapper.toDomainList(ormEntities);

      expect(domainEntities).toHaveLength(2);
      expect(domainEntities[0]).toBeInstanceOf(Role);
      expect(domainEntities[1]).toBeInstanceOf(Role);
      expect(domainEntities[0].getName()).toBe('角色1');
      expect(domainEntities[1].getName()).toBe('角色2');
    });

    it('应该处理空列表', () => {
      const domainEntities = mapper.toDomainList([]);
      expect(domainEntities).toEqual([]);
    });
  });

  describe('toOrmList', () => {
    it('应该将领域实体列表转换为ORM实体列表', () => {
      const domainEntities = [
        new Role('role-1', '角色1', 'ROLE_1', 'tenant-1', 'admin-1'),
        new Role('role-2', '角色2', 'ROLE_2', 'tenant-1', 'admin-1')
      ];

      const ormEntities = mapper.toOrmList(domainEntities);

      expect(ormEntities).toHaveLength(2);
      expect(ormEntities[0]).toBeInstanceOf(RoleOrmEntity);
      expect(ormEntities[1]).toBeInstanceOf(RoleOrmEntity);
      expect(ormEntities[0].name).toBe('角色1');
      expect(ormEntities[1].name).toBe('角色2');
    });

    it('应该处理空列表', () => {
      const ormEntities = mapper.toOrmList([]);
      expect(ormEntities).toEqual([]);
    });
  });
}); 