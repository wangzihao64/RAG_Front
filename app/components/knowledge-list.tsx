'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
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

interface SelectedDocument {
  id: number;
  name: string;
}

interface KnowledgeListProps {
  collectionId: number | null;
  selectedDocumentId: number | null;
  onSelectDocument: (document: SelectedDocument | null) => void;
  onDeleteDocument?: (id: number) => void;
}

function formatFileSize(size?: number) {
  if (!size) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(status?: string) {
  if (!status) return null;
  if (status === 'pending') return '处理中';
  if (status === 'ready' || status === 'completed') return '就绪';
  if (status === 'failed') return '失败';
  return status;
}

export default function KnowledgeList({
  collectionId,
  selectedDocumentId,
  onSelectDocument,
  onDeleteDocument,
}: KnowledgeListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!collectionId) {
      setDocuments([]);
      onSelectDocument(null);
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
  }, [collectionId, onSelectDocument]);

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
      onSelectDocument({ id: uploadedDocument.id, name: uploadedDocument.name });
      closeUploadModal();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '上传文档失败');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteDocument() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch(`/api/documents/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '删除文档失败');
      }

      if (deleteTarget.id === selectedDocumentId) {
        onSelectDocument(null);
        onDeleteDocument?.(deleteTarget.id);
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除文档失败';
      setDeleteError(message);
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-full flex-col border-x border-gray-100 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Documents</p>
          <h2 className="text-sm font-semibold text-gray-900">
            文档内容
            {collectionId ? (
              <span className="ml-1.5 text-xs font-normal text-gray-400">{documents.length}</span>
            ) : null}
          </h2>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="新增内容"
          disabled={!collectionId}
          onClick={openUploadModal}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!collectionId ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-10 text-center">
            <FileText size={28} className="mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">请先从左侧选择一个知识库</p>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 px-2 py-6 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            加载文档中...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-10 text-center">
            <Upload size={28} className="mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">当前知识库暂无文档</p>
            <button
              type="button"
              onClick={openUploadModal}
              className="mt-3 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
            >
              上传第一个文档
            </button>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {documents.map((doc) => {
              const isSelected = doc.id === selectedDocumentId;
              const sizeLabel = formatFileSize(doc.file_size);
              const status = statusLabel(doc.status);

              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => onSelectDocument({ id: doc.id, name: doc.name })}
                    className={`group w-full rounded-xl border px-3 py-2.5 text-left transition ${
                      isSelected
                        ? 'border-indigo-200 bg-indigo-50 shadow-sm shadow-indigo-100/50'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-sm font-medium ${
                            isSelected ? 'text-indigo-900' : 'text-gray-800'
                          }`}
                        >
                          {doc.name}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          {doc.file_type ? (
                            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500">
                              {doc.file_type}
                            </span>
                          ) : null}
                          {sizeLabel ? <span className="text-[11px] text-gray-400">{sizeLabel}</span> : null}
                          {status ? (
                            <span
                              className={`text-[11px] ${
                                doc.status === 'failed' ? 'text-red-500' : 'text-gray-400'
                              }`}
                            >
                              {status}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        aria-label={`删除${doc.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteError('');
                          setDeleteTarget(doc);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">删除文档</h3>
                <p className="text-sm text-gray-500">删除后无法恢复，确定要删除吗？</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/60 px-3.5 py-2.5 text-sm font-medium text-gray-800">
              <FileText size={16} className="shrink-0 text-gray-400" />
              <span className="truncate">{deleteTarget.name}</span>
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
                onClick={handleDeleteDocument}
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
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Upload</p>
                <h3 className="text-lg font-semibold text-gray-900">上传文档</h3>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                onClick={closeUploadModal}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">选择文件</span>
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center transition hover:border-indigo-200 hover:bg-indigo-50/30">
                  <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="mx-auto block max-w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
                    onChange={handleFileChange}
                  />
                </div>
              </label>

              {selectedFile ? (
                <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-2.5 text-sm text-indigo-900">
                  <FileText size={16} className="shrink-0 text-indigo-500" />
                  <span className="truncate">{selectedFile.name}</span>
                </div>
              ) : null}
            </div>

            {uploadError ? (
              <div className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{uploadError}</div>
            ) : null}

            <button
              type="button"
              onClick={handleUploadDocument}
              disabled={uploading || !selectedFile}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? '上传中...' : '上传文档'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
