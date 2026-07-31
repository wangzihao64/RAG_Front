'use client';

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, FileText, GripVertical } from 'lucide-react';
import { SiteHeader } from '../components/site-header';
import KnowledgeSidebar from '../components/knowledge-sidebar';
import KnowledgeList from '../components/knowledge-list';
import KnowledgeDetail from '../components/knowledge-detail';

const MIN_PANEL_WIDTH = 220;
const SIDEBAR_EXPANDED_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 48;
const LIST_EXPANDED_WIDTH = 320;
const LIST_COLLAPSED_WIDTH = 48;

type ResizeTarget = 'left' | 'right' | null;

function ResizeHandle({
  onMouseDown,
}: {
  onMouseDown: (event: ReactMouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className="group relative flex w-3 shrink-0 cursor-col-resize items-center justify-center"
      onMouseDown={onMouseDown}
    >
      <div className="absolute inset-y-3 w-px bg-gray-200 transition-colors group-hover:bg-indigo-300" />
      <GripVertical
        size={14}
        className="relative z-10 text-gray-300 opacity-0 transition-opacity group-hover:text-indigo-400 group-hover:opacity-100"
      />
    </div>
  );
}

export default function KnowledgePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [leftWidth, setLeftWidth] = useState(SIDEBAR_EXPANDED_WIDTH);
  const [middleWidth, setMiddleWidth] = useState(LIST_EXPANDED_WIDTH);
  const [resizeTarget, setResizeTarget] = useState<ResizeTarget>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<{ id: number; name: string } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartLeftWidth, setDragStartLeftWidth] = useState(SIDEBAR_EXPANDED_WIDTH);
  const [dragStartMiddleWidth, setDragStartMiddleWidth] = useState(LIST_EXPANDED_WIDTH);

  useEffect(() => {
    setSelectedDocument(null);
  }, [selectedCollectionId]);

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
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <SiteHeader hideNavLinks />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 sm:px-8">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
              <BookOpen size={12} />
              知识工作台
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">知识库</h1>
            <p className="mt-1 text-sm text-gray-500">管理文档、预览内容，并基于知识库智能问答</p>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex min-h-[calc(100vh-180px)] overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
        >
          {sidebarCollapsed ? (
            <div
              className="flex h-full shrink-0 flex-col items-center gap-3 border-r border-gray-100 bg-gray-50/60 py-4"
              style={{ width: SIDEBAR_COLLAPSED_WIDTH }}
            >
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition hover:bg-indigo-200"
                title="展开知识库"
              >
                <ChevronRight size={16} />
              </button>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                <BookOpen size={14} className="text-indigo-500" />
              </div>
            </div>
          ) : (
            <>
              <div className="h-full shrink-0 overflow-hidden" style={{ width: leftWidth }}>
                <KnowledgeSidebar
                  selectedCollectionId={selectedCollectionId}
                  onSelectCollection={setSelectedCollectionId}
                  onDeleteCollection={() => {
                    setSelectedCollectionId(null);
                    setSelectedDocument(null);
                  }}
                  onCollapse={() => setSidebarCollapsed(true)}
                />
              </div>

              <ResizeHandle onMouseDown={(event) => startResize('left', event)} />
            </>
          )}

          {listCollapsed ? (
            <div
              className="flex h-full shrink-0 flex-col items-center gap-3 border-r border-gray-100 bg-gray-50/60 py-4"
              style={{ width: LIST_COLLAPSED_WIDTH }}
            >
              <button
                type="button"
                onClick={() => setListCollapsed(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition hover:bg-indigo-200"
                title="展开文档列表"
              >
                <ChevronRight size={16} />
              </button>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                <FileText size={14} className="text-indigo-500" />
              </div>
            </div>
          ) : (
            <>
              <div className="h-full shrink-0 overflow-hidden" style={{ width: middleWidth }}>
                <KnowledgeList
                  collectionId={selectedCollectionId}
                  selectedDocumentId={selectedDocument?.id ?? null}
                  onSelectDocument={setSelectedDocument}
                  onCollapse={() => setListCollapsed(true)}
                />
              </div>

              <ResizeHandle onMouseDown={(event) => startResize('right', event)} />
            </>
          )}

          <div className="h-full min-w-0 flex-1 overflow-hidden">
            <KnowledgeDetail
              collectionId={selectedCollectionId}
              selectedDocument={selectedDocument}
              previewCollapsed={previewCollapsed}
              onTogglePreview={() => setPreviewCollapsed((prev) => !prev)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
