import { EntityRepository } from '@mikro-orm/postgresql';
import { User } from 'src/entities/user.entity';

/**
 * @class UserRepository
 * @description
 * 用户实体自定义仓库，继承自MikroORM的EntityRepository<User>，用于封装与User实体相关的数据库操作。
 *
 * 代码原理与机制说明：
 * 1. 通过继承EntityRepository<User>，自动获得MikroORM提供的所有通用CRUD方法（如find、findOne、persist等），
 *    支持对User实体的高效数据访问与操作。
 * 2. 该类可扩展自定义的用户查询方法或复杂的数据操作逻辑，实现领域相关的数据访问封装，提升代码复用性与可维护性。
 * 3. 在依赖注入时，可作为Repository注入到Service层，实现业务与数据访问的解耦。
 */
export class UserRepository extends EntityRepository<User> {
  // 可在此扩展自定义的用户数据访问方法
}
