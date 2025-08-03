#!/bin/bash

# 用户应用层测试运行脚本

echo "🧪 开始运行用户应用层单元测试..."

# 设置测试环境
export NODE_ENV=test

# 运行用户服务测试
echo "📋 运行用户服务测试..."
npm test -- --testPathPattern=users.service.spec.ts --verbose

# 运行DTO测试
echo "📋 运行CreateUserDto测试..."
npm test -- --testPathPattern=create-user.dto.spec.ts --verbose

echo "📋 运行UpdateUserDto测试..."
npm test -- --testPathPattern=update-user.dto.spec.ts --verbose

echo "📋 运行PaginationDto测试..."
npm test -- --testPathPattern=pagination.dto.spec.ts --verbose

# 运行所有应用层测试
echo "📋 运行所有应用层测试..."
npm test -- --testPathPattern=application/__tests__ --verbose

echo "✅ 用户应用层测试完成！" 