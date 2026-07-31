'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen, FileText, Loader2, MessageSquare, Send, Sparkles } from 'lucide-react';
import { buildAuthHeaders } from '../lib/auth';

export interface SelectedDocument {
  id: number;
  name: string;
}

interface KnowledgeDetailProps {
  collectionId: number | null;
  selectedDocument: SelectedDocument | null;
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

export default function KnowledgeDetail({ collectionId, selectedDocument }: KnowledgeDetailProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [contentError, setContentError] = useState('');
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState('');

  useEffect(() => {
    setChatMessages([]);
    setChatError('');
  }, [collectionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
          <div className="shrink-0 border-b border-gray-100 bg-slate-50/60 px-5 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Preview</p>
            <div className="max-h-36 overflow-auto rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  加载文档内容中...
                </div>
              ) : contentError ? (
                <div className="text-sm text-red-600">{contentError}</div>
              ) : content?.kind === 'text' ? (
                <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-gray-700">
                  {content.data}
                </pre>
              ) : content?.kind === 'image' ? (
                <img
                  src={content.data}
                  alt={selectedDocument.name}
                  className="max-h-28 max-w-full rounded-lg object-contain"
                />
              ) : content?.kind === 'pdf' ? (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText size={14} />
                  PDF 文档：{selectedDocument.name}
                </div>
              ) : content?.kind === 'unsupported' ? (
                <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>暂不支持在线预览</span>
                  <a
                    href={content.data}
                    download={selectedDocument.name}
                    className="rounded-lg bg-indigo-600 px-2.5 py-1 text-white transition hover:bg-indigo-700"
                  >
                    下载
                  </a>
                </div>
              ) : (
                <div className="text-sm text-gray-500">暂无文档内容</div>
              )}
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(to_bottom,#f8fafc_0%,#ffffff_120px)] px-5 py-4">
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
                    {message.role === 'assistant' && message.sources ? (
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
    </div>
  );
}
