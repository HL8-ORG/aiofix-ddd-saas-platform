#!/bin/bash

# 修复UserStatus构造函数错误的脚本

echo "🔧 开始修复UserStatus构造函数错误..."

# 修复导入语句
echo "📝 修复导入语句..."
find . -name "*.spec.ts" -exec sed -i 's/import { UserStatus } from/import { UserStatus, UserStatusValue } from/g' {} \;

# 修复构造函数调用
echo "🔨 修复构造函数调用..."
find . -name "*.spec.ts" -exec sed -i 's/new UserStatus(/new UserStatusValue(/g' {} \;

echo "✅ UserStatus构造函数错误修复完成！" 