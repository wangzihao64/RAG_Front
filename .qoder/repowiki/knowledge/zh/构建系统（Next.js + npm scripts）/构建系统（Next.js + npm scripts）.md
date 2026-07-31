---
kind: build_system
name: 构建系统（Next.js + npm scripts）
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - next.config.ts
    - tsconfig.json
    - postcss.config.mjs
---

该仓库是一个基于 Next.js App Router 的前端应用，构建系统完全依赖 npm scripts 与 Next.js 内置构建流程，未使用 Makefile、Dockerfile 或 CI/CD 配置文件。

**使用的系统与工具**
- 包管理器：npm（由 package-lock.json 锁定版本）
- 框架构建器：Next.js 16.2.12（内置 build/start/dev 命令）
- TypeScript：5.x，通过 `next` 插件集成到编译流程
- 代码检查：ESLint 9（`eslint-config-next` 规则集）
- CSS：Tailwind CSS v4 + @tailwindcss/postcss

**关键文件**
- `package.json`：定义 dev/build/start/lint 四个脚本命令及所有依赖
- `next.config.ts`：Next.js 配置（当前为空对象，使用默认值）
- `tsconfig.json`：TypeScript 编译选项，启用 strict、noEmit、isolatedModules 等严格模式，路径别名 `@/*` → `./*`
- `postcss.config.mjs`：PostCSS/Tailwind 配置
- `.gitignore`：忽略 node_modules 等构建产物

**构建流程与约定**
- 开发：`npm run dev` 启动 Next.js 开发服务器
- 生产构建：`npm run build` 调用 `next build` 生成静态优化产物至 `.next` 目录
- 运行：`npm run start` 启动生产服务器
- 代码检查：`npm run lint` 执行 ESLint
- 无自定义打包脚本，所有构建逻辑由 Next.js 内部处理
- 未配置环境变量注入、代码分割优化、CDN 部署等高级构建选项

**约束与限制**
- 项目标记为 `private: true`，不发布到 npm
- 未包含 Dockerfile、CI 流水线或自动化部署脚本
- 未使用 monorepo 或 workspace 管理多包
- 构建产物仅输出到 `.next` 目录，未被纳入版本控制（已在 .gitignore 中排除）