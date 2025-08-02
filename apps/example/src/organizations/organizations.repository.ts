import { EntityRepository } from '@mikro-orm/postgresql';
import { Organization } from 'src/entities/organization.entity';

/**
 * @class OrganizationRepository
 * @extends EntityRepository<Organization>
 * @description
 * 组织（Organization）实体仓库，继承自MikroORM的EntityRepository，封装了对Organization实体的所有ORM操作。
 *
 * 代码原理与机制说明：
 * 1. 通过继承EntityRepository<Organization>，自动获得MikroORM提供的通用CRUD方法（如find、findOne、persist等），
 *    无需手动实现基础的数据访问逻辑。
 * 2. 该仓库类可作为依赖注入到Service层，便于在业务逻辑中直接操作组织实体的数据持久化与查询。
 * 3. 支持后续扩展自定义的查询方法或复杂的数据操作，提升代码的可维护性与复用性。
 * 4. 结合多租户机制（如租户拦截器与订阅器），所有ORM操作会自动带有租户隔离，确保数据安全。
 */
export class OrganizationRepository extends EntityRepository<Organization> {
  // 在此处添加自定义的查询方法或复杂的数据操作
}
