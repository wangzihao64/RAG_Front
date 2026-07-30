export default function KnowledgeSidebar() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-gray-900">个人知识库</div>
        <div className="mt-2 rounded-lg border border-gray-100 bg-white p-3 text-gray-700">Www的知识库</div>
      </div>

      <div>
        <div className="text-sm font-semibold text-gray-900">共享知识库</div>
        <div className="mt-2 rounded-lg border border-gray-100 bg-white p-3 text-gray-700">个人信息</div>
      </div>

      <div>
        <div className="text-sm font-semibold text-gray-900">订阅</div>
        <div className="mt-2 rounded-lg border border-gray-100 bg-white p-3 text-gray-700">去发现更多知识库</div>
      </div>
    </div>
  );
}
