#!/bin/bash

# 缓存基础设施层测试运行脚本

echo "🚀 开始运行缓存基础设施层测试..."

# 设置测试环境
export NODE_ENV=test
export CACHE_ENABLED=true
export REDIS_HOST=localhost
export REDIS_PORT=6379

# 运行所有测试
echo "📋 运行单元测试..."
npm test -- --testPathPattern="cache" --verbose

# 运行特定测试文件
echo "📋 运行缓存键生成器测试..."
npm test -- --testPathPattern="cache-key.generator.spec.ts" --verbose

echo "📋 运行内存缓存测试..."
npm test -- --testPathPattern="memory-cache.service.spec.ts" --verbose

echo "📋 运行多级缓存测试..."
npm test -- --testPathPattern="multi-level-cache.service.spec.ts" --verbose

echo "📋 运行租户感知缓存测试..."
npm test -- --testPathPattern="tenant-aware-cache.service.spec.ts" --verbose

echo "📋 运行缓存拦截器测试..."
npm test -- --testPathPattern="cache.interceptor.spec.ts" --verbose

echo "📋 运行缓存装饰器测试..."
npm test -- --testPathPattern="cache.decorator.spec.ts" --verbose

echo "📋 运行集成测试..."
npm test -- --testPathPattern="cache-integration.spec.ts" --verbose

echo "✅ 所有测试完成！"
