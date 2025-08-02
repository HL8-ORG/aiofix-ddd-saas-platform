import {
  BigIntType,
  OptionalProps,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

/**
 * @abstract
 * @class CustomBaseEntity
 * @description
 * 所有实体的基础抽象类，统一定义主键、自带创建与更新时间戳字段，便于继承和扩展。
 *
 * 原理与机制说明：
 * 1. 通过@PrimaryKey装饰器定义id为主键，类型为bigint，确保主键自增且支持大数据量。
 * 2. createdAt字段使用@Property装饰，类型为date，默认值为当前时间，自动记录实体创建时间。
 * 3. updatedAt字段同样使用@Property装饰，类型为date，并通过onUpdate钩子在每次实体更新时自动刷新为当前时间，实现更新时间追踪。
 * 4. [OptionalProps]声明createdAt、updatedAt、tenant为可选属性，便于MikroORM在插入和更新时自动处理这些字段，无需手动赋值。
 * 5. 该基类可被所有业务实体继承，实现主键与时间戳字段的统一管理，提升开发效率与一致性。
 */
export abstract class CustomBaseEntity {
  /**
   * @property [OptionalProps]
   * @description
   * 声明createdAt、updatedAt、tenant为可选属性，便于MikroORM自动处理。
   */
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'tenant';

  /**
   * @property id
   * @description
   * 实体主键，自增bigint类型，保证唯一性和扩展性。
   */
  @PrimaryKey({ type: new BigIntType('bigint') })
  id: number;

  /**
   * @property createdAt
   * @description
   * 实体创建时间，插入时自动赋值为当前时间。
   */
  @Property({ type: 'date' })
  createdAt = new Date();

  /**
   * @property updatedAt
   * @description
   * 实体更新时间，每次更新时自动刷新为当前时间。
   */
  @Property({ onUpdate: () => new Date(), type: 'date' })
  updatedAt = new Date();
}
