'use client';

import { FormEvent, useState } from 'react';

export function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('confirm_password', confirmPassword);

      const response = await fetch('http://127.0.0.1:8080/api/v1/auth/register', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        setStatus('error');
        setMessage(text || '注册失败，请稍后重试。');
        return;
      }

      setStatus('success');
      setMessage('注册成功！');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus('error');
      setMessage('无法连接到服务器，请稍后再试。');
    }
  }

  return (
    <div className="rounded-[2rem] border border-gray-100 bg-slate-50/80 p-8 shadow-sm shadow-slate-200/30">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 mb-3">创建账号</p>
        <h2 className="text-3xl font-semibold text-gray-950">开始你的智能知识之旅</h2>
        <p className="mt-3 text-sm text-gray-500">填写下面信息，几秒钟即可完成注册。</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-gray-900">用户名</span>
          <input
            name="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="例如：yourusername"
            className="mt-3 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">电子邮箱</span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@youremail.com"
            className="mt-3 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">密码</span>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="mt-3 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-900">确认密码</span>
            <input
              name="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="再次输入密码"
              className="mt-3 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '提交中...' : '立即注册'}
        </button>
      </form>

      {message ? (
        <p className={`mt-5 text-sm ${status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {message}
        </p>
      ) : null}

      <p className="mt-6 text-sm text-gray-500">
        注册即代表你同意我们的
        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700">
          服务条款
        </a>
        和
        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700">
          隐私政策
        </a>
        。
      </p>
    </div>
  );
}
