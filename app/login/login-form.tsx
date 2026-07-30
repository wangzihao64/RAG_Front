'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuthToken } from '../lib/auth';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://127.0.0.1:8080/api/v1/auth/login', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        setStatus('error');
        setMessage(text || '登录失败，请稍后重试。');
        return;
      }

      const result = await response.json();
      const token = result?.data?.token;

      if (!token) {
        setStatus('error');
        setMessage('登录成功，但未收到 token。');
        return;
      }

      saveAuthToken(token);
      setStatus('success');
      setMessage('登录成功，正在跳转...');
      router.push('/');
    } catch (error) {
      setStatus('error');
      setMessage('无法连接到服务器，请稍后再试。');
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-gray-900">用户名</span>
        <div className="mt-3 flex items-center gap-3 rounded-3xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 20a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          </svg>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="请输入用户名"
            className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-900">密码</span>
        <div className="mt-3 flex items-center gap-3 rounded-3xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V8a4 4 0 1 1 8 0v2" />
          </svg>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none"
          />
        </div>
      </label>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-gray-500">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          记住我
        </label>
        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700">
          忘记密码？
        </a>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading' ? '登录中...' : '登录'}
      </button>

      {message ? (
        <p className={`text-sm ${status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
