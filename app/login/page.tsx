import type { Metadata } from 'next';
import { BookOpenText, Sparkles } from 'lucide-react';
import { SiteHeader } from '../components/site-header';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: '登录 - AMemoryI',
  description: '登录 AMemoryI，继续使用你的智能知识库。',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-16 items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 mb-6">
              <Sparkles className="w-4 h-4" />
              欢迎回到 AMemoryI
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-950 tracking-tight mb-6">
              登录后，继续和你的知识库对话
            </h1>
            <p className="text-lg leading-8 text-gray-600 mb-8">
              继续上传文档、提问问题、查看引用来源，让 AI 助手始终记住你的资料。
            </p>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50">
                  <BookOpenText className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">专属知识库</p>
                  <p className="text-sm text-gray-500">你的资料、你的答案、你的上下文</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-7">
                登录后即可继续浏览已上传文档、查看历史问答，并在每次提问时获得更精准的结果。
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-slate-50/80 p-8 shadow-sm shadow-slate-200/30">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 mb-3">
                登录账号
              </p>
              <h2 className="text-3xl font-semibold text-gray-950">欢迎回来</h2>
              <p className="mt-3 text-sm text-gray-500">
                输入用户名和密码，继续使用你的知识库助手。
              </p>
            </div>

            <LoginForm />

            <p className="mt-6 text-sm text-gray-500">
              还没有账号？
              <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
                立即注册
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
