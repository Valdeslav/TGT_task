import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { NewcomerDrawer } from './components/NewcomerDrawer';
import { Toast } from './components/Toast';
import { PulsePage } from './pages/PulsePage';
import { NewcomersPage } from './pages/NewcomersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { useStore } from './store/useStore';

export type PageId = 'pulse' | 'newcomers' | 'analytics';

export function App() {
  const [page, setPage] = useState<PageId>('pulse');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast, state } = useStore();

  const openNewcomer = (id: string) => setSelectedId(id);

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} newcomersCount={state.newcomers.length} />
      <main className="main">
        <Topbar page={page} />
        {page === 'pulse' && (
          <PulsePage onOpenNewcomer={openNewcomer} onNavigate={setPage} />
        )}
        {page === 'newcomers' && <NewcomersPage onOpenNewcomer={openNewcomer} />}
        {page === 'analytics' && <AnalyticsPage />}
      </main>
      {selectedId && (
        <NewcomerDrawer newcomerId={selectedId} onClose={() => setSelectedId(null)} />
      )}
      {toast && <Toast key={toast.id} message={toast.message} detail={toast.detail} />}
    </div>
  );
}
