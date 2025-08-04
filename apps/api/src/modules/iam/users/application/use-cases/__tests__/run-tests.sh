#!/bin/bash

# 用户领域用例测试运行脚本

echo "🧪 开始运行用户领域用例单元测试..."

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../../../.." && pwd)"

echo "📁 脚本目录: $SCRIPT_DIR"
echo "📁 项目根目录: $PROJECT_ROOT"

# 检查测试目录是否存在
if [ ! -d "$SCRIPT_DIR" ]; then
    echo "❌ 测试目录不存在: $SCRIPT_DIR"
    exit 1
fi

# 进入项目根目录
cd "$PROJECT_ROOT"

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "❌ 在项目根目录未找到package.json"
    exit 1
fi

echo "📋 运行所有用户用例测试..."
echo "🔍 测试路径: $SCRIPT_DIR"

# 运行所有测试
npm test -- --testPathPattern="$SCRIPT_DIR" --verbose

# 检查测试结果
if [ $? -eq 0 ]; then
    echo "✅ 所有测试通过!"
else
    echo "❌ 部分测试失败!"
    exit 1
fi

# 运行覆盖率测试
echo "📊 生成测试覆盖率报告..."
npm test -- --testPathPattern="$SCRIPT_DIR" --coverage --coverageReporters=text --coverageReporters=lcov --coverageReporters=html

echo "🎉 测试完成!" 