import { CalendarDays, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import type { PageId } from '../types';
import { useStore } from '../store/useStore';
import { pluralRu } from '../lib/dates';

const pageMeta: Record<PageId, { title: string; subtitle: string }> = {
  pulse: {
    title: 'Пульс новичков',
    subtitle: 'Кто прямо сейчас может уйти, и что с этим делать',
  },
  newcomers: {
    title: 'Все новички',
    subtitle: 'Первые 90 дней: статус, наставник и следующий шаг',
  },
  analytics: {
    title: 'Аналитика 90 дней',
    subtitle: 'Где и на каком дне мы теряем людей',
  },
};

export function Topbar({ page }: { page: PageId }) {
  const { sync, state } = useStore();
  const [syncing, setSyncing] = useState(false);
  const meta = pageMeta[page];
  const dateLabel = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  }).format(new Date());

  const handleSync = () => {
    if (syncing) return;
    setSyncing(true);
    window.setTimeout(() => {
      sync();
      setSyncing(false);
    }, 650);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-kicker">
          <CalendarDays size={13} />
          {dateLabel}
        </span>
        <span className="topbar-title">{meta.title}</span>
      </div>
      <div className="topbar-right">
        <span className="bitrix-pill" title="Демо-адаптер Битрикс24">
          <span className="bitrix-mark">Б</span>
          <span className="bitrix-copy">
            <b>Битрикс24</b>
            <small>
              {state.tasks.length} {pluralRu(state.tasks.length, 'задача', 'задачи', 'задач')} в работе
            </small>
          </span>
        </span>
        <button
          className={`icon-button ${syncing ? 'is-spinning' : ''}`}
          onClick={handleSync}
          aria-label="Синхронизировать с Битрикс24"
          title="Синхронизировать с Битрикс24"
        >
          <RefreshCw size={17} />
        </button>
        <span className="topbar-avatar">АК</span>
      </div>
    </header>
  );
}
