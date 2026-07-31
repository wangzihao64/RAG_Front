'use client';

import { useEffect, useRef, useState } from 'react';
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
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div className="text-sm font-semibold text-gray-900">
          {selectedDocument ? selectedDocument.name : '基于知识库提问'}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        {selectedDocument ? (
          <div className="max-h-40 overflow-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
            {loading ? (
              <div className="text-sm text-gray-500">加载文档内容中...</div>
            ) : contentError ? (
              <div className="text-sm text-red-600">{contentError}</div>
            ) : content?.kind === 'text' ? (
              <pre className="whitespace-pre-wrap break-words text-xs text-gray-900">{content.data}</pre>
            ) : content?.kind === 'image' ? (
              <img src={content.data} alt={selectedDocument.name} className="max-h-32 max-w-full object-contain" />
            ) : content?.kind === 'pdf' ? (
              <div className="text-xs text-gray-500">已选择 PDF 文档：{selectedDocument.name}</div>
            ) : content?.kind === 'unsupported' ? (
              <div className="text-xs text-gray-500">已选择文档：{selectedDocument.name}</div>
            ) : (
              <div className="text-sm text-gray-500">暂无文档内容</div>
            )}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-gray-100 bg-gray-50 p-4">
          {!collectionId ? (
            <div className="text-sm text-gray-500">请先从左侧选择一个知识库</div>
          ) : chatMessages.length === 0 ? (
            <div className="text-sm text-gray-500">输入问题，开始基于知识库检索并生成回答</div>
          ) : (
            <div className="flex flex-col gap-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-gray-900 text-white'
                        : 'rounded-bl-md bg-white text-gray-900'
                    }`}
                  >
                    {message.role === 'assistant' && message.sources ? (
                      <div className="mb-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        <div className="mb-1 font-medium text-gray-700">
                          参考来源
                          {Array.isArray(message.sources) ? ` (${message.sources.length})` : ''}
                        </div>
                        {Array.isArray(message.sources) && message.sources.length > 0 ? (
                          <ul className="space-y-1">
                            {message.sources.slice(0, 3).map((source, index) => (
                              <li key={index} className="line-clamp-2">
                                {formatSourceLabel(source, index)}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                      {message.streaming ? <span className="ml-0.5 inline-block animate-pulse">▍</span> : null}
                    </div>

                    {message.error ? (
                      <div className="mt-2 text-xs text-red-600">{message.error}</div>
                    ) : null}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>

      {chatError ? (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{chatError}</div>
      ) : null}

      <div className="mt-4 flex gap-3">
        <input
          className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={collectionId ? '基于知识库提问' : '请先选择知识库'}
          disabled={!collectionId || sending}
        />
        <button
          className="rounded-full bg-gray-900 px-4 py-3 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={() => void send()}
          disabled={!collectionId || sending || !value.trim()}
        >
          {sending ? '生成中...' : '发送'}
        </button>
      </div>
    </div>
  );
}
