#!/usr/bin/env node

/**
 * @file test-database.js
 * @description
 * 数据库连接测试脚本，用于验证开发环境数据库配置是否正确。
 * 
 * 主要功能：
 * 1. 测试数据库连接
 * 2. 验证实体映射
 * 3. 测试基本CRUD操作
 * 4. 检查数据库表结构
 */

const { MikroORM } = require('@mikro-orm/core')
const { TenantEntity } = require('../dist/tenants/infrastructure/database/entities/tenant.entity')

async function testDatabaseConnection() {
  console.log('🔍 开始测试数据库连接...')

  try {
    // 创建MikroORM实例
    const orm = await MikroORM.init({
      type: 'postgresql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 25432,
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'password',
      dbName: process.env.DATABASE_NAME || 'iam-db',
      entities: [TenantEntity],
      debug: true,
    })

    console.log('✅ 数据库连接成功!')

    // 测试数据库连接
    const isConnected = await orm.isConnected()
    console.log(`📊 连接状态: ${isConnected ? '已连接' : '未连接'}`)

    // 获取数据库信息
    const dbName = orm.config.get('dbName')
    console.log(`🗄️  数据库名称: ${dbName}`)

    // 测试实体发现
    const entities = orm.getMetadata().getAll()
    console.log(`📋 发现的实体数量: ${entities.length}`)
    
    for (const [name, meta] of entities) {
      console.log(`  - ${name}: ${meta.className}`)
    }

    // 测试表结构
    const schemaGenerator = orm.getSchemaGenerator()
    const tables = await schemaGenerator.getListTables()
    console.log(`📊 数据库表数量: ${tables.length}`)
    
    for (const table of tables) {
      console.log(`  - ${table.name}`)
    }

    // 测试基本CRUD操作
    console.log('\n🧪 测试基本CRUD操作...')
    
    const em = orm.em.fork()
    
    // 创建测试租户
    const testTenant = em.create(TenantEntity, {
      id: 'test-connection-tenant',
      name: 'Test Connection Tenant',
      code: 'TEST_CONN',
      adminUserId: 'test-admin',
      description: 'Test tenant for database connection',
      status: 'PENDING',
      settings: { maxUsers: 10 },
    })

    await em.persistAndFlush(testTenant)
    console.log('✅ 创建租户成功')

    // 查询租户
    const foundTenant = await em.findOne(TenantEntity, { id: 'test-connection-tenant' })
    if (foundTenant) {
      console.log('✅ 查询租户成功')
      console.log(`  - ID: ${foundTenant.id}`)
      console.log(`  - 名称: ${foundTenant.name}`)
      console.log(`  - 编码: ${foundTenant.code}`)
    }

    // 更新租户
    foundTenant.status = 'ACTIVE'
    await em.persistAndFlush(foundTenant)
    console.log('✅ 更新租户成功')

    // 删除测试数据
    await em.nativeDelete(TenantEntity, { id: 'test-connection-tenant' })
    console.log('✅ 删除租户成功')

    // 关闭连接
    await orm.close()
    console.log('🔌 数据库连接已关闭')

    console.log('\n🎉 数据库测试完成! 所有测试都通过了。')

  } catch (error) {
    console.error('❌ 数据库测试失败:', error.message)
    console.error('详细错误信息:', error)
    process.exit(1)
  }
}

// 加载环境变量
require('dotenv').config({ path: '.env.development' })

// 运行测试
testDatabaseConnection()
