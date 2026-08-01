'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, FileText, Loader2, Maximize2, MessageSquare, Minimize2, Send, Sparkles, X } from 'lucide-react';
import { buildAuthHeaders } from '../lib/auth';

export interface SelectedDocument {
  id: number;
  name: string;
}

interface KnowledgeDetailProps {
  collectionId: number | null;
  selectedDocument: SelectedDocument | null;
  previewCollapsed?: boolean;
  onTogglePreview?: () => void;
}

type DocumentContent =
  | { kind: 'text'; data: string }
  | { kind: 'image'; data: string }
  | { kind: 'pdf'; data: string }
  | { kind: 'unsupported'; data: string; contentType: string };

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: unknown;
  streaming?: boolean;
  error?: string;
}

interface ParsedSSEEvent {
  event: string;
  data: string;
}

function isTextContentType(contentType: string) {
  return (
    contentType.startsWith('text/') ||
    contentType.includes('json') ||
    contentType.includes('xml') ||
    contentType.includes('javascript')
  );
}

function parseSSEEvents(text: string) {
  const events: ParsedSSEEvent[] = [];
  const parts = text.split('\n\n');
  const rest = parts.pop() ?? '';

  for (const part of parts) {
    if (!part.trim()) continue;

    let event = 'message';
    const dataLines: string[] = [];

    for (const line of part.split('\n')) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    events.push({ event, data: dataLines.join('\n') });
  }

  return { events, rest };
}

function decodeSSEData(data: string): unknown {
  if (!data) return '';
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function shouldShowSources(answer: string) {
  const normalized = answer
    .replace(/[\s，,。.:：]/g, '')
    .toLowerCase();

  if (!normalized) return false;

  const refusalMarkers = [
    '根据现有资料无法回答',
    '根据提供的资料无法回答',
    '资料中没有相关信息',
    '没有相关信息',
    '无法确定',
    '无法回答',
    '无法得知',
    'insufficientinformation',
    'cannotanswer',
    'unabletoanswer',
  ];

  return !refusalMarkers.some((marker) => normalized.includes(marker));
}

function formatSourceLabel(source: unknown, index: number) {
  if (typeof source === 'string') {
    return source;
  }

  if (source && typeof source === 'object') {
    const item = source as Record<string, unknown>;
    const name = item.document_name || item.name || item.title;
    const content = item.content || item.text || item.chunk;

    if (typeof name === 'string' && typeof content === 'string') {
      return `${name}: ${content}`;
    }

    if (typeof name === 'string') {
      return name;
    }

    if (typeof content === 'string') {
      return content;
    }
  }

  return `来源 ${index + 1}`;
}

export default function KnowledgeDetail({ collectionId, selectedDocument, previewCollapsed = false, onTogglePreview }: KnowledgeDetailProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [contentError, setContentError] = useState('');
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setChatMessages([]);
    setChatError('');
  }, [collectionId]);

  useEffect(() => {
    setPreviewExpanded(false);
    setModalOpen(false);
  }, [selectedDocument?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!modalOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalOpen]);

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

  function updateAssistantMessage(messageId: string, updater: (message: ChatMessage) => ChatMessage) {
    setChatMessages((prev) => prev.map((message) => (message.id === messageId ? updater(message) : message)));
  }

  async function send() {
    const query = value.trim();
    if (!query || !collectionId || sending) return;

    setValue('');
    setChatError('');

    const assistantMessageId = crypto.randomUUID();

    setChatMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: query },
      { id: assistantMessageId, role: 'assistant', content: '', streaming: true },
    ]);

    setSending(true);

    try {
      const formData = new FormData();
      formData.append('query', query);

      const response = await fetch(`/api/collections/${collectionId}/chat`, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `提问失败(${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取流式响应');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      const handleEvent = (event: ParsedSSEEvent) => {
        const payload = decodeSSEData(event.data);

        if (event.event === 'sources') {
          updateAssistantMessage(assistantMessageId, (message) => ({
            ...message,
            sources: payload,
          }));
          return;
        }

        if (event.event === 'message') {
          const delta = typeof payload === 'string' ? payload : String(payload ?? '');
          updateAssistantMessage(assistantMessageId, (message) => ({
            ...message,
            content: message.content + delta,
          }));
          return;
        }

        if (event.event === 'error') {
          const errorMessage = typeof payload === 'string' ? payload : '生成回答失败';
          updateAssistantMessage(assistantMessageId, (message) => ({
            ...message,
            error: errorMessage,
            streaming: false,
          }));
          return;
        }

        if (event.event === 'done') {
          updateAssistantMessage(assistantMessageId, (message) => ({
            ...message,
            streaming: false,
          }));
        }
      };

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;

        buffer += decoder.decode(chunk, { stream: true });
        const parsed = parseSSEEvents(buffer);
        buffer = parsed.rest;

        for (const event of parsed.events) {
          handleEvent(event);
        }
      }

      buffer += decoder.decode();
      if (buffer.trim()) {
        const parsed = parseSSEEvents(`${buffer}\n\n`);
        for (const event of parsed.events) {
          handleEvent(event);
        }
      }

      updateAssistantMessage(assistantMessageId, (message) => ({
        ...message,
        streaming: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '提问失败';
      setChatError(message);
      updateAssistantMessage(assistantMessageId, (current) => ({
        ...current,
        streaming: false,
        error: message,
        content: current.content || message,
      }));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }

  function renderPreview(mode: 'panel' | 'modal') {
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={14} className="animate-spin" />
          加载文档内容中...
        </div>
      );
    }
    if (contentError) {
      return <div className="text-sm text-red-600">{contentError}</div>;
    }
    if (content?.kind === 'text') {
      return (
        <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-gray-700">
          {content.data}
        </pre>
      );
    }
    if (content?.kind === 'image') {
      return (
        <img
          src={content.data}
          alt={selectedDocument?.name ?? ''}
          className="mx-auto max-h-full max-w-full rounded-lg object-contain"
        />
      );
    }
    if (content?.kind === 'pdf') {
      return (
        <iframe
          src={content.data}
          title={selectedDocument?.name ?? ''}
          className={`w-full rounded-lg ${mode === 'modal' ? 'h-full' : previewExpanded ? 'h-full' : 'h-64'}`}
        />
      );
    }
    if (content?.kind === 'unsupported') {
      return (
        <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
          <span>暂不支持在线预览</span>
          <a
            href={content.data}
            download={selectedDocument?.name ?? ''}
            className="rounded-lg bg-indigo-600 px-2.5 py-1 text-white transition hover:bg-indigo-700"
          >
            下载
          </a>
        </div>
      );
    }
    return <div className="text-sm text-gray-500">暂无文档内容</div>;
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Workspace</p>
        <div className="flex items-center gap-2">
          {selectedDocument ? (
            <FileText size={16} className="text-indigo-500" />
          ) : (
            <MessageSquare size={16} className="text-indigo-500" />
          )}
          <h2 className="truncate text-sm font-semibold text-gray-900">
            {selectedDocument ? selectedDocument.name : '基于知识库提问'}
          </h2>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {selectedDocument ? (
          <div
            className={`border-b border-gray-100 bg-slate-50/60 px-5 ${
              previewCollapsed ? 'py-2' : 'py-3'
            } ${previewExpanded && !previewCollapsed ? 'flex min-h-0 flex-1 flex-col' : 'shrink-0'}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Preview</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onTogglePreview?.()}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                    previewCollapsed
                      ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                  }`}
                  title={previewCollapsed ? '展开文档内容' : '折叠文档内容'}
                >
                  {previewCollapsed ? (
                    <>
                      <ChevronDown size={12} />
                      展开
                    </>
                  ) : (
                    <>
                      <ChevronUp size={12} />
                      折叠
                    </>
                  )}
                </button>
                {!previewCollapsed && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 transition hover:bg-white hover:text-indigo-600"
                      title="在新窗口中阅读"
                    >
                      <ExternalLink size={12} />
                      弹窗阅读
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewExpanded((prev) => !prev)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 transition hover:bg-white hover:text-indigo-600"
                    >
                      {previewExpanded ? (
                        <>
                          <Minimize2 size={12} />
                          收起
                        </>
                      ) : (
                        <>
                          <Maximize2 size={12} />
                          展开阅读
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
            {!previewCollapsed && (
              <div
                className={`mt-2 overflow-auto rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm ${
                  previewExpanded ? 'min-h-0 flex-1' : 'max-h-72'
                }`}
              >
                {renderPreview('panel')}
              </div>
            )}
          </div>
        ) : null}

        <div className={`min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(to_bottom,#f8fafc_0%,#ffffff_120px)] px-5 py-4 ${previewExpanded && selectedDocument && !previewCollapsed ? 'hidden' : ''}`}>
          {!collectionId ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <BookOpen size={24} className="text-indigo-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">请先选择一个知识库</p>
              <p className="mt-1 max-w-xs text-xs text-gray-400">从左侧选择知识库后，即可上传文档并开始智能问答</p>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Sparkles size={24} className="text-indigo-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">开始智能问答</p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-gray-400">
                输入你的问题，系统将检索知识库内容并流式生成回答，同时标注参考来源
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] ${
                      message.role === 'user'
                        ? 'rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm text-white shadow-sm shadow-indigo-200/50'
                        : 'rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm'
                    }`}
                  >
                    {message.role === 'assistant' &&
                    message.sources &&
                    shouldShowSources(message.content) ? (
                      <div className="mb-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-xs text-indigo-900/80">
                        <div className="mb-1 flex items-center gap-1 font-medium text-indigo-700">
                          <BookOpen size={11} />
                          参考来源
                          {Array.isArray(message.sources) ? ` · ${message.sources.length}` : ''}
                        </div>
                        {Array.isArray(message.sources) && message.sources.length > 0 ? (
                          <ul className="space-y-1">
                            {message.sources.slice(0, 3).map((source, index) => (
                              <li key={index} className="line-clamp-2 text-indigo-900/70">
                                {formatSourceLabel(source, index)}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                      {message.streaming ? (
                        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-indigo-400 align-middle" />
                      ) : null}
                    </div>

                    {message.error ? <div className="mt-2 text-xs text-red-500">{message.error}</div> : null}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>

      {chatError ? (
        <div className="mx-5 mb-2 rounded-xl bg-red-50 px-3.5 py-2 text-sm text-red-700">{chatError}</div>
      ) : null}

      <div className="border-t border-gray-100 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 p-1.5 shadow-inner focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
          <input
            className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={collectionId ? '输入问题，基于知识库检索回答...' : '请先选择知识库'}
            disabled={!collectionId || sending}
          />
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void send()}
            disabled={!collectionId || sending || !value.trim()}
            aria-label="发送"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      {modalOpen && selectedDocument ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex min-w-0 items-center gap-2">
                <FileText size={18} className="shrink-0 text-indigo-500" />
                <h3 className="truncate text-base font-semibold text-gray-900">{selectedDocument.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="关闭弹窗"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-slate-50/40 p-6">
              {renderPreview('modal')}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
