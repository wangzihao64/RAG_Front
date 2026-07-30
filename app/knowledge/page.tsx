'use client';

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { SiteHeader } from '../components/site-header';
import KnowledgeSidebar from '../components/knowledge-sidebar';
import KnowledgeList from '../components/knowledge-list';
import KnowledgeDetail from '../components/knowledge-detail';

const MIN_PANEL_WIDTH = 220;

type ResizeTarget = 'left' | 'right' | null;

export default function KnowledgePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [leftWidth, setLeftWidth] = useState(240);
  const [middleWidth, setMiddleWidth] = useState(420);
  const [resizeTarget, setResizeTarget] = useState<ResizeTarget>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartLeftWidth, setDragStartLeftWidth] = useState(240);
  const [dragStartMiddleWidth, setDragStartMiddleWidth] = useState(420);

  useEffect(() => {
    const updateWidth = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.getBoundingClientRect().width;
      setContainerWidth(width);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (!resizeTarget) return;

    const handleMouseMove = (event: MouseEvent) => {
      const deltaX = event.clientX - dragStartX;

      if (resizeTarget === 'left') {
        const nextLeft = Math.min(
          Math.max(dragStartLeftWidth + deltaX, MIN_PANEL_WIDTH),
          containerWidth - MIN_PANEL_WIDTH - MIN_PANEL_WIDTH,
        );
        const nextMiddle = Math.min(
          Math.max(dragStartMiddleWidth - deltaX, MIN_PANEL_WIDTH),
          containerWidth - nextLeft - MIN_PANEL_WIDTH,
        );
        setLeftWidth(nextLeft);
        setMiddleWidth(nextMiddle);
      }

      if (resizeTarget === 'right') {
        const nextMiddle = Math.min(
          Math.max(dragStartMiddleWidth + deltaX, MIN_PANEL_WIDTH),
          containerWidth - leftWidth - MIN_PANEL_WIDTH,
        );
        setMiddleWidth(nextMiddle);
      }
    };

    const handleMouseUp = () => setResizeTarget(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerWidth, dragStartLeftWidth, dragStartMiddleWidth, dragStartX, leftWidth, resizeTarget]);

  const startResize = (target: ResizeTarget, event: ReactMouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setResizeTarget(target);
    setDragStartX(event.clientX);
    setDragStartLeftWidth(leftWidth);
    setDragStartMiddleWidth(middleWidth);
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">知识库</h1>
          <p className="text-gray-500">浏览并基于知识库进行提问</p>
        </div>

        <div ref={containerRef} className="flex items-stretch gap-0 lg:gap-0">
          <div className="min-h-[420px] px-2" style={{ width: leftWidth }}>
            <KnowledgeSidebar
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={setSelectedCollectionId}
            />
          </div>

          <div
            className="mx-1 w-[2px] cursor-col-resize self-stretch rounded-full bg-gray-200 transition-colors hover:bg-gray-400"
            onMouseDown={(event) => startResize('left', event)}
          />

          <div className="min-h-[420px] px-2" style={{ width: middleWidth }}>
            <KnowledgeList collectionId={selectedCollectionId} />
          </div>

          <div
            className="mx-1 w-[2px] cursor-col-resize self-stretch rounded-full bg-gray-200 transition-colors hover:bg-gray-400"
            onMouseDown={(event) => startResize('right', event)}
          />

          <div className="min-h-[420px] flex-1 px-2">
            <KnowledgeDetail />
          </div>
        </div>
      </main>
    </div>
  );
}
