---
kind: configuration_system
name: Next.js 前端环境变量与运行时配置系统
category: configuration_system
scope:
    - '**'
source_files:
    - next.config.ts
    - app/api/collections/route.ts
    - app/api/collections/[id]/documents/route.ts
    - app/api/collections/[id]/chat/route.ts
    - app/api/documents/[id]/content/route.ts
    - app/lib/auth.ts
---

该 Next.js 着陆页应用的配置系统较为简单，主要依赖 Next.js 内置的环境变量机制，没有独立的配置文件或专门的配置管理模块。

**使用的系统与工具**
- Next.js 原生 `process.env` 环境变量读取机制
- 使用 `NEXT_PUBLIC_` 前缀的客户端可访问环境变量（`NEXT_PUBLIC_API_BASE_URL`）
- 无 `.env`、`.env.local` 等环境变量文件（仓库中未包含）
- `next.config.ts` 为空的 Next.js 配置占位文件

**关键文件与位置**
- `app/api/collections/route.ts`：通过 `process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080'` 获取后端 API 基础地址
- `app/api/collections/[id]/documents/route.ts`：同上模式
- `app/api/collections/[id]/chat/route.ts`：同上模式
- `app/api/documents/[id]/content/route.ts`：同上模式
- `next.config.ts`：空的 Next.js 配置对象
- `package.json`：定义构建脚本和依赖，无额外配置项

**架构与约定**
- 所有 API 路由文件采用统一的配置读取模式：在文件顶部声明 `BACKEND_BASE_URL` 常量，使用环境变量回退到本地开发地址 `http://127.0.0.1:8080`
- 后端服务地址通过 `NEXT_PUBLIC_API_BASE_URL` 环境变量注入，默认指向本地 8080 端口
- 认证相关配置（如 token key 名称 `amemoryi_token`）硬编码在 `app/lib/auth.ts` 中
- 没有集中式的配置管理模块，每个 API 路由独立读取环境变量

**约束与限制**
- 仅支持单一后端地址配置，不支持多环境或多后端切换
- 缺少环境变量验证和类型检查
- 认证密钥等敏感信息以字符串形式硬编码，未使用专用配置管理
- 没有配置文件版本控制或部署时的配置注入机制