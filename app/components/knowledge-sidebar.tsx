'use client';

import { useEffect, useState } from 'react';
import { FolderOpen, Globe, Loader2, Plus, X } from 'lucide-react';
import { buildAuthHeaders } from '../lib/auth';

interface CollectionItem {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  is_public: boolean;
}

interface CollectionsResponse {
  code: number;
  msg: string;
  data: CollectionItem[];
  contexts: unknown;
}

interface KnowledgeSidebarProps {
  selectedCollectionId: number | null;
  onSelectCollection: (id: number) => void;
}

export default function KnowledgeSidebar({
  selectedCollectionId,
  onSelectCollection,
}: KnowledgeSidebarProps) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  async function loadCollections() {
    try {
      const response = await fetch('/api/collections', {
        method: 'GET',
        headers: buildAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('获取知识库失败');
      }

      const result: CollectionsResponse = await response.json();
      setCollections(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      try {
        await loadCollections();
      } catch (error) {
        if (isActive) {
          console.error(error);
        }
      }
    };

    void run();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleCreateCollection() {
    if (!name.trim()) return;

    setSubmitting(true);
    setCreateError('');

    try {
      const headers = new Headers({
        'Content-Type': 'application/json',
      });
      const authHeaders = buildAuthHeaders();
      authHeaders.forEach((value, key) => headers.set(key, value));

      const response = await fetch('/api/collections', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          is_public: isPublic,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '创建知识库失败');
      }

      setName('');
      setDescription('');
      setIsPublic(true);
      setIsModalOpen(false);
      await loadCollections();
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建知识库失败';
      setCreateError(message);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-gray-50/40">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Library</p>
          <h2 className="text-sm font-semibold text-gray-900">个人知识库</h2>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700"
          aria-label="新增知识库"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center gap-2 px-2 py-6 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            加载中...
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center">
            <FolderOpen size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">暂无知识库</p>
            <p className="mt-1 text-xs text-gray-400">点击右上角创建第一个知识库</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {collections.map((item) => {
              const isSelected = item.id === selectedCollectionId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectCollection(item.id)}
                  className={`group w-full rounded-xl border px-3 py-2.5 text-left transition ${
                    isSelected
                      ? 'border-indigo-200 bg-indigo-50 shadow-sm shadow-indigo-100/50'
                      : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                  title={item.description || '暂无描述'}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <FolderOpen size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate text-sm font-medium ${
                          isSelected ? 'text-indigo-900' : 'text-gray-800'
                        }`}
                      >
                        {item.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        {item.is_public ? (
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400">
                            <Globe size={10} />
                            公开
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">私有</span>
                        )}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                        {item.description || '暂无描述'}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">New</p>
                <h3 className="text-lg font-semibold text-gray-900">创建知识库</h3>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm text-gray-700">
                <span className="mb-1.5 block font-medium">知识库名称</span>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="请输入知识库名称"
                />
              </label>

              <label className="block text-sm text-gray-700">
                <span className="mb-1.5 block font-medium">知识库描述</span>
                <textarea
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="请输入知识库描述"
                  rows={3}
                />
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/50 px-3.5 py-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={isPublic}
                  onChange={(event) => setIsPublic(event.target.checked)}
                />
                是否公开
              </label>
            </div>

            {createError ? (
              <div className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{createError}</div>
            ) : null}

            <button
              type="button"
              onClick={handleCreateCollection}
              disabled={submitting || !name.trim()}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? '创建中...' : '创建知识库'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
