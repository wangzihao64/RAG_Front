import { BookOpenText } from 'lucide-react';

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
          <a href="/" className="text-gray-700 hover:text-gray-500 transition-colors">
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
        <div className='text-center flex items-center justify-center gap-4'>
        <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">注册</button>
        <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">登录</button>
        </div>
      </div>
    </div>
  );
}