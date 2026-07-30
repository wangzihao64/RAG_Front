'use client';

import { useEffect, useState } from 'react';
import { buildAuthHeaders } from '../lib/auth';

interface DocumentItem {
  id: number;
  title?: string;
  name?: string;
  filename?: string;
  description?: string;
}

interface DocumentsResponse {
  code: number;
  msg: string;
  data: DocumentItem[];
  contexts: unknown;
}

interface KnowledgeListProps {
  collectionId: number | null;
}

export default function KnowledgeList({ collectionId }: KnowledgeListProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!collectionId) {
      return;
    }

    const loadDocuments = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/collections/${collectionId}/documents`, {
          method: 'GET',
          headers: buildAuthHeaders(),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `获取文档失败(${response.status})`);
        }

        const result: DocumentsResponse = await response.json();
        setDocuments(result.data || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : '获取文档失败');
      } finally {
        setLoading(false);
      }
    };

    void loadDocuments();
  }, [collectionId]);

  return (
    <div className="h-full rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">
          内容 {collectionId ? `(${documents.length})` : ''}
        </div>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-700 transition hover:bg-gray-100"
          aria-label="新增内容"
        >
          +
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 min-h-[72px]">
        {collectionId ? (
          loading ? (
            <div className="text-sm text-gray-500">加载文档中...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : documents.length === 0 ? (
            <div className="text-sm text-gray-500">当前知识库暂无文档</div>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.id} className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  {doc.title || doc.name || doc.filename || `文档 ${doc.id}`}
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="text-sm text-gray-500">请先从左侧选择一个知识库</div>
        )}
      </div>

      {collectionId && documents.length > 0 ? (
        <div className="mt-4 text-sm text-gray-500">如需查看文档内容，请在文档列表中选择具体文档。</div>
      ) : null}
    </div>
  );
}
