import { registerAs } from '@nestjs/config';
import { Params } from 'pino-nestjs';
import { v4 as uuidv4 } from 'uuid';
import { FastifyRequest } from 'fastify';
import { User } from 'src/entities/user.entity';
import pino from 'pino';

/**
 * @function pinoLoggerConfig
 * @description
 * Pino日志配置函数，用于注册NestJS应用的日志系统配置。
 *
 * 主要原理与机制如下：
 * 1. 使用registerAs注册配置命名空间'pinoLogger'，便于依赖注入时按命名空间获取配置
 * 2. 配置pino-http中间件，支持HTTP请求日志记录，包括请求ID生成、序列化、自定义属性等
 * 3. 通过pino.destination配置日志输出流，支持文件输出和同步/异步写入控制
 * 4. 自定义请求序列化器，记录详细的请求信息（方法、URL、用户代理、IP等）
 * 5. 通过customProps注入用户信息到日志上下文，便于追踪用户操作
 * 6. 启用quietReqLogger减少冗余的请求日志输出
 * 7. 适配Fastify平台，使用FastifyRequest类型替代Express的Request类型
 */
const pinoLoggerConfig: any = registerAs('pinoLogger', () => ({
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
      },
    },
    stream: pino.destination({
      dest: process.env.LOGS_FILE_NAME || './logs/app.log',
      sync: false,
    }),
    genReqId: (req: { headers: { [x: string]: any } }) =>
      req.headers['x-correlation-id'] || uuidv4(),
    serializers: {
      req: (req: {
        id: any;
        method: any;
        url: any;
        headers: { [x: string]: any };
        ip: any;
        body: any;
        query: any;
        params: any;
      }) => {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
          userAgent: req.headers['user-agent'],
          language: req.headers['accept-language'],
          ip: req.ip,
          body: req.body,
          query: req.query,
          params: req.params,
        };
      },
      res: (res: { statusCode: any }) => {
        return {
          statusCode: res.statusCode,
        };
      },
    },
    customProps(req: FastifyRequest & { user?: User }) {
      const user = req.user as User;
      return {
        user: user
          ? {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role ? user.role.name : 'unknown',
            }
          : {},
      };
    },
    quietReqLogger: true,
  },
}));

export default pinoLoggerConfig;
