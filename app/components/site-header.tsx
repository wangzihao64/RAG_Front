'use client';

import { BookOpenText, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '#use-case', label: '功能' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: '联系我们' },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            href="#login"
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
          <div className="pt-3 flex gap-3">
            <a
              href="#login"
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
        </nav>
      )}
    </header>
  );
}
