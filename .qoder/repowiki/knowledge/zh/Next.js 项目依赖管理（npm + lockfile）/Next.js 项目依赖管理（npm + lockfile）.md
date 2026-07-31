---
kind: dependency_management
name: Next.js 项目依赖管理（npm + lockfile）
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - next.config.ts
    - postcss.config.mjs
    - eslint.config.mjs
---

本项目使用 npm 作为包管理器，通过 `package.json` 声明依赖，并通过 `package-lock.json` 锁定版本以确保构建可重现。

**使用的系统/工具**
- 包管理器：npm（由根目录的 `package-lock.json` 可知 lockfileVersion 为 3）
- 框架与运行时：Next.js 16.2.12、React 19.2.4、react-dom 19.2.4
- UI 与图标：Tailwind CSS v4（通过 `@tailwindcss/postcss` 插件集成）、lucide-react 图标库
- 类型与开发工具：TypeScript ^5、eslint ^9（基于 `eslint.config.mjs` 的新配置格式）、`eslint-config-next` 统一 Next.js 相关规则

**关键文件**
- `package.json`：声明运行时依赖与开发依赖，定义 dev/build/start/lint 脚本
- `package-lock.json`：npm 生成的锁文件，固定所有传递依赖的确切版本与 integrity hash
- `next.config.ts`：Next.js 构建配置（当前为空对象，未自定义依赖行为）
- `postcss.config.mjs`：PostCSS 配置，仅启用 `@tailwindcss/postcss` 插件
- `eslint.config.mjs`：ESLint 新式配置，继承 `eslint-config-next` 的 core-web-vitals 与 typescript 规则集

**架构与约定**
- 依赖分层清晰：`dependencies` 仅包含运行时必需包（next、react、react-dom、lucide-react），其余如 Tailwind、TypeScript、ESLint 等全部放入 `devDependencies`
- 版本策略：核心依赖（next、react、react-dom）使用精确版本号，生态工具（typescript、eslint、tailwindcss）使用 `^` 主版本范围，兼顾稳定性与升级空间
- 无私有仓库或代理配置：未发现 `.npmrc`、`.yarnrc` 或 `package.json` 中的 `registry`/`unsafe-perm` 等字段，默认使用 npm 官方源
- 无 vendoring：未使用 `node_modules` 提交策略，依赖通过 npm 安装生成
- 构建产物隔离：`.next` 目录被忽略（见 `.gitignore`），确保每次构建从干净状态开始

**约束与规范**
- 项目标记为 `"private": true`，禁止发布到 npm 公共仓库
- ESLint 规则通过 `eslint-config-next` 统一管理，避免个人规则分歧
- PostCSS 仅配置 Tailwind 插件，未引入额外处理器，保持样式管线简洁