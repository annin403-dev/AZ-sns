import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { StoreProvider, useStore } from './store';
import Home from './pages/Home';
import Items from './pages/Items';
import Stock from './pages/Stock';
import Family from './pages/Family';
import Settings from './pages/Settings';
import { Onboarding } from './components/Onboarding';
import { Button, cx } from './ui';

type Tab = 'home' | 'items' | 'stock' | 'family' | 'settings';
const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'ホーム', icon: '🏠' },
  { key: 'items', label: '持ち物', icon: '👕' },
  { key: 'stock', label: '備蓄', icon: '🥫' },
  { key: 'family', label: '家族', icon: '👪' },
  { key: 'settings', label: '設定', icon: '⚙️' },
];

function readTab(): Tab {
  const h = location.hash.replace('#', '') as Tab;
  return tabs.some((t) => t.key === h) ? h : 'home';
}

function App() {
  const { data, loadError, slow, toasts, dismissToast, settings, reload } = useStore();
  const [tab, setTab] = useState<Tab>(readTab);
  const [guide, setGuide] = useState(false);
  useEffect(() => {
    const on = () => setTab(readTab());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const go = (t: Tab) => {
    location.hash = t;
    setTab(t);
    window.scrollTo(0, 0);
  };

  const showGuide = data && (guide || !settings.onboarding_done);

  return (
    <div className="mx-auto min-h-dvh max-w-lg">
      {slow && <div role="status" className="sticky top-0 z-30 bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">つながりにくくなっています。少し待つか、電波のよいところでためしてください。</div>}
      <header className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h1 className="text-xl font-bold">{tabs.find((t) => t.key === tab)!.label}</h1>
      </header>
      <main className="px-4 pb-28">
        {loadError ? (
          <div className="mt-10 text-center">
            <p className="mb-4">{loadError}</p>
            <Button variant="primary" onClick={() => location.reload()}>読み込みなおす</Button>
          </div>
        ) : !data ? (
          <p className="mt-10 text-center text-stone-500" role="status">読み込んでいます…</p>
        ) : (
          <>
            {tab === 'home' && <Home />}
            {tab === 'items' && <Items />}
            {tab === 'stock' && <Stock />}
            {tab === 'family' && <Family />}
            {tab === 'settings' && <Settings onRestartGuide={() => setGuide(true)} />}
          </>
        )}
      </main>
      {showGuide && <Onboarding onDone={() => { setGuide(false); reload(); go('home'); }} />}

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={cx('pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-xl px-4 py-2 text-sm text-white shadow-lg', t.tone === 'error' ? 'bg-red-700' : 'bg-stone-800 dark:bg-stone-700')}>
            <span className="flex-1">{t.tone === 'error' ? '⚠️ ' : ''}{t.text}</span>
            {t.undo && <button className="min-h-11 rounded-lg px-3 font-bold text-accent-100 underline" onClick={() => { t.undo!(); dismissToast(t.id); }}>元に戻す</button>}
          </div>
        ))}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-stone-800 dark:bg-stone-900/95" aria-label="画面の切り替え">
        <div className="mx-auto flex max-w-lg">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => go(t.key)} aria-current={tab === t.key ? 'page' : undefined} className={cx('flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs', tab === t.key ? 'font-bold text-accent-700 dark:text-accent-100' : 'text-stone-500')}>
              <span className="text-xl" aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
