#!/bin/bash

# 用户领域用例测试运行脚本 - 最终版本

echo "🧪 开始运行用户领域用例单元测试..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 脚本目录: $SCRIPT_DIR"

# 检查测试文件是否存在
if [ ! -f "$SCRIPT_DIR/create-user.use-case.spec.ts" ]; then
    echo "❌ 未找到测试文件，请确保在正确的测试目录中"
    exit 1
fi

echo "✅ 找到测试文件，开始运行测试..."

# 获取项目根目录（向上7级目录）
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../../../.." && pwd)"
echo "📁 项目根目录: $PROJECT_ROOT"

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