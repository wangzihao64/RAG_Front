import type { Metadata } from 'next';
import { Shield, Sparkles, Rocket, CheckCircle } from 'lucide-react';
import { SiteHeader } from '../components/site-header';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: '注册 - AMemoryI',
  description: '创建 AMemoryI 账号，开启你的智能知识库。',
};

const benefits = [
  {
    icon: Rocket,
    title: '快速启动',
    description: '三步完成注册，立即上传文档并开始提问。',
  },
  {
    icon: Shield,
    title: '安全可靠',
    description: '数据隔离存储，确保你的知识库隐私安全。',
  },
  {
    icon: CheckCircle,
    title: '智能检索',
    description: '构建后即可使用 RAG 问答，答案带引用来源。',
  },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 mb-6">
              <Sparkles className="w-4 h-4" />
              只需一步，立即构建你的知识库
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-950 tracking-tight mb-6">
              注册 AMemoryI，开启专属知识库助手
            </h1>
            <p className="text-lg leading-8 text-gray-600 mb-10">
              输入基本信息即可创建账号。完成后可直接上传文档、提问搜索，并获得带来源的精准回答。
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <benefit.icon className="mb-4 h-6 w-6 text-indigo-600" />
                  <h2 className="text-base font-semibold text-gray-900 mb-2">{benefit.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
