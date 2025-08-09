/**
 * @class SessionIdRequiredException
 * @description 会话ID必需异常
 */
export class SessionIdRequiredException extends Error {
  constructor() {
    super('Session ID is required');
    this.name = 'SessionIdRequiredException';
  }
}

/**
 * @class InvalidSessionIdException
 * @description 无效会话ID异常
 */
export class InvalidSessionIdException extends Error {
  constructor(message: string = 'Invalid session ID format') {
    super(message);
    this.name = 'InvalidSessionIdException';
  }
}

/**
 * @class SessionNotFoundException
 * @description 会话未找到异常
 */
export class SessionNotFoundException extends Error {
  constructor(sessionId?: string) {
    const message = sessionId ? `Session not found: ${sessionId}` : 'Session not found';
    super(message);
    this.name = 'SessionNotFoundException';
  }
}

/**
 * @class SessionExpiredException
 * @description 会话过期异常
 */
export class SessionExpiredException extends Error {
  constructor(sessionId?: string) {
    const message = sessionId ? `Session expired: ${sessionId}` : 'Session has expired';
    super(message);
    this.name = 'SessionExpiredException';
  }
}

/**
 * @class SessionRevokedException
 * @description 会话被撤销异常
 */
export class SessionRevokedException extends Error {
  constructor(sessionId?: string) {
    const message = sessionId ? `Session revoked: ${sessionId}` : 'Session has been revoked';
    super(message);
    this.name = 'SessionRevokedException';
  }
}

/**
 * @class TooManySessionsException
 * @description 会话数量过多异常
 */
export class TooManySessionsException extends Error {
  constructor(userId?: string) {
    const message = userId ? `Too many active sessions for user: ${userId}` : 'Too many active sessions';
    super(message);
    this.name = 'TooManySessionsException';
  }
}
