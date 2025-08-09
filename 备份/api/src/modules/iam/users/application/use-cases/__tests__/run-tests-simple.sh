#!/bin/bash

# 简化的用户领域用例测试运行脚本

echo "🧪 开始运行用户领域用例单元测试..."

# 获取当前目录
CURRENT_DIR=$(pwd)
echo "📁 当前目录: $CURRENT_DIR"

# 检查是否在正确的目录
if [[ ! "$CURRENT_DIR" == *"__tests__"* ]]; then
    echo "❌ 请确保在__tests__目录中运行此脚本"
    exit 1
fi

# 检查测试文件是否存在
if [ ! -f "create-user.use-case.spec.ts" ]; then
    echo "❌ 未找到测试文件，请确保在正确的测试目录中"
    exit 1
fi

echo "📋 找到测试文件，开始运行测试..."

# 运行所有测试
echo "🔍 运行所有用户用例测试..."
npx jest --testPathPattern=".*\.spec\.ts$" --verbose

# 检查测试结果
if [ $? -eq 0 ]; then
    echo "✅ 所有测试通过!"
else
    echo "❌ 部分测试失败!"
    exit 1
fi

# 运行覆盖率测试
echo "📊 生成测试覆盖率报告..."
npx jest --testPathPattern=".*\.spec\.ts$" --coverage --coverageReporters=text --coverageReporters=lcov --coverageReporters=html

echo "🎉 测试完成!" 