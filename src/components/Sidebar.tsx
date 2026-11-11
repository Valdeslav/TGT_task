import { BarChart3, LayoutDashboard, RotateCcw, Users } from 'lucide-react';
import type { PageId } from '../types';
import { useStore } from '../store/useStore';

interface SidebarProps {
  page: PageId;
  onNavigate: (page: PageId) => void;
  newcomersCount: number;
}

const navItems: Array<{ id: PageId; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'pulse', label: 'Пульс новичков', icon: LayoutDashboard },
  { id: 'newcomers', label: 'Все новички', icon: Users },
  { id: 'analytics', label: 'Аналитика 90 дней', icon: BarChart3 },
];

export function Sidebar({ page, onNavigate, newcomersCount }: SidebarProps) {
  const { newcomers, resetDemo } = useStore();
  const redCount = newcomers.filter((item) => item.risk.level === 'red').length;

  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onNavigate('pulse')} aria-label="НОВИЧОК, на главную">
        <span className="brand-mark">90</span>
        <span className="brand-copy">
          <span className="brand-name">НОВИЧОК</span>
          <span className="brand-sub">первые 90 дней</span>
        </span>
      </button>

      <nav className="nav" aria-label="Разделы">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={page === item.id ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
              {item.id === 'pulse' && redCount > 0 && (
                <span className="nav-count">{redCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="demo-card">
          <div className="demo-card-top">
            <span className="demo-dot" />
            <span>Демо-режим</span>
          </div>
          <p>
            {newcomersCount} новичков, данные и задачи в Битрикс24 — синтетические.
          </p>
          <button
            className="demo-reset"
            onClick={() => {
              if (window.confirm('Сбросить демо-данные и вернуть исходный сценарий?')) {
                resetDemo();
              }
            }}
          >
            <RotateCcw size={14} />
            Сбросить демо
          </button>
        </div>
        <div className="sidebar-user">
          <span className="sidebar-avatar">АК</span>
          <span>
            <b>Анна Ковалёва</b>
            <small>HR-партнёр</small>
          </span>
        </div>
      </div>
    </aside>
  );
}
