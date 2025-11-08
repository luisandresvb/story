import type { StoryPageOption } from '../types/story';

interface OptionCardProps {
  option: StoryPageOption;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

const OptionCard = ({ option, onSelect, disabled }: OptionCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      disabled={disabled}
      className="group flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-indigo-400"
    >
      <div className="flex items-start gap-3">
        <div className="h-16 w-20 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
          {option.imageUrl ? (
            <img
              src={option.imageUrl}
              alt={option.summary}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700" />
          )}
        </div>
        <div>
          <p className="text-base font-semibold text-indigo-600 transition group-hover:text-indigo-500 dark:text-indigo-300">
            {option.summary}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{option.textHint}</p>
        </div>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500 group-hover:text-indigo-400 dark:text-indigo-300">
        Continuar →
      </span>
    </button>
  );
};

export default OptionCard;
