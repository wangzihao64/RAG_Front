'use client';

import { useEffect, useState } from 'react';
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
    <div className="h-full rounded-xl border border-gray-100 bg-gray-50/70 p-4">
      <div className="flex items-center justify-between pt-1">
        <div className="text-sm font-semibold text-gray-900">个人知识库</div>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-700 transition hover:bg-gray-100"
          aria-label="新增知识库"
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="text-sm text-gray-500">加载中...</div>
        ) : collections.length === 0 ? (
          <div className="text-sm text-gray-500">暂无知识库</div>
        ) : (
          collections.map((item) => {
            const isSelected = item.id === selectedCollectionId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCollection(item.id)}
                className={
                  `group w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`
                }
                title={item.description || '暂无描述'}
              >
                <div>{item.name}</div>
                <div className="mt-1 text-xs text-gray-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {item.description || '暂无描述'}
                </div>
              </button>
            );
          })
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">创建知识库</h3>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setIsModalOpen(false)}
              >
                关闭
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-gray-700">
                <span className="mb-1 block">知识库名称</span>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="请输入知识库名称"
                />
              </label>

              <label className="block text-sm text-gray-700">
                <span className="mb-1 block">知识库描述</span>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="请输入知识库描述"
                  rows={3}
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(event) => setIsPublic(event.target.checked)}
                />
                是否公开
              </label>
            </div>

            {createError ? (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {createError}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleCreateCollection}
              disabled={submitting || !name.trim()}
              className="mt-4 w-full rounded-full bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? '创建中...' : '创建知识库'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
