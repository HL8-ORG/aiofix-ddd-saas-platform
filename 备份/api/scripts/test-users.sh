#!/bin/bash

# 用户模块测试脚本
# 运行所有用户子领域的测试用例

set -e  # 遇到错误时退出

echo "🧪 开始运行用户模块测试..."
echo "=================================="

# 切换到API目录
cd "$(dirname "$0")/.."

# 定义测试路径模式
USER_TESTS=(
  "src/modules/iam/users/application/__tests__"
  "src/modules/iam/users/infrastructure/__tests__"
  "src/modules/iam/users/presentation/__tests__"
)

# 运行所有用户模块测试
echo "📋 运行所有用户模块测试..."
npm test -- --testPathPattern="($(IFS='|'; echo "${USER_TESTS[*]}"))" --verbose

echo ""
echo "✅ 用户模块测试完成！"
echo "=================================="

# 显示测试覆盖率（如果配置了）
if [ -f "coverage/lcov-report/index.html" ]; then
  echo "📊 测试覆盖率报告已生成:"
  echo "   - HTML报告: coverage/lcov-report/index.html"
  echo "   - LCOV报告: coverage/lcov.info"
fi

echo ""
echo "🎯 测试包括："
echo "   - 应用层测试 (UsersService)"
echo "   - 基础设施层测试 (UserRepository)"
echo "   - 表现层测试 (UsersController)"
echo "   - DTO测试"
echo "   - 值对象测试" 