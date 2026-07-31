---
kind: error_handling
name: Next.js 前端错误处理模式
category: error_handling
scope:
    - '**'
source_files:
    - app/api/collections/[id]/documents/route.ts
    - app/api/documents/[id]/content/route.ts
    - app/api/collections/[id]/chat/route.ts
    - app/login/login-form.tsx
    - app/register/register-form.tsx
    - app/lib/auth.ts
---

该 Next.js 着陆页项目的错误处理采用分散式、轻量级的模式，没有统一的错误类型定义或全局错误中间件，主要依赖原生 JavaScript/TypeScript 的 try/catch 和 fetch 响应状态检查。

**API 路由层错误处理**
- 参数校验：在 `app/api/collections/[id]/documents/route.ts`、`app/api/documents/[id]/content/route.ts`、`app/api/collections/[id]/chat/route.ts` 中，通过 `if (!id)` 检查参数合法性，返回 `NextResponse.json({ code: 400, msg: '非法的 id' }, { status: 400 })`
- 上游服务转发：所有 API 路由使用 `fetch` 调用后端服务后，直接透传 `upstreamResponse.status` 和响应体文本，未对非 2xx 状态码做额外处理
- 流式响应：`chat/route.ts` 中设置 `text/event-stream`、`cache-control: no-cache`、`connection: keep-alive` 等头部以支持 SSE

**客户端表单错误处理**
- 登录表单 (`login-form.tsx`)：使用 `try/catch` 包裹 fetch 请求，通过 `response.ok` 判断成功与否，失败时设置 `status: 'error'` 和用户可读消息；网络异常捕获后显示"无法连接到服务器"
- 注册表单 (`register-form.tsx`)：同样的模式，使用本地状态管理 loading/error/success 三种状态
- 认证令牌：`lib/auth.ts` 提供 `saveAuthToken`、`getAuthToken`、`clearAuthToken` 三个函数操作 localStorage，无错误处理逻辑

**组件层错误处理**
- `rag-demo-chat.tsx` 是纯演示组件，不包含实际网络请求，因此无错误处理
- 页面组件 (`page.tsx`, `login/page.tsx`, `register/page.tsx`) 为展示型组件，无业务逻辑错误处理

**缺失的错误处理机制**
- 无全局错误边界 (Error Boundary)
- 无自定义错误类型或错误码枚举
- 无统一的用户提示组件（Toast/Alert）
- 无重试机制或指数退避
- 无日志记录或错误上报
- 无 middleware 进行集中式错误处理
- 未使用 `next/navigation` 的 `redirect` 或 `notFound` 进行路由级错误处理