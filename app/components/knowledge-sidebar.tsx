'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronUp, FolderOpen, Globe, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
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
  onDeleteCollection?: (id: number) => void;
  onCollapse?: () => void;
}

export default function KnowledgeSidebar({
  selectedCollectionId,
  onSelectCollection,
  onDeleteCollection,
  onCollapse,
}: KnowledgeSidebarProps) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listExpanded, setListExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CollectionItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [editTarget, setEditTarget] = useState<CollectionItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

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

  async function handleDeleteCollection() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch(`/api/collections/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '删除知识库失败');
      }

      if (deleteTarget.id === selectedCollectionId) {
        onDeleteCollection?.(deleteTarget.id);
      }

      setDeleteTarget(null);
      await loadCollections();
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除知识库失败';
      setDeleteError(message);
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

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

  function openEditModal(item: CollectionItem) {
    setEditTarget(item);
    setEditName(item.name);
    setEditDescription(item.description || '');
    setEditIsPublic(item.is_public);
    setEditError('');
  }

  async function handleEditCollection() {
    if (!editTarget || !editName.trim()) return;

    setEditSubmitting(true);
    setEditError('');

    try {
      const headers = new Headers({
        'Content-Type': 'application/json',
      });
      const authHeaders = buildAuthHeaders();
      authHeaders.forEach((value, key) => headers.set(key, value));

      const response = await fetch(`/api/collections/${editTarget.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
          is_public: editIsPublic,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '编辑知识库失败');
      }

      setEditTarget(null);
      await loadCollections();
    } catch (error) {
      const message = error instanceof Error ? error.message : '编辑知识库失败';
      setEditError(message);
      console.error(error);
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-gray-50/40">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <button
          type="button"
          onClick={() => setListExpanded((prev) => !prev)}
          className="flex items-center gap-2 text-left transition hover:opacity-70"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Library</p>
            <h2 className="text-sm font-semibold text-gray-900">个人知识库</h2>
          </div>
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
              listExpanded
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {listExpanded ? (
              <>
                <ChevronUp size={12} />
                收起
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                展开
              </>
            )}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
            aria-label="折叠面板"
            onClick={() => onCollapse?.()}
          >
            <ChevronLeft size={12} />
            折叠
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700"
            aria-label="新增知识库"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {listExpanded && (
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
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectCollection(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectCollection(item.id);
                    }
                  }}
                  className={`group w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left transition ${
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
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md text-gray-300 transition hover:bg-indigo-50 hover:text-indigo-500"
                        aria-label={`编辑${item.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditModal(item);
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                        aria-label={`删除${item.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteError('');
                          setDeleteTarget(item);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">删除知识库</h3>
                <p className="text-sm text-gray-500">此操作不可撤销，其中的文档也会被一并删除</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3.5 py-2.5 text-sm font-medium text-gray-800">
              {deleteTarget.name}
            </div>

            {deleteError ? (
              <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{deleteError}</div>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleting}
                onClick={handleDeleteCollection}
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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

      {editTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Edit</p>
                <h3 className="text-lg font-semibold text-gray-900">编辑知识库</h3>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                onClick={() => setEditTarget(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm text-gray-700">
                <span className="mb-1.5 block font-medium">知识库名称</span>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  placeholder="请输入知识库名称"
                />
              </label>

              <label className="block text-sm text-gray-700">
                <span className="mb-1.5 block font-medium">知识库描述</span>
                <textarea
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  placeholder="请输入知识库描述"
                  rows={3}
                />
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/50 px-3.5 py-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={editIsPublic}
                  onChange={(event) => setEditIsPublic(event.target.checked)}
                />
                是否公开
              </label>
            </div>

            {editError ? (
              <div className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{editError}</div>
            ) : null}

            <button
              type="button"
              onClick={handleEditCollection}
              disabled={editSubmitting || !editName.trim()}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editSubmitting ? '保存中...' : '保存修改'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
