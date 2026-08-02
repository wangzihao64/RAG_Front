'use client';

import { useEffect, useState } from 'react';
import { Library } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isTokenValid } from '../lib/auth';

const FULL_TEXT = '进入知识库';

export function TypewriterKnowledgeButton() {
  const router = useRouter();
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [visible, setVisible] = useState(false);

  // 先延迟出现，再开始打字
  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(showTimer);
  }, []);

  // 打字效果
  useEffect(() => {
    if (!visible) return;

    if (displayedText.length < FULL_TEXT.length) {
      const typeTimer = setTimeout(() => {
        setDisplayedText(FULL_TEXT.slice(0, displayedText.length + 1));
      }, 120);
      return () => clearTimeout(typeTimer);
    }

    // 打字完成后，光标闪烁几次后消失
    const cursorTimer = setTimeout(() => setShowCursor(false), 1500);
    return () => clearTimeout(cursorTimer);
  }, [visible, displayedText]);

  // 光标闪烁
  const [cursorOn, setCursorOn] = useState(true);
  useEffect(() => {
    if (!showCursor) return;
    const blink = setInterval(() => setCursorOn((prev) => !prev), 530);
    return () => clearInterval(blink);
  }, [showCursor]);

  return (
    <div
      className={`mt-5 transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <button
        type="button"
        onClick={() => {
          if (isTokenValid()) {
            router.push('/knowledge');
          } else {
            router.push('/login');
          }
        }}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-7 py-2.5 text-sm font-medium text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
      >
        <Library size={15} />
        <span className="min-w-[5.5em]">
          {displayedText}
          {showCursor && (
            <span
              className={`ml-px inline-block h-4 w-px translate-y-0.5 bg-indigo-500 transition-opacity ${
                cursorOn ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </span>
      </button>
    </div>
  );
}
