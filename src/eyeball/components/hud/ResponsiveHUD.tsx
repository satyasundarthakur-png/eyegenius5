import { useState, type ReactNode } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

/**
 * HUDPanel — collapsible wrapper on mobile, transparent passthrough on desktop.
 */
export function HUDPanel({
  children,
  title,
  defaultOpen = true,
}: {
  children: ReactNode;
  title: string;
  defaultOpen?: boolean;
}) {
  const bp = useBreakpoint();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isMobile = bp === 'sm';

  if (!isMobile) return <>{children}</>;

  return (
    <div className="pointer-events-auto">
      <button
        onClick={() => { setIsOpen(!isOpen); }}
        className="flex w-full items-center justify-between rounded-t-lg border border-blue-500/30 bg-gray-950/90 px-3 py-2 text-xs font-semibold tracking-wider text-blue-400 uppercase backdrop-blur"
      >
        <span>{title}</span>
        <span className="text-blue-300/60">{isOpen ? '▾' : '▸'}</span>
      </button>
      {isOpen && (
        <div className="border-x border-b border-blue-500/30 bg-gray-950/90 backdrop-blur">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * HUDLayout — responsive 6-zone layout.
 *
 * Desktop / Tablet: CSS grid with rows [auto · 1fr · auto].
 *   - Top row    shrinks to content height.
 *   - Mid row    fills ALL remaining viewport height; each column is
 *                independently overflow-y-auto so panels never clip.
 *   - Bottom row shrinks to content height, pinned to viewport bottom.
 *
 * Mobile: stacked bottom drawer (unchanged).
 */
export function HUDLayout({
  topLeft,
  topRight,
  midLeft,
  midRight,
  bottomRight,
  bottomLeft,
}: {
  topLeft?: ReactNode;
  topRight?: ReactNode;
  midLeft?: ReactNode;
  midRight?: ReactNode;
  bottomRight?: ReactNode;
  bottomLeft?: ReactNode;
}) {
  const bp = useBreakpoint();
  const isMobile = bp === 'sm';

  if (isMobile) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 p-2">
        {midLeft}
        {midRight}
        {bottomLeft}
        {bottomRight}
      </div>
    );
  }

  /* Tablet + Desktop share the same grid structure; only padding differs */
  const pad = bp === 'md' ? 'p-3' : 'p-4';
  const colW = bp === 'md' ? 'max-w-[45%]' : 'w-64 shrink-0';

  return (
    <div
      className={`pointer-events-none absolute inset-0 grid grid-rows-[auto_1fr_auto] ${pad} gap-y-2`}
    >
      {/* ── Row 1: top ── */}
      <div className="flex items-start justify-between gap-4">
        {topLeft  && <div className={`pointer-events-auto ${colW}`}>{topLeft}</div>}
        {topRight && <div className={`pointer-events-auto ${colW}`}>{topRight}</div>}
      </div>

      {/* ── Row 2: mid — fills remaining height, hidden-scrollbar columns ── */}
      <div className="flex min-h-0 items-start justify-between gap-4">
        {midLeft && (
          <div
            className={`pointer-events-auto ${colW} space-y-2 overflow-y-auto`}
            style={{ scrollbarWidth: 'none' }}
          >
            {midLeft}
          </div>
        )}
        {midRight && (
          <div
            className={`pointer-events-auto ${colW} space-y-2 overflow-y-auto`}
            style={{ scrollbarWidth: 'none' }}
          >
            {midRight}
          </div>
        )}
      </div>

      {/* ── Row 3: bottom ── */}
      <div className="flex items-end justify-between gap-4">
        {bottomLeft  && <div className={`pointer-events-auto ${colW}`}>{bottomLeft}</div>}
        {bottomRight && <div className={`pointer-events-auto ${colW}`}>{bottomRight}</div>}
      </div>
    </div>
  );
}
