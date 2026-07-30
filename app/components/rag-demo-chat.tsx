'use client';

import { FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const USER_QUESTION = '我们的退款政策是什么？7 天内可以退吗？';
const AI_INTRO = '根据您上传的《产品手册》，退款政策如下：';
const AI_BODY =
  '购买后 7 天内，未使用的产品可申请全额退款。需提供订单号，审核通过后 3–5 个工作日原路退回。';

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function typeText(
  text: string,
  onUpdate: (value: string) => void,
  speed: number,
  signal: { cancelled: boolean },
) {
  return new Promise<void>((resolve) => {
    let index = 0;
    const timer = setInterval(() => {
      if (signal.cancelled) {
        clearInterval(timer);
        resolve();
        return;
      }
      index += 1;
      onUpdate(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

function TypingCursor({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle animate-pulse" />
  );
}

export function RagDemoChat() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userText, setUserText] = useState('');
  const [aiIntro, setAiIntro] = useState('');
  const [aiBody, setAiBody] = useState('');
  const [showAiBubble, setShowAiBubble] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setUserText('');
      setAiIntro('');
      setAiBody('');
      setShowAiBubble(false);
      setShowCitation(false);
      setUserTyping(false);
      setAiTyping(false);
      return;
    }

    const signal = { cancelled: false };

    const runAnimation = async () => {
      while (!signal.cancelled) {
        setUserText('');
        setAiIntro('');
        setAiBody('');
        setShowAiBubble(false);
        setShowCitation(false);

        setUserTyping(true);
        await typeText(USER_QUESTION, setUserText, 45, signal);
        if (signal.cancelled) return;
        setUserTyping(false);

        await delay(500);
        if (signal.cancelled) return;

        setShowAiBubble(true);
        setAiTyping(true);
        await typeText(AI_INTRO, setAiIntro, 35, signal);
        if (signal.cancelled) return;
        await delay(200);
        await typeText(AI_BODY, setAiBody, 28, signal);
        if (signal.cancelled) return;
        setAiTyping(false);

        await delay(300);
        if (signal.cancelled) return;
        setShowCitation(true);

        await delay(4000);
      }
    };

    runAnimation();
    return () => {
      signal.cancelled = true;
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className="max-w-2xl mx-auto rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
    >
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <span className="text-sm text-gray-500">示例：产品文档知识库</span>
      </div>
      <div className="p-6 space-y-4 min-h-[220px]">
        {(userText || userTyping) && (
          <div className="flex justify-end">
            <div className="bg-gray-900 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%] text-sm">
              {userText}
              <TypingCursor visible={userTyping} />
            </div>
          </div>
        )}

        {showAiBubble && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%] text-sm">
              <p className="mb-2">
                {aiIntro}
                <TypingCursor visible={aiTyping && aiIntro.length < AI_INTRO.length} />
              </p>
              {(aiBody || (aiTyping && aiIntro.length === AI_INTRO.length)) && (
                <p className="text-gray-700 mb-3">
                  {aiBody}
                  <TypingCursor visible={aiTyping && aiIntro.length === AI_INTRO.length} />
                </p>
              )}
              <span
                className={`inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600 transition-opacity duration-500 ${
                  showCitation ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <FileText className="w-3 h-3" />
                产品手册.pdf · 第 3 章
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
