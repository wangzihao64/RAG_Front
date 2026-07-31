---
kind: logging_system
name: 日志系统：无专用日志框架，仅使用 console.error 进行错误输出
category: logging_system
scope:
    - '**'
source_files:
    - app/components/knowledge-sidebar.tsx
---

该 Next.js 前端应用未实现专门的日志系统。代码中未发现任何日志框架（如 winston、pino、bunyan、debug 等）的引入或配置，也没有自定义 logger 模块或日志配置文件。

仓库中的日志相关实践仅限于在 `app/components/knowledge-sidebar.tsx` 中使用原生 `console.error(error)` 输出错误信息，用于捕获 API 调用失败时的异常。这些调用分散在组件的错误处理分支中，没有统一的日志级别管理、结构化字段定义或日志输出目标配置。

由于这是一个纯前端着陆页项目（Next.js App Router），主要功能是展示和交互，后端 API 调用较少，因此未引入完整的日志体系。所有调试和错误输出均依赖浏览器控制台的原生 `console` 对象。