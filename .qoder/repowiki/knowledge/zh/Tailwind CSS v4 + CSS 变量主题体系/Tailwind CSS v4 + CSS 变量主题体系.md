---
kind: frontend_style
name: Tailwind CSS v4 + CSS 变量主题体系
category: frontend_style
scope:
    - '**'
source_files:
    - app/globals.css
    - postcss.config.mjs
    - app/layout.tsx
    - app/page.tsx
    - app/knowledge/page.module.css
    - package.json
---

本项目的样式系统基于 Next.js App Router 与 Tailwind CSS v4，采用原子化 CSS 为主、CSS Modules 为辅的混合策略。

**样式框架与工具链**
- 使用 `tailwindcss@^4` 与 `@tailwindcss/postcss@^4`，通过 PostCSS 插件方式集成，未使用传统的 `tailwind.config.js` 配置文件。
- 全局样式入口为 `app/globals.css`，通过 `@import "tailwindcss"` 引入 Tailwind，并定义 CSS 自定义属性作为设计令牌。
- 字体通过 `next/font/google` 加载 Geist Sans 与 Geist Mono，以 CSS 变量 `--font-geist-sans` / `--font-geist-mono` 暴露给 Tailwind 的 `@theme inline` 块。

**设计令牌与主题配置**
- 在 `globals.css` 中通过 `:root` 定义基础色值：`--background: #ffffff`、`--foreground: #171717`。
- 使用 `@theme inline` 将颜色与字体映射到 Tailwind 命名空间（`--color-background`、`--color-foreground`、`--font-sans`、`--font-mono`），实现 Tailwind 与设计令牌的桥接。
- 提供 `prefers-color-scheme: dark` 媒体查询覆盖，但当前暗色模式仍复用亮色变量。

**样式组织策略**
- 页面级布局与通用样式集中在 `app/globals.css` 与 `app/layout.tsx`（设置 `antialiased`、`scroll-smooth`、`font-sans` 等全局类）。
- 组件内样式优先使用 Tailwind 原子类（如 `page.tsx` 中大量使用 `bg-white`、`text-gray-900`、`rounded-full`、`grid sm:grid-cols-3` 等），无需额外样式文件。
- 复杂页面模块（如 `app/knowledge/page.module.css`）使用 CSS Modules 管理局部样式，采用深色主题（`#0f1720`/`#0b1220` 背景、`#e6eef8` 前景），包含侧边栏、列表、详情面板等布局。

**图标与视觉资源**
- 图标统一使用 `lucide-react`（v1.28.0），通过 SVG 组件直接嵌入 JSX，避免额外字体图标依赖。
- 静态资源存放于 `public/` 目录（favicon、Next/Vercel 占位图等）。

**响应式策略**
- 全面采用 Tailwind 断点前缀（`sm:`、`lg:`）实现移动端优先的响应式布局，如 `px-4 sm:px-8`、`text-3xl sm:text-5xl lg:text-6xl`。
- 布局广泛使用 Flexbox 与 Grid（`flex flex-col`、`grid sm:grid-cols-3`、`gap-*` 间距控制）。