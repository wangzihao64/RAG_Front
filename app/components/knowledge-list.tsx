'use client';

import { useEffect, useRef, useState } from 'react';
import { buildAuthHeaders } from '../lib/auth';

interface DocumentItem {
  id: number;
  collection_id?: number;
  name: string;
  file_type?: string;
  file_size?: number;
  status?: string;
  chunk_count?: number;
}

interface DocumentsResponse {
  code: number;
  msg: string;
  data: DocumentItem[];
  contexts: unknown;
}

interface UploadDocumentResponse {
  code: number;
  msg: string;
  data: DocumentItem;
  contexts: unknown;
}

interface KnowledgeListProps {
  collectionId: number | null;
}

export default function KnowledgeList({ collectionId }: KnowledgeListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!collectionId) {
      setDocuments([]);
      setSelectedDocumentId(null);
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

  function openUploadModal() {
    if (!collectionId) return;
    setSelectedFile(null);
    setUploadError('');
    setIsModalOpen(true);
  }

  function closeUploadModal() {
    setIsModalOpen(false);
    setSelectedFile(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadError('');
  }

  async function handleUploadDocument() {
    if (!collectionId || !selectedFile) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/collections/${collectionId}/documents`, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `上传文档失败(${response.status})`);
      }

      const result: UploadDocumentResponse = await response.json();
      const uploadedDocument = result.data;

      setDocuments((prev) => {
        const exists = prev.some((doc) => doc.id === uploadedDocument.id);
        if (exists) {
          return prev.map((doc) => (doc.id === uploadedDocument.id ? uploadedDocument : doc));
        }
        return [...prev, uploadedDocument];
      });
      setSelectedDocumentId(uploadedDocument.id);
      closeUploadModal();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '上传文档失败');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="h-full rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">
          内容 {collectionId ? `(${documents.length})` : ''}
        </div>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="新增内容"
          disabled={!collectionId}
          onClick={openUploadModal}
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
              {documents.map((doc) => {
                const isSelected = doc.id === selectedDocumentId;

                return (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedDocumentId(doc.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm shadow-sm transition ${
                        isSelected
                          ? 'border border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border border-transparent bg-white text-gray-900 hover:border-gray-200'
                      }`}
                    >
                      {doc.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          <div className="text-sm text-gray-500">请先从左侧选择一个知识库</div>
        )}
      </div>

      {collectionId && documents.length > 0 ? (
        <div className="mt-4 text-sm text-gray-500">如需查看文档内容，请在文档列表中选择具体文档。</div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">上传文档</h3>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={closeUploadModal}
              >
                关闭
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-gray-700">
                <span className="mb-1 block">选择文件</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:text-gray-700"
                  onChange={handleFileChange}
                />
              </label>

              {selectedFile ? (
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  已选择：{selectedFile.name}
                </div>
              ) : null}
            </div>

            {uploadError ? (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {uploadError}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleUploadDocument}
              disabled={uploading || !selectedFile}
              className="mt-4 w-full rounded-full bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {uploading ? '上传中...' : '上传文档'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
