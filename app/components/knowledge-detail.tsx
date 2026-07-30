"use client";
import { useState } from 'react';

export default function KnowledgeDetail() {
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  function send() {
    if (!value.trim()) return;
    setMessages((m) => [...m, value.trim()]);
    setValue('');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100" />
          <div>
            <div className="font-semibold text-gray-900">ima</div>
            <div className="text-sm text-gray-500">没有找到相关的知识库内容</div>
          </div>
        </div>

      </div>

      <div className="flex-1 rounded-lg border border-gray-100 bg-white p-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-gray-500">基于知识库提问</div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m, i) => (
              <div key={i} className="rounded-md bg-gray-50 p-2 text-gray-900">{m}</div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm outline-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="基于知识库提问"
        />
        <button className="rounded-full bg-gray-900 text-white px-4 py-3 text-sm" onClick={send}>发送</button>
      </div>
    </div>
  );
}
