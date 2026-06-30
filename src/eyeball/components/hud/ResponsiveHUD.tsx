import { useState, type ReactNode } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

/**
 * HUDPanel — collapsible section card.
 * Desktop/tablet: always a collapsible accordion (consistent everywhere,
 * not just mobile) so a long sidebar stays manageable — low-priority
 * panels (Microscope, Score & Coach) default closed.
 */
export function HUDPanel({
  children,
  title,
  defaultOpen = true,
  accent = 'blue',
}: {
  children: ReactNode;
  title: string;
  defaultOpen?: boolean;
  accent?: 'blue' | 'green' | 'amber' | 'purple';
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const accentText = {
    blue: 'text-blue-400', green: 'text-green-400',
    amber: 'text-amber-400', purple: 'text-purple-400',
  }[accent];

  return (
    <div className="pointer-events-auto overflow-hidden rounded-lg border border-blue-500/25 bg-gray-950/90 backdrop-blur">
      <button
        onClick={() => { setIsOpen((v) => !v); }}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-blue-500/5"
      >
        <span className={`text-xs font-semibold tracking-wider uppercase ${accentText}`}>
          {title}
        </span>
        <span className="text-blue-300/40 transition-transform" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-blue-500/15 px-3 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * HUDSidebar — single continuous scrollable column, fixed to one screen edge.
 *
 * Replaces the old 3-row grid. Panels stack in normal document flow —
 * structurally impossible for two panels to overlap, since each one
 * simply pushes the next one down. The whole column scrolls as one unit
 * once content exceeds the viewport.
 *
 * `topOffset` reserves space below the floating ☰ Help button (right side)
 * or the top edge (left side) so the sidebar never starts under it.
 */
export function HUDSidebar({
  side,
  children,
  topOffset = 'top-16',
}: {
  side: 'left' | 'right';
  children: ReactNode;
  topOffset?: string;
}) {
  const bp = useBreakpoint();
  const isMobile = bp === 'sm';

  if (isMobile) {
    // Mobile: single bottom drawer, both sides merge into one stack.
    // (Two separate <HUDSidebar> calls each render their own drawer
    // section; App.tsx stacks left then right for a natural reading order.)
    return (
      <div className="pointer-events-none w-full px-2 pb-2">
        <div className="pointer-events-auto flex flex-col gap-2">
          {children}
        </div>
      </div>
    );
  }

  const widthClass = bp === 'md' ? 'w-60' : 'w-72';
  const sideClass  = side === 'left' ? 'left-4' : 'right-4';

  return (
    <div
      className={`pointer-events-none fixed ${topOffset} bottom-4 ${sideClass} z-30 ${widthClass}`}
    >
      <div
        className="pointer-events-auto flex h-full flex-col gap-2.5 overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(59,130,246,0.3) transparent' }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * HUDLayout — thin compatibility wrapper kept for any remaining callers.
 * New code should use <HUDSidebar side="left|right"> directly (see App.tsx).
 */
export function HUDLayout({
  topLeft, topRight, midLeft, midRight, bottomRight, bottomLeft,
}: {
  topLeft?: ReactNode; topRight?: ReactNode;
  midLeft?: ReactNode; midRight?: ReactNode;
  bottomRight?: ReactNode; bottomLeft?: ReactNode;
}) {
  return (
    <>
      <HUDSidebar side="left">
        {topLeft}{midLeft}{bottomLeft}
      </HUDSidebar>
      <HUDSidebar side="right">
        {topRight}{midRight}{bottomRight}
      </HUDSidebar>
    </>
  );
}
