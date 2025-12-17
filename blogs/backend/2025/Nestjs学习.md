---
title: Nestjs学习
date: 20205-12-217
tags:
  - Nestjs
categories:
  - 后端
isShowComments: true
sticky:
  - true
  - 1
---

时隔两年多，终于想起更新博客的技术贴。总结下这两年 Nestjs 框架的自学内容。

---

参考文档：

1. [Nestjs 官方文档](https://nestjs.com/)
2. [Nestjs 中文文档](https://docs.nestjs.cn/introduction/)
3. [TypeORM 中文文档](https://typeorm.bootcss.com/)
4. [PM2 官方文档](https://pm2.node.org.cn/docs/usage/quick-start/)
5. [官方 TypeScript 项目模板](https://github.com/nestjs/typescript-starter)

## 一、框架介绍

核心定位：NestJS 是高效、可扩展的 Node.js 服务端框架，基于 TypeScript 构建（兼容纯 JS），融合 OOP、FP、FRP 编程思想。

底层依赖：默认使用 Express 作为 HTTP 服务器，可替换为 Fastify，支持直接调用底层框架 API 及第三方模块。

核心优势：提供开箱即用的架构，实现高可测试、松耦合、易维护的应用开发，设计灵感源自 Angular。

## 二、开发实战

2.1 环境准备与项目创建

环境要求：Node.js ≥20（推荐 LTS 版本）

包管理器：npm/yarn/pnpm（推荐用 nvm 管理 Node 版本）

项目创建（Nest CLI 方式）：

```bash
# 全局安装 Nest CLI
npm i -g @nestjs/cli
# 创建项目（--strict 可选，开启严格 TypeScript 校验）
nest new project-name --strict
# 启动项目
cd project-name && npm run start
```

访问 http://localhost:3000 验证启动成功。

2.2 核心组件及应用场景

### 1. 过滤器（Exception Filter）

- **场景 1** 统一 HTTP 异常处理

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    response.status(status).json({
      code: status,
      message: exception.getResponse(),
      timestamp: new Date().toISOString(),
    });
  }
}
```

- **场景 2** 自定义业务异常捕获

```typescript
@Catch(CustomBusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
  catch(exception: CustomBusinessException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.status(400).json({
      code: "BUSINESS_ERROR",
      message: exception.message,
      data: exception.data,
    });
  }
}
```

### 2. 守卫（Guard）

- **场景 1** 接口权限校验

```typescript
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return !!request.headers.authorization; // 校验 Token 存在性
  }
}
```

- **场景 2** 角色权限校验

```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler()
    );
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
```

### 3. 中间件（Middleware）

- **场景 1** 请求日志记录

```typescript
import { Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    next();
  }
}
```

- **场景 2** 请求参数预处理

```typescript
@Injectable()
export class ParamsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    req.body = req.body || {};
    req.body.timestamp = Date.now(); // 统一添加时间戳
    next();
  }
}
```

### 4. 管道（Pipe）

- **场景 1** 数据校验（使用 class-validator）

```typescript
import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException("数据校验失败");
    }
    return object;
  }
}
```

- **场景 2** 参数类型转换（使用 class-transformer）

```typescript
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException("参数必须为数字");
    }
    return val;
  }
}
```

### 5. 拦截器（Interceptor）

- **场景 1** 响应数据格式化

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: "success",
        data,
        timestamp: new Date().toISOString(),
      }))
    );
  }
}
```

- **场景 2** 请求超时控制

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from "@nestjs/common";
import { Observable, throwError, TimeoutError } from "rxjs";
import { timeout, catchError } from "rxjs/operators";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000), // 5秒超时
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException("请求超时"));
        }
        return throwError(() => err);
      })
    );
  }
}
```

## 三、部署方案

### 3.1 构建生产包

```bash
# 编译 TypeScript 代码
npm run build
```

构建产物输出至 dist 目录。

### 3.2 常用部署方式

- 方式 1：Docker 部署（推荐）
  创建 Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

构建并启动容器：

```bash
docker build -t nest-app .
docker run -d -p 3000:3000 nest-app
```

- 方式 2：PM2 进程守护

```bash
# 安装 PM2
npm i -g pm2
# 启动应用
pm2 start dist/main.js --name nest-app
```

ecosystem.config.js 配置示例

```javascript
module.exports = {
  apps: [
    {
      name: "nestjs-app",
      script: "dist/src/main.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

## 四、日志管理

### 4.1 内置日志模块

```typescript
import { Controller, Get, Logger } from "@nestjs/common";

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get()
  getHello() {
    this.logger.log("访问首页"); // 普通日志
    this.logger.warn("接口即将 deprecated"); // 警告日志
    this.logger.error("数据查询失败"); // 错误日志
    return "Hello World!";
  }
}
```

### 4.2 集成第三方日志库（Winston）

安装依赖：

```bash
npm install winston @nestjs/logger
```

配置 Winston 日志：

```typescript
// winston.config.ts
import { createLogger, transports, format } from "winston";

export const winstonLogger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});
```

在主程序中使用：

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { winstonLogger } from "./winston.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: winstonLogger });
  await app.listen(3000);
}
bootstrap();
```

## 五、JWT 认证（实战优化版）

JWT（JSON Web Token）是 NestJS 中最常用的身份认证方案，结合 `passport` 可实现灵活、安全的接口权限控制，以下是完整实现流程：

### 5.1 安装核心依赖

```bash
# 核心依赖：JWT 模块 + Passport 认证框架
npm install @nestjs/jwt passport passport-jwt
# TypeScript 类型声明（必装）
npm install -D @types/passport-jwt
```

### 5.2 全局 JWT 模块配置（优化密钥管理）

```typescript
// src/auth/jwt-auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ConfigEnum } from "src/enum/config.enum";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }), // 全局默认认证策略
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // 异步配置：从环境变量读取密钥（避免硬编码）
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(ConfigEnum.SECRET), // 环境变量存储密钥
        signOptions: { expiresIn: "60m" }, // Token 有效期（按需调整）
      }),
    }),
  ],
  exports: [JwtModule, PassportModule], // 导出供其他模块复用
})
export class JwtAuthModule {}
```

### 5.3 实现 JWT 策略（Passport 适配）

```typescript
// src/auth/strategies/jwt.strategy.ts
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfigEnum } from "src/enum/config.enum";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/modules/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService // 注入用户服务，验证用户有效性
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从 Bearer Token 提取 JWT
      ignoreExpiration: false, // 不忽略 Token 过期（过期自动抛错）
      secretOrKey: configService.get<string>(ConfigEnum.SECRET),
    });
  }

  /**
   * Token 验证通过后执行：解析 payload 并附加到 req.user
   * @param payload JWT 解密后的负载
   */
  async validate(payload: any) {
    // 校验用户是否存在（增强安全性，避免无效 Token 访问）
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("用户不存在或已注销");
    }
    // 返回值自动挂载到 Request.user
    return {
      userId: payload.sub, // 标准字段：用户唯一标识
      account: payload.account,
      userType: payload.userType,
    };
  }
}
```

### 5.4 封装 JWT 守卫（全局/局部可用）

```typescript
// src/auth/guards/jwt.guard.ts
import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

/**
 * JWT 认证守卫：复用 Passport 的 jwt 策略
 * 支持局部接口/控制器使用，或全局注册
 */
@Injectable()
export class JwtGuard extends AuthGuard("jwt") {}
```

### 5.5 生成 JWT Token（登录接口示例）

```typescript
// src/modules/auth/auth.service.ts
import { Injectable, Error } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import * as bcrypt from "bcrypt"; // 密码加密校验（需安装：npm i bcrypt @types/bcrypt）

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  /**
   * 用户登录：验证账号密码后生成 Token
   * @param account 用户名/账号
   * @param password 原始密码（实际需加密比对）
   */
  async login(account: string, password: string) {
    // 1. 查询用户并校验密码（bcrypt 比对加密后的密码）
    const user = await this.userService.findByAccount(account);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("账号或密码错误");
    }

    // 2. 生成 JWT Token（payload 存储核心用户信息）
    const payload = {
      sub: user.id, // 标准字段：用户唯一标识
      account: user.account,
      userType: user.userType,
    };

    return {
      access_token: this.jwtService.sign(payload), // 生成 Token
      expiresIn: "60m", // 告知前端有效期
      user: { userId: user.id, account: user.account, userType: user.userType },
    };
  }
}
```

### 5.6 接口使用方式（3 种场景）

方式 1：局部使用（单个控制器/接口）

```typescript
// src/modules/user/user.controller.ts
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import type { Request } from "express";

@Controller("user")
@UseGuards(JwtGuard) // 控制器下所有接口需认证
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  getProfile(@Req() req: Request) {
    // req.user 为 JwtStrategy.validate 返回的用户信息
    return this.userService.findById((req.user as any).userId);
  }
}
```

方式 2：全局使用（所有接口默认认证）

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtGuard } from "./auth/guards/jwt.guard";
import { JwtAuthModule } from "./auth/jwt-auth.module";

@Module({
  imports: [JwtAuthModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard, // 全局注册，所有接口默认需 JWT 认证
    },
  ],
})
export class AppModule {}
```

方式 3：忽略认证（部分接口放行）

1. 先定义跳过认证装饰器：

```typescript
// src/common/decorators/skip-auth.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const SkipAuth = () => SetMetadata("skipAuth", true);
```

2. 改造 JwtGuard 支持跳过逻辑：

```typescript
// src/auth/guards/jwt.guard.ts
import { AuthGuard } from "@nestjs/passport";
import { Injectable, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 检查是否有跳过认证的装饰器
    const skipAuth = this.reflector.getAllAndOverride<boolean>("skipAuth", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipAuth) return true;
    return super.canActivate(context);
  }
}
```

3. 接口使用：

```typescript
@Controller("user")
@UseGuards(JwtGuard)
export class UserController {
  // 无需登录即可访问
  @Get("public-info")
  @SkipAuth()
  getPublicInfo() {
    return "公开数据：xxx";
  }
}
```
