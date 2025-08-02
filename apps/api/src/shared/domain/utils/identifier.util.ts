/**
 * @file identifier.util.ts
 * @description
 * 通用业务唯一标识符/编码的标准化与校验工具，适用于租户、用户、组织等领域。
 *
 * 主要功能：
 * 1. normalizeIdentifier：标准化编码（trim、toLowerCase、下划线/空格转连字符等）
 * 2. validateIdentifier：校验编码的合法性（长度、字符集、连字符规则等）
 */

/**
 * @function normalizeIdentifier
 * @description
 * 标准化业务唯一标识符/编码：
 * - 去除首尾空格
 * - 下划线、空格全部转为连字符
 * - 转为小写
 *
 * @param value 原始编码字符串
 * @returns 标准化后的编码
 */
export function normalizeIdentifier(value: string): string {
  return value.trim().replace(/_/g, '-').replace(/\s+/g, '-').toLowerCase();
}

/**
 * @function validateIdentifier
 * @description
 * 校验业务唯一标识符/编码的合法性：
 * - 非空
 * - 长度范围
 * - 只允许小写字母、数字、连字符
 * - 不允许以连字符开头或结尾
 * - 可选：不允许连续连字符
 *
 * @param value 编码字符串（应已标准化）
 * @param options 校验选项
 * @throws {Error} 校验不通过时抛出异常
 */
export function validateIdentifier(
  value: string,
  options: {
    minLength?: number;
    maxLength?: number;
    allowConsecutiveHyphens?: boolean;
    errorPrefix?: string;
  } = {}
): void {
  const {
    minLength = 3,
    maxLength = 50,
    allowConsecutiveHyphens = true,
    errorPrefix = '编码'
  } = options;

  if (!value || value.trim().length === 0) throw new Error(`${errorPrefix}不能为空`);
  if (value.length < minLength) throw new Error(`${errorPrefix}至少需要${minLength}个字符`);
  if (value.length > maxLength) throw new Error(`${errorPrefix}不能超过${maxLength}个字符`);
  if (!/^[a-z0-9_-]+$/.test(value)) throw new Error(`${errorPrefix}只能包含小写字母、数字、下划线和连字符`);
  if (!allowConsecutiveHyphens && value.includes('--')) throw new Error(`${errorPrefix}不能包含连续的连字符`);
  if (value.startsWith('-') || value.endsWith('-')) throw new Error(`${errorPrefix}不能以连字符开头或结尾`);
}