export default function KnowledgeList() {
  return (
    <div className="h-full rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">内容 (1)</div>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-700 transition hover:bg-gray-100"
          aria-label="新增内容"
        >
          +
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 min-h-[72px]" />

      <div className="mt-4 text-sm text-gray-500">没有更多内容了</div>
    </div>
  );
}
