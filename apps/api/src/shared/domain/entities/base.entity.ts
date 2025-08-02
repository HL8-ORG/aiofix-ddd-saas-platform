import { IsDate, IsOptional, IsUUID } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

/**
 * @abstract class BaseEntity
 * @description
 * 基础实体类，为所有领域实体提供通用属性和方法。
 * 这是一个纯领域对象，不包含任何ORM装饰器或数据库依赖。
 * 
 * 主要原理与机制：
 * 1. 使用class-validator装饰器进行数据校验，确保数据完整性
 * 2. 使用class-transformer装饰器控制序列化安全性
 * 3. 提供通用的实体生命周期管理方法
 * 4. 所有实体继承此类，确保领域对象的一致性
 * 5. 通过Expose装饰器控制序列化时哪些字段会被包含
 */
export abstract class BaseEntity {
  /**
   * @property id
   * @description 实体主键，使用UUID格式
   */
  @IsUUID()
  @Expose()
  id: string;

  /**
   * @property createdAt
   * @description 创建时间
   */
  @IsDate()
  @Expose()
  @Transform(({ value }) => value instanceof Date ? value : new Date(value))
  createdAt: Date;

  /**
   * @property updatedAt
   * @description 更新时间
   */
  @IsDate()
  @Expose()
  @Transform(({ value }) => value instanceof Date ? value : new Date(value))
  updatedAt: Date;

  /**
   * @property deletedAt
   * @description 软删除时间，用于软删除功能
   */
  @IsOptional()
  @IsDate()
  @Expose()
  @Transform(({ value }) => value ? (value instanceof Date ? value : new Date(value)) : undefined)
  deletedAt?: Date;

  /**
   * @method isDeleted
   * @description 检查实体是否已被软删除
   * @returns {boolean} 如果已删除返回true，否则返回false
   */
  isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  /**
   * @method softDelete
   * @description 软删除实体，设置删除时间但不物理删除数据
   */
  softDelete(): void {
    this.deletedAt = new Date();
  }

  /**
   * @method restore
   * @description 恢复软删除的实体，清除删除时间
   */
  restore(): void {
    this.deletedAt = undefined;
  }

  /**
   * @method updateTimestamp
   * @description 更新实体的时间戳
   */
  updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
