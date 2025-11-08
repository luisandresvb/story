import { useEffect, useMemo, useState } from 'react';
import ControlBar from './components/ControlBar';
import OnboardingWizard from './components/OnboardingWizard';
import StoryViewport from './components/StoryViewport';
import { useStoryEngine } from './hooks/useStoryEngine';
import type { StoryState } from './types/story';

const App = () => {
  const engine = useStoryEngine();
  const {
    story,
    isGeneratingPage,
    isGeneratingOptions,
    currentPage,
    error,
    generateInitialPage,
    chooseOption,
    updateStoryMeta,
    resetStory,
    exportState,
    importState
  } = engine;
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('hi-dark-mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('hi-dark-mode');
    if (stored) {
      setDarkMode(stored === 'true');
    }
  }, []);

  useEffect(() => {
    if (onboardingComplete) {
      generateInitialPage();
    }
  }, [generateInitialPage, onboardingComplete]);

  const handleOnboardingComplete = (payload: Partial<StoryState>) => {
    updateStoryMeta({
      locale: payload.locale ?? story.locale,
      ageBracket: payload.ageBracket ?? story.ageBracket,
      genre: payload.genre ?? story.genre,
      theme: payload.theme ?? story.theme,
      characters: payload.characters ?? story.characters,
      styleGuide: payload.styleGuide ?? story.styleGuide
    });
    setOnboardingComplete(true);
  };

  const handleReset = () => {
    resetStory();
    setOnboardingComplete(false);
  };

  const handleExport = () => {
    const json = exportState();
    setExportedJson(json);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'story-state.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (json: string) => {
    importState(json);
    try {
      const parsed = JSON.parse(json) as StoryState;
      if (parsed.pages.length > 0) {
        setOnboardingComplete(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showOnboarding = useMemo(
    () => !onboardingComplete && story.pages.length === 0,
    [story.pages.length, onboardingComplete]
  );

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-100 pb-16 text-slate-900 transition dark:bg-slate-950 dark:text-slate-100">
        <ControlBar
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onReset={handleReset}
          onExport={handleExport}
          onImport={handleImport}
        />

        <main className="mx-auto mt-10 flex max-w-6xl flex-col gap-10 px-6 pb-20">
          {showOnboarding ? (
            <OnboardingWizard onComplete={handleOnboardingComplete} isBusy={isGeneratingPage} />
          ) : (
            <StoryViewport
              page={currentPage}
              isGenerating={isGeneratingPage}
              isGeneratingOptions={isGeneratingOptions}
              onSelectOption={chooseOption}
            />
          )}
          {error && (
            <div className="rounded-2xl border border-rose-400 bg-rose-50/80 p-4 text-sm text-rose-700 dark:border-rose-500 dark:bg-rose-500/20 dark:text-rose-100">
              {error}
            </div>
          )}
          {exportedJson && (
            <details className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
              <summary className="cursor-pointer font-semibold">Estado exportado (vista previa)</summary>
              <pre className="mt-3 whitespace-pre-wrap break-all">{exportedJson}</pre>
            </details>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
