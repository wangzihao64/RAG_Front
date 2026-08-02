import { RagDemoChat } from './components/rag-demo-chat';
import { StartButton } from './components/start-button';
import { TypewriterKnowledgeButton } from './components/typewriter-knowledge-button';
import { SiteHeader } from './components/site-header';
import {
  ArrowRight,
  FileText,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  Upload,
} from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: '上传资料',
    description: 'PDF、Word、Markdown 等格式均可，构建你的专属知识库',
  },
  {
    icon: MessageCircle,
    title: '自然提问',
    description: '用日常语言提问，无需记住文件名或存储路径',
  },
  {
    icon: FileText,
    title: '获得答案',
    description: '从资料中检索并生成回答，每条答案都标注引用来源',
  },
];

const features = [
  {
    icon: Search,
    title: '精准检索',
    description: '基于语义理解，从海量文档中找到最相关的内容片段',
  },
  {
    icon: Shield,
    title: '引用可追溯',
    description: '每条回答都标注来源文档与章节，答案有据可查',
  },
  {
    icon: Sparkles,
    title: '越用越懂',
    description: '持续积累你的知识库，让 AI 助手真正读懂你的资料',
  },
];

const faqs = [
  {
    question: '支持哪些文件格式？',
    answer: '目前支持 PDF、Word（.docx）、Markdown、纯文本等常见格式，后续会持续扩展。',
  },
  {
    question: '我的数据安全吗？',
    answer: '你的文档仅用于构建个人知识库，不会被用于训练公共模型，数据隔离存储。',
  },
  {
    question: '和普通 ChatGPT 有什么区别？',
    answer: 'AMemoryI 基于你自己的资料回答，而非通用知识。它读过你上传的每一份文档，回答更精准、可引用。',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-8 sm:pt-24 sm:pb-12 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            基于 RAG 的智能知识库
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-5 leading-tight tracking-tight">
            你的知识，从此不再沉睡
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg mb-10">
            读过的文章、写下的笔记、沉淀的文档——只需提问，AMemoryI
            就能从你的专属资料库中精准找到答案，并标注引用来源。
          </p>
          <div id="login" className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              免费注册
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-full font-medium border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              登录
            </a>
          </div>
          <TypewriterKnowledgeButton />
        </section>

        {/* Use case */}
        <section id="use-case" className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-20 sm:pt-8 sm:pb-28">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              看看 AMemoryI 如何工作
            </h2>
            <p className="text-gray-500">
              上传你的资料，提问即可获得带引用的精准答案
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 mb-16">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group text-center p-6 rounded-2xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition-colors">
                  <step.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xs font-medium text-indigo-600 mb-1">
                  步骤 {index + 1}
                </p>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <RagDemoChat />
        </section>

        {/* Features */}
        <section className="bg-gray-50/80 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                为什么选择 AMemoryI
              </h2>
              <p className="text-gray-500">不只是搜索，而是真正理解你的知识</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="p-6 rounded-2xl bg-white border border-gray-100">
                  <feature.icon className="w-6 h-6 text-indigo-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">常见问题</h2>
            <p className="text-gray-500">还有其他疑问？欢迎联系我们</p>
          </div>
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="p-5 sm:p-6 rounded-2xl border border-gray-100 bg-white"
              >
                <dt className="font-semibold text-gray-900 mb-2">{faq.question}</dt>
                <dd className="text-sm text-gray-500 leading-relaxed">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-20 sm:pb-28">
          <div className="text-center rounded-3xl bg-gray-900 px-6 py-14 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              准备好唤醒你的知识库了吗？
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              免费注册，上传你的第一份文档，立即体验 RAG 智能问答
            </p>
            <StartButton />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© 2026 AMemoryI. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="mailto:w185892713@163.com" className="hover:text-gray-900 transition-colors">
              w185892713@163.com
            </a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">
              帮助中心
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
