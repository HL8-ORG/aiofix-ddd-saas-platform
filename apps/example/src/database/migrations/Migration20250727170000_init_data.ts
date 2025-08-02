import { Migration } from '@mikro-orm/migrations';

/**
 * @class Migration20250727170000_init_data
 * @extends Migration
 * @description
 * 初始化基础数据的迁移文件，用于创建系统必需的角色和权限数据。
 * 
 * 主要原理与机制如下：
 * 1. 创建基础权限（permissions）：包括用户管理、组织管理、角色管理等核心权限。
 * 2. 创建基础角色（roles）：包括admin和user两个基础角色，admin拥有所有权限，user只有基本权限。
 * 3. 建立角色-权限关联：通过role_permissions中间表建立角色与权限的多对多关系。
 * 4. 使用PostgreSQL兼容的SQL语法，确保迁移在不同环境下的一致性。
 */
export class Migration20250727170000_init_data extends Migration {

  override async up(): Promise<void> {
    // 创建基础权限
    this.addSql(`insert into "permission" ("id", "created_at", "updated_at", "name", "action", "subject") values (1, '2025-01-27', '2025-01-27', 'create:user', 'create', 'User');`);
    this.addSql(`insert into "permission" ("id", "created_at", "updated_at", "name", "action", "subject") values (2, '2025-01-27', '2025-01-27', 'read:user', 'read', 'User');`);
    this.addSql(`insert into "permission" ("id", "created_at", "updated_at", "name", "action", "subject") values (3, '2025-01-27', '2025-01-27', 'update:user', 'update', 'User');`);
    this.addSql(`insert into "permission" ("id", "created_at", "updated_at", "name", "action", "subject") values (4, '2025-01-27', '2025-01-27', 'delete:user', 'delete', 'User');`);
    this.addSql(`insert into "permission" ("id", "created_at", "updated_at", "name", "action", "subject") values (5, '2025-01-27', '2025-01-27', 'create:organization', 'create', 'Organization');`);
    this.addSql(`insert into "permission" ("id", "created_at", "updated_at", "name", "action", "subject") values (6, '2025-01-27', '2025-01-27', 'read:organization', 'read', 'Organization');`);
    this.addSql(`insert into "permission" ("id", "created_at", "updated_at", "name", "action", "subject") values (7, '2025-01-27', '2025-01-27', 'update:organization', 'update', 'Organization');`);
    this.addSql(`insert into "permission" ("id", "created_at", "updated_at", "name", "action", "subject") values (8, '2025-01-27', '2025-01-27', 'delete:organization', 'delete', 'Organization');`);

    // 创建基础角色
    this.addSql(`insert into "role" ("id", "created_at", "updated_at", "name") values (1, '2025-01-27', '2025-01-27', 'admin');`);
    this.addSql(`insert into "role" ("id", "created_at", "updated_at", "name") values (2, '2025-01-27', '2025-01-27', 'user');`);

    // 为admin角色分配所有权限
    this.addSql(`insert into "role_permissions" ("role_id", "permission_id") values (1, 1);`);
    this.addSql(`insert into "role_permissions" ("role_id", "permission_id") values (1, 2);`);
    this.addSql(`insert into "role_permissions" ("role_id", "permission_id") values (1, 3);`);
    this.addSql(`insert into "role_permissions" ("role_id", "permission_id") values (1, 4);`);
    this.addSql(`insert into "role_permissions" ("role_id", "permission_id") values (1, 5);`);
    this.addSql(`insert into "role_permissions" ("role_id", "permission_id") values (1, 6);`);
    this.addSql(`insert into "role_permissions" ("role_id", "permission_id") values (1, 7);`);
    this.addSql(`insert into "role_permissions" ("role_id", "permission_id") values (1, 8);`);

    // 为user角色分配基本权限（只读权限）
    this.addSql(`insert into "role_permissions" ("role_id", "permission_id") values (2, 2);`);
    this.addSql(`insert into "role_permissions" ("role_id", "permission_id") values (2, 6);`);
  }

  override async down(): Promise<void> {
    // 删除角色-权限关联
    this.addSql(`delete from "role_permissions" where "role_id" in (1, 2);`);
    
    // 删除角色
    this.addSql(`delete from "role" where "id" in (1, 2);`);
    
    // 删除权限
    this.addSql(`delete from "permission" where "id" between 1 and 8;`);
  }

} 