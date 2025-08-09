import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/entities/role.entity';
import { Permission } from 'src/entities/permission.entity';

/**
 * @class IsUnique
 * @implements ValidatorConstraintInterface
 * @description
 * 自定义唯一性校验器，用于class-validator的@Validate装饰器，实现数据库字段的唯一性校验。
 *
 * 代码原理与机制说明：
 * 1. 该类通过@ValidatorConstraint装饰器声明为异步校验器（async: true），并结合@Injectable实现依赖注入。
 * 2. 构造函数注入MikroORM的EntityManager，便于动态获取任意实体的Repository进行数据库查询。
 * 3. validate方法为核心校验逻辑：
 *    - 通过args.constraints参数动态获取目标表名（实体名）和字段名。
 *    - 调用EntityManager的getRepository方法获取对应实体的Repository。
 *    - 使用findOne方法查询数据库中是否存在指定字段值的记录。
 *    - 若存在（dataExist为真），说明该值已被占用，返回false；否则返回true，表示唯一。
 * 4. defaultMessage方法用于自定义校验失败时的错误提示，自动显示当前字段名。
 * 5. 该校验器可复用于任意需要唯一性校验的DTO字段，提升数据一致性和复用性。
 */
@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
@Injectable()
export class IsUnique implements ValidatorConstraintInterface {
  /**
   * @constructor
   * @param em MikroORM的EntityManager实例，用于数据库操作
   */
  constructor(private readonly em: EntityManager) {}

  /**
   * @method validate
   * @description
   * 校验目标字段值在指定表（实体）中是否唯一。
   *
   * @param value 待校验的字段值
   * @param args 校验参数，包含约束条件（表名、字段名）
   * @returns Promise<boolean> 唯一返回true，否则返回false
   */
  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    // 从约束参数中获取表名（实体名）和字段名
    const [tableName, column] = args?.constraints as string[];

    // 查询数据库，判断该字段值是否已存在
    const dataExist = await this.em
      .getRepository(tableName)
      .findOne({ [column]: value });

    // 若已存在则校验失败，否则通过
    return !dataExist;
  }

  /**
   * @method defaultMessage
   * @description
   * 自定义校验失败时的错误提示信息。
   *
   * @param validationArguments 校验参数，包含字段名等信息
   * @returns string 错误提示文本
   */
  defaultMessage(validationArguments: ValidationArguments): string {
    const field = validationArguments.property;
    return `${field} 已存在，请更换后重试。`;
  }
}
