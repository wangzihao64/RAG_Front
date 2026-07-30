export default function KnowledgeSidebar() {
  return (
    <div className="h-full rounded-xl border border-gray-100 bg-gray-50/70 p-4">
      <div className="flex items-center justify-between pt-1">
        <div className="text-sm font-semibold text-gray-900">个人知识库</div>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-700 transition hover:bg-gray-100"
          aria-label="新增知识库"
        >
          +
        </button>
      </div>
    </div>
  );
}
