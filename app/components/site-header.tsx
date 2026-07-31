'use client';

import { BookOpenText, ChevronDown, Library, LogOut, Menu, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthToken, isTokenValid } from '../lib/auth';

const navLinks = [
  { href: '#use-case', label: '功能' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: '联系我们' },
];

export function SiteHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const valid = isTokenValid();
    setIsAuthenticated(valid);
    if (valid) {
      try {
        const token = localStorage.getItem('amemoryi_token');
        if (token) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(
              atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
            );
            if (typeof payload.sub === 'string') setUsername(payload.sub);
            else if (typeof payload.username === 'string') setUsername(payload.username);
          }
        }
      } catch {
        // 解析失败保持匿名
      }
    } else {
      setUsername('');
    }
  }, []);

  function handleKnowledgeClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (isTokenValid()) {
      router.push('/knowledge');
    } else {
      setIsAuthenticated(false);
      router.push('/login');
    }
  }

  function handleLogout() {
    clearAuthToken();
    setIsAuthenticated(false);
    setUsername('');
    setUserMenuOpen(false);
    router.push('/');
  }

  const initial = username ? username.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-7xl mx-auto">
        <a href="/" className="flex items-center gap-2.5">
          <BookOpenText className="text-indigo-600" size={28} />
          <span className="text-xl font-bold text-gray-900">AMemoryI</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#"
            onClick={handleKnowledgeClick}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <Library size={14} />
            知识库
          </a>

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-gray-200 py-1.5 pl-1.5 pr-3 text-sm text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-600">
                  {initial}
                </span>
                <span className="max-w-[120px] truncate">{username || '用户'}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {userMenuOpen ? (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="truncate text-xs text-gray-500">已登录为</p>
                    <p className="truncate text-sm font-medium text-gray-900">{username || '用户'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <LogOut size={14} />
                    登出
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <a
                href="/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                登录
              </a>
              <a
                href="/register"
                className="text-sm font-medium bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                免费注册
              </a>
            </>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden p-2 text-gray-700"
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-gray-100 px-4 py-4 space-y-1 bg-white">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2.5 text-gray-700 hover:text-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#"
            className="flex items-center gap-2 py-2.5 text-gray-700 hover:text-indigo-600"
            onClick={(event) => {
              setMenuOpen(false);
              handleKnowledgeClick(event);
            }}
          >
            <Library size={14} />
            知识库
          </a>
          {isAuthenticated ? (
            <div className="pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                  {initial}
                </span>
                <span className="max-w-[140px] truncate">{username || '用户'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <LogOut size={14} />
                登出
              </button>
            </div>
          ) : (
            <div className="pt-3 flex gap-3">
              <a
                href="/login"
                className="flex-1 text-center py-2.5 text-sm font-medium border border-gray-200 rounded-full text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                登录
              </a>
              <a
                href="/register"
                className="flex-1 text-center py-2.5 text-sm font-medium bg-gray-900 text-white rounded-full"
                onClick={() => setMenuOpen(false)}
              >
                免费注册
              </a>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
