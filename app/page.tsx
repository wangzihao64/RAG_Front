import { BookOpenText, FileText, MessageCircle, Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* 图标和标题都加上 text-gray-900 */}
          <BookOpenText className="text-gray-900" />
          <h1 className="text-2xl font-bold text-gray-900">AMemoryI</h1>
        </div>
        <nav className="flex items-center gap-6">
          {/* 链接使用 text-gray-700，悬停变浅 */}
          <a href="#use-case" className="text-gray-700 hover:text-gray-500 transition-colors">
            功能
          </a>
          <a href="/" className="text-gray-700 hover:text-gray-500 transition-colors">
            FAQ
          </a>
          <a href="/" className="text-gray-700 hover:text-gray-500 transition-colors">
            联系我们
          </a>
          <a href="/" className="text-gray-700 hover:text-gray-500 transition-colors">
            登陆
          </a>
        </nav>
      </header>

      {/* main content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* title */}
        <div className='text-center mb-16'>
          <h2 className='text-5xl font-bold text-gray-900 mb-4'>AMemoryI —— 你的知识，从此不再沉睡</h2>
          <p className='text-gray-500 max-w-3xl mx-auto leading-relaxed'>
          你读过的每一篇文章、写下的每一段笔记、沉淀的每一份文档，都藏着值得被反复调用的价值。但信息越积越多，真正需要的时候，却总在文件夹和搜索记录里翻找。AMemoryI 是一个基于 RAG 的智能知识库 —— 你只需要提问，它就能从你的专属资料库中精准找到答案，就像为你配了一位真正读过所有资料的助手。不再重新发明轮子，让每一次思考都能站在过去积累的肩膀上。
          </p>
        </div>
        {/* 登陆注册按钮 */}
        <div className="text-center flex items-center justify-center gap-4">
          <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">注册</button>
          <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">登录</button>
        </div>

        {/* RAG 使用案例 */}
        <section id="use-case" className="mt-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              看看 AMemoryI 如何工作
            </h3>
            <p className="text-gray-500">
              上传你的资料，提问即可获得带引用的精准答案
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-gray-700" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">1. 上传资料</h4>
              <p className="text-sm text-gray-500">PDF、Word、Markdown 等格式均可，构建你的专属知识库</p>
            </div>
            <div className="text-center p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-gray-700" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">2. 自然提问</h4>
              <p className="text-sm text-gray-500">用日常语言提问，无需记住文件名或存储路径</p>
            </div>
            <div className="text-center p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-700" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3. 获得答案</h4>
              <p className="text-sm text-gray-500">从资料中检索并生成回答，每条答案都标注引用来源</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <span className="text-sm text-gray-500">示例：产品文档知识库</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-end">
                <div className="bg-gray-900 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%] text-sm">
                  我们的退款政策是什么？7 天内可以退吗？
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%] text-sm">
                  <p className="mb-2">根据您上传的《产品手册》，退款政策如下：</p>
                  <p className="text-gray-700 mb-3">
                    购买后 7 天内，未使用的产品可申请全额退款。需提供订单号，审核通过后 3–5 个工作日原路退回。
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                    <FileText className="w-3 h-3" />
                    产品手册.pdf · 第 3 章
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}