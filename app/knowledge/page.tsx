import { SiteHeader } from '../components/site-header';
import KnowledgeSidebar from '../components/knowledge-sidebar';
import KnowledgeList from '../components/knowledge-list';
import KnowledgeDetail from '../components/knowledge-detail';

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">知识库</h1>
          <p className="text-gray-500">浏览并基于知识库进行提问</p>
        </div>

        <div className="flex gap-6 items-start">
          <div className="w-60">
            <KnowledgeSidebar />
          </div>

          <div className="w-[420px]">
            <KnowledgeList />
          </div>

          <div className="flex-1">
            <KnowledgeDetail />
          </div>
        </div>
      </main>
    </div>
  );
}
