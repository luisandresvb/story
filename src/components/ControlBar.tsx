import { Switch } from '@headlessui/react';
import { useState } from 'react';

interface ControlBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

const ControlBar = ({ darkMode, onToggleDarkMode, onReset, onExport, onImport }: ControlBarProps) => {
  const [isImporting, setIsImporting] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <h1 className="text-xl font-display font-semibold">Historias Interactivas</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Usa la IA de OpenAI para co-crear relatos ilustrados con continuidad total.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={darkMode}
            onChange={onToggleDarkMode}
            className={`${
              darkMode ? 'bg-indigo-500' : 'bg-slate-300'
            } relative inline-flex h-7 w-14 items-center rounded-full transition`}
          >
            <span className="sr-only">Activar modo oscuro</span>
            <span
              className={`${
                darkMode ? 'translate-x-7 bg-slate-900' : 'translate-x-1 bg-white'
              } inline-block h-5 w-5 transform rounded-full transition`}
            />
          </Switch>
          <button
            onClick={onExport}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
          >
            Exportar estado
          </button>
          <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300">
            Importar
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setIsImporting(true);
                try {
                  const text = await file.text();
                  onImport(text);
                } finally {
                  setIsImporting(false);
                }
              }}
            />
          </label>
          <button
            onClick={onReset}
            className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow transition hover:bg-rose-400"
          >
            Reiniciar
          </button>
          {isImporting && <span className="text-xs text-slate-500">Importando…</span>}
        </div>
      </div>
    </header>
  );
};

export default ControlBar;
