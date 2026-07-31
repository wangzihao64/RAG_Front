'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isTokenValid } from '../lib/auth';

/**
 * 已登录用户自动重定向到知识库页面。
 * 放在首页顶部，挂载后立即检测 token，有效则跳转。
 */
export function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (isTokenValid()) {
      router.replace('/knowledge');
    }
  }, [router]);

  return null;
}
