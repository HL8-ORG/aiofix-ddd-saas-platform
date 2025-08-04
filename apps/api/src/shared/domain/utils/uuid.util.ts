import { v4 as uuidv4 } from 'uuid'

/**
 * @function generateUuid
 * @description
 * 生成UUID v4格式的唯一标识符
 *
 * 主要原理与机制：
 * 1. 使用uuid库的v4方法生成符合RFC 4122标准的UUID
 * 2. 返回格式为：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * 3. 其中x是十六进制数字，y是8、9、A或B中的一个
 *
 * @returns {string} 生成的UUID字符串
 * @example
 * const id = generateUuid(); // "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateUuid(): string {
  return uuidv4()
}

/**
 * @function isValidUuid
 * @description
 * 验证字符串是否为有效的UUID格式
 *
 * 主要原理与机制：
 * 1. 使用正则表达式验证UUID格式
 * 2. 检查长度、分隔符位置和字符集
 * 3. 支持所有标准UUID格式（v1, v3, v4, v5）
 *
 * @param {string} uuid - 要验证的UUID字符串
 * @returns {boolean} 是否为有效的UUID
 * @example
 * isValidUuid("550e8400-e29b-41d4-a716-446655440000"); // true
 * isValidUuid("invalid-uuid"); // false
 */
export function isValidUuid(uuid: string): boolean {
  // 验证标准UUID格式：8-4-4-4-12格式，且只包含有效的十六进制字符
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(uuid) || uuid.length !== 36) {
    return false
  }

  // 检查版本号（第3组的第1位）必须是有效的版本号
  const version = Number.parseInt(uuid.charAt(14), 16)
  // 根据RFC 4122，有效版本号：1, 3, 4, 5 (版本号2是保留的)
  if (![1, 3, 4, 5].includes(version)) {
    return false
  }

  // 检查变体位（第4组的第1位）必须是8、9、A或B中的一个
  const variant = Number.parseInt(uuid.charAt(19), 16)
  if (![8, 9, 10, 11].includes(variant)) {
    return false
  }

  return true
}

/**
 * @function isValidUuidV4
 * @description
 * 验证字符串是否为有效的UUID v4格式
 *
 * 主要原理与机制：
 * 1. 使用正则表达式验证UUID v4格式
 * 2. 检查版本号（第4位必须是4）
 * 3. 检查变体位（第8位必须是8、9、A或B）
 *
 * @param {string} uuid - 要验证的UUID字符串
 * @returns {boolean} 是否为有效的UUID v4
 * @example
 * isValidUuidV4("550e8400-e29b-41d4-a716-446655440000"); // true
 * isValidUuidV4("6ba7b810-9dad-11d1-80b4-00c04fd430c8"); // false (v1)
 */
export function isValidUuidV4(uuid: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidV4Regex.test(uuid)
}

/**
 * @function generateShortUuid
 * @description
 * 生成短UUID（去掉连字符的UUID）
 *
 * 主要原理与机制：
 * 1. 生成标准UUID后移除所有连字符
 * 2. 返回32位十六进制字符串
 * 3. 适用于需要更短标识符的场景
 *
 * @returns {string} 生成的短UUID字符串
 * @example
 * const shortId = generateShortUuid(); // "550e8400e29b41d4a716446655440000"
 */
export function generateShortUuid(): string {
  return uuidv4().replace(/-/g, '')
}
