import { Fragment } from 'react';
import OptionCard from './OptionCard';
import type { StoryPage } from '../types/story';

interface StoryViewportProps {
  page: StoryPage | null;
  isGenerating: boolean;
  isGeneratingOptions: boolean;
  onSelectOption: (optionId: string) => void;
}

const paragraphize = (text: string) =>
  text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const StoryViewport = ({ page, isGenerating, isGeneratingOptions, onSelectOption }: StoryViewportProps) => {
  if (!page) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        <p className="text-lg font-medium">Cuando empiece la historia, verás aquí las páginas ilustradas.</p>
      </div>
    );
  }

  const paragraphs = paragraphize(page.text);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
        <div className="relative h-96 w-full bg-slate-200 dark:bg-slate-800">
          {page.imageUrl ? (
            <img src={page.imageUrl} alt="Ilustración de la historia" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700" />
          )}
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
              <span className="animate-pulse rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800">
                Generando página…
              </span>
            </div>
          )}
        </div>
        <div className="space-y-4 p-8 text-lg leading-relaxed text-slate-700 dark:text-slate-100">
          {paragraphs.map((paragraph, index) => (
            <Fragment key={index}>
              <p>{paragraph}</p>
            </Fragment>
          ))}
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Elige la continuación
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {page.options.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              Preparando caminos alternativos…
            </div>
          )}
          {page.options.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              onSelect={onSelectOption}
              disabled={isGenerating || isGeneratingOptions}
            />
          ))}
        </div>
        {isGeneratingOptions && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Afinando opciones…</p>
        )}
      </section>
    </div>
  );
};

export default StoryViewport;
