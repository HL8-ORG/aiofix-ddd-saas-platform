import type { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { UserFactory } from '../factories/user.factory';
import { Role } from '../../entities/role.entity';
import { User } from '../../entities/user.entity';
import { Tenant } from '../../entities/tenant.entity';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../../common/constants';

/**
 * @class DatabaseSeeder
 * @extends Seeder
 * @description
 * 数据库主种子类，用于初始化数据库中的基础数据（如用户、角色、租户等）。
 *
 * 原理与机制说明：
 * 1. 继承自MikroORM的Seeder基类，实现run方法以注入EntityManager进行数据操作。
 * 2. 首先查找数据库中是否存在'user'和'admin'角色，若不存在则抛出异常，保证后续数据的完整性。
 * 3. 使用UserFactory批量创建5个用户，每个用户分配'user'角色，并为其动态创建唯一的租户（租户名基于用户名和随机数拼接，确保唯一性）。
 * 4. 额外创建一个管理员用户（admin），分配'admin'角色，并为其创建名为'admin'的租户。管理员密码使用bcrypt进行加密，安全性更高。
 * 5. 所有实体的创建均通过EntityManager的create方法，确保与ORM生命周期一致。
 */
export class DatabaseSeeder extends Seeder {
  /**
   * @method run
   * @param em - MikroORM的EntityManager实例，用于数据库操作
   * @description
   * 执行数据库种子逻辑，批量创建普通用户和管理员用户，并为每个用户分配角色和租户。
   */
  async run(em: EntityManager): Promise<void> {
    // 查找'user'和'admin'角色，确保角色存在
    const roleUser = await em.findOne(Role, { name: 'user' });
    const roleAdmin = await em.findOne(Role, { name: 'admin' });

    if (!roleUser) throw new Error("Role 'user' not found");
    if (!roleAdmin) throw new Error("Role 'admin' not found");

    // 批量创建5个普通用户，每个用户分配'user'角色和唯一租户
    new UserFactory(em)
      .each((user) => {
        user.role = roleUser;
        // 为每个用户创建唯一租户，租户名由用户名和随机数拼接
        user.tenant = em.create(
          Tenant,
          new Tenant(user.username + Math.random().toString() + '.test.app'),
        )!;
      })
      .create(5);

    // 创建管理员用户，分配'admin'角色和专属租户，密码加密存储
    em.create(User, {
      username: 'admin',
      email: 'admin@admin.com',
      password: await bcrypt.hash('password', SALT_ROUNDS),
      role: roleAdmin,
      tenant: em.create(Tenant, new Tenant('admin')),
    });
  }
}
