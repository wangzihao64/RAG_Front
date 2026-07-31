'use client';

import { useEffect, useState } from 'react';
import { buildAuthHeaders } from '../lib/auth';

export interface SelectedDocument {
  id: number;
  name: string;
}

interface KnowledgeDetailProps {
  selectedDocument: SelectedDocument | null;
}

type DocumentContent =
  | { kind: 'text'; data: string }
  | { kind: 'image'; data: string }
  | { kind: 'pdf'; data: string }
  | { kind: 'unsupported'; data: string; contentType: string };

function isTextContentType(contentType: string) {
  return (
    contentType.startsWith('text/') ||
    contentType.includes('json') ||
    contentType.includes('xml') ||
    contentType.includes('javascript')
  );
}

export default function KnowledgeDetail({ selectedDocument }: KnowledgeDetailProps) {
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [contentError, setContentError] = useState('');

  useEffect(() => {
    if (!selectedDocument) {
      setContent(null);
      setContentError('');
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    const loadContent = async () => {
      setLoading(true);
      setContentError('');
      setContent(null);

      try {
        const response = await fetch(`/api/documents/${selectedDocument.id}/content`, {
          method: 'GET',
          headers: buildAuthHeaders(),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `获取文档内容失败(${response.status})`);
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        if (isTextContentType(contentType)) {
          const text = await response.text();
          if (!cancelled) {
            setContent({ kind: 'text', data: text });
          }
          return;
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (cancelled) {
          return;
        }

        if (contentType.startsWith('image/')) {
          setContent({ kind: 'image', data: objectUrl });
          return;
        }

        if (contentType === 'application/pdf') {
          setContent({ kind: 'pdf', data: objectUrl });
          return;
        }

        setContent({ kind: 'unsupported', data: objectUrl, contentType });
      } catch (error) {
        if (!cancelled) {
          setContentError(error instanceof Error ? error.message : '获取文档内容失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedDocument]);

  function send() {
    if (!value.trim()) return;
    setMessages((m) => [...m, value.trim()]);
    setValue('');
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div className="text-sm font-semibold text-gray-900">
          {selectedDocument ? selectedDocument.name : '基于知识库提问'}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        {selectedDocument ? (
          <div className="h-full overflow-auto p-4">
            {loading ? (
              <div className="text-sm text-gray-500">加载文档内容中...</div>
            ) : contentError ? (
              <div className="text-sm text-red-600">{contentError}</div>
            ) : content?.kind === 'text' ? (
              <pre className="whitespace-pre-wrap break-words text-sm text-gray-900">{content.data}</pre>
            ) : content?.kind === 'image' ? (
              <img src={content.data} alt={selectedDocument.name} className="max-h-full max-w-full object-contain" />
            ) : content?.kind === 'pdf' ? (
              <iframe
                src={content.data}
                title={selectedDocument.name}
                className="h-full min-h-[320px] w-full rounded-md bg-white"
              />
            ) : content?.kind === 'unsupported' ? (
              <div className="text-sm text-gray-600">
                <p className="mb-3">当前文件类型暂不支持在线预览（{content.contentType}）。</p>
                <a
                  href={content.data}
                  download={selectedDocument.name}
                  className="inline-flex rounded-full bg-gray-900 px-4 py-2 text-sm text-white transition hover:bg-gray-800"
                >
                  下载文档
                </a>
              </div>
            ) : (
              <div className="text-sm text-gray-500">暂无文档内容</div>
            )}
          </div>
        ) : (
          <div className="h-full p-4">
            {messages.length === 0 ? (
              <div className="text-gray-500">请先在中间列表选择文档，或输入问题开始检索知识库内容</div>
            ) : (
              <div className="flex flex-col gap-2">
                {messages.map((m, i) => (
                  <div key={i} className="rounded-md bg-white p-2 text-gray-900 shadow-sm">
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm outline-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="基于知识库提问"
        />
        <button className="rounded-full bg-gray-900 px-4 py-3 text-sm text-white" onClick={send}>
          发送
        </button>
      </div>
    </div>
  );
}
