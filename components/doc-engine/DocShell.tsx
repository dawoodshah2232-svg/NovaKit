'use client';

/**
 * DocShell — three-pane editor shell shared by Studio V2 and CV Builder V2.
 *
 * Desktop (lg+): left sidebar (icon tab rail + tab content), flexible center
 * canvas area, right inspector sidebar. Below lg the sidebars become
 * slide-over drawers toggled by buttons in the mobile bar.
 */

import { useState, type ReactNode } from 'react';
import { PanelLeft, PanelRight, X } from 'lucide-react';

export interface DocShellTab {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

export interface DocShellProps {
  topBar: ReactNode;
  tabs: DocShellTab[];
  center: ReactNode;
  right: ReactNode;
  rightTitle?: string;
}

export function DocShell({ topBar, tabs, center, right, rightTitle }: DocShellProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '');
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  const leftContent = (onNavigate?: () => void) => (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      <div
        role="tablist"
        aria-label="Editor panels"
        style={{
          width: 56,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '10px 0',
          borderRight: '1px solid var(--pe-border)',
          background: 'var(--pe-surface)',
        }}
      >
        {tabs.map((t) => {
          const isActive = t.id === active?.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              title={t.label}
              onClick={() => {
                setActiveTab(t.id);
                onNavigate?.();
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'var(--pe-accent-soft)' : 'transparent',
                color: isActive ? 'var(--pe-accent)' : 'var(--pe-text-2)',
                cursor: 'pointer',
              }}
            >
              {t.icon}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: 'var(--pe-surface)' }}>
        {active?.content}
      </div>
    </div>
  );

  const rightContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {rightTitle && (
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--pe-border)',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--pe-text)',
            flexShrink: 0,
          }}
        >
          {rightTitle}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{right}</div>
    </div>
  );

  const drawerBackdrop: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 60,
  };

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--pe-bg)',
        color: 'var(--pe-text)',
      }}
    >
      <div style={{ flexShrink: 0, position: 'relative', zIndex: 40 }}>{topBar}</div>

      {/* Mobile bar: drawer toggles (below lg) */}
      <div
        className="flex lg:hidden"
        style={{
          gap: 8,
          padding: '8px 12px',
          borderBottom: '1px solid var(--pe-border)',
          background: 'var(--pe-surface)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setLeftOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 34,
            padding: '0 12px',
            borderRadius: 9,
            border: '1px solid var(--pe-border)',
            background: 'var(--pe-surface)',
            color: 'var(--pe-text)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <PanelLeft size={16} /> Panels
        </button>
        <button
          type="button"
          onClick={() => setRightOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 34,
            padding: '0 12px',
            borderRadius: 9,
            border: '1px solid var(--pe-border)',
            background: 'var(--pe-surface)',
            color: 'var(--pe-text)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <PanelRight size={16} /> Inspector
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left sidebar (desktop) */}
        <aside
          className="hidden lg:block"
          style={{ width: 300, flexShrink: 0, borderRight: '1px solid var(--pe-border)', minHeight: 0 }}
        >
          {leftContent()}
        </aside>

        {/* Center */}
        <main style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>{center}</main>

        {/* Right sidebar (desktop) */}
        <aside
          className="hidden lg:block"
          style={{ width: 300, flexShrink: 0, borderLeft: '1px solid var(--pe-border)', background: 'var(--pe-surface)', minHeight: 0 }}
        >
          {rightContent}
        </aside>
      </div>

      {/* Mobile drawers */}
      {leftOpen && (
        <>
          <div className="lg:hidden" style={drawerBackdrop} onClick={() => setLeftOpen(false)} />
          <div
            className="lg:hidden"
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              width: 300,
              maxWidth: '85vw',
              zIndex: 61,
              background: 'var(--pe-surface)',
              boxShadow: 'var(--pe-shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <button
              type="button"
              aria-label="Close panels"
              onClick={() => setLeftOpen(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 2,
                width: 30,
                height: 30,
                borderRadius: 8,
                border: '1px solid var(--pe-border)',
                background: 'var(--pe-surface)',
                color: 'var(--pe-text-2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={15} />
            </button>
            <div style={{ flex: 1, minHeight: 0 }}>{leftContent(() => setLeftOpen(false))}</div>
          </div>
        </>
      )}
      {rightOpen && (
        <>
          <div className="lg:hidden" style={drawerBackdrop} onClick={() => setRightOpen(false)} />
          <div
            className="lg:hidden"
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              right: 0,
              width: 300,
              maxWidth: '85vw',
              zIndex: 61,
              background: 'var(--pe-surface)',
              boxShadow: 'var(--pe-shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <button
              type="button"
              aria-label="Close inspector"
              onClick={() => setRightOpen(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 2,
                width: 30,
                height: 30,
                borderRadius: 8,
                border: '1px solid var(--pe-border)',
                background: 'var(--pe-surface)',
                color: 'var(--pe-text-2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={15} />
            </button>
            <div style={{ flex: 1, minHeight: 0 }}>{rightContent}</div>
          </div>
        </>
      )}
    </div>
  );
}
