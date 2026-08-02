'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isTokenValid } from '../lib/auth';

export function StartButton() {
  const router = useRouter();

  function handleClick() {
    if (isTokenValid()) {
      router.push('/knowledge');
    } else {
      router.push('/login');
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
    >
      立即开始
      <ArrowRight className="w-4 h-4" />
    </button>
  );
}
