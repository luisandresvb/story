import { useEffect, useMemo, useState } from 'react';
import { fetchSuggestions } from '../lib/api';
import { inferStyleGuide } from '../lib/styleGuide';
import type {
  AgeBracket,
  CharacterDescriptor,
  LocaleOption,
  StorySuggestion
} from '../types/story';

interface WizardProps {
  onComplete: (payload: {
    locale: LocaleOption;
    ageBracket: AgeBracket;
    genre: string;
    theme: string;
    characters: CharacterDescriptor[];
    styleGuide: ReturnType<typeof inferStyleGuide>;
  }) => void;
  isBusy: boolean;
}

const ageOptions: Array<{ value: AgeBracket; label: string }> = [
  { value: 'kids', label: 'Niños (6-9)' },
  { value: 'teens', label: 'Adolescentes (13-17)' },
  { value: 'adults', label: 'Adultos' }
];

const localeOptions: Array<{ value: LocaleOption; label: string }> = [
  { value: 'es-ES', label: 'Español' },
  { value: 'en-US', label: 'English' }
];

const genreSuggestions = ['fantasy', 'scifi', 'mystery', 'romance', 'adventure', 'infantil'];

type Step = 0 | 1 | 2;

const emptyCharacter: CharacterDescriptor = {
  name: '',
  traits: [],
  visual_cues: [],
  role: 'protagonist'
};

const OnboardingWizard = ({ onComplete, isBusy }: WizardProps) => {
  const [step, setStep] = useState<Step>(0);
  const [locale, setLocale] = useState<LocaleOption>('es-ES');
  const [ageBracket, setAgeBracket] = useState<AgeBracket>('teens');
  const [genre, setGenre] = useState('fantasy');
  const [theme, setTheme] = useState('');
  const [suggestions, setSuggestions] = useState<StorySuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [characters, setCharacters] = useState<CharacterDescriptor[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<CharacterDescriptor>(emptyCharacter);

  const canContinue = useMemo(() => {
    if (step === 0) {
      return Boolean(locale && ageBracket);
    }
    if (step === 1) {
      return Boolean(genre);
    }
    return true;
  }, [step, locale, ageBracket, genre]);

  useEffect(() => {
    if (step !== 1) return;
    setSuggestionsLoading(true);
    fetchSuggestions({
      locale,
      ageBracket,
      genre,
      theme: theme || undefined
    })
      .then((res) => setSuggestions(res.suggestions))
      .catch((err) => {
        console.error(err);
        setSuggestions([]);
      })
      .finally(() => setSuggestionsLoading(false));
  }, [locale, ageBracket, genre, theme, step]);

  const addCharacter = () => {
    if (!currentCharacter.name.trim()) return;
    setCharacters((prev) => [
      ...prev,
      {
        ...currentCharacter,
        traits: currentCharacter.traits.filter(Boolean),
        visual_cues: currentCharacter.visual_cues.filter(Boolean)
      }
    ]);
    setCurrentCharacter({ ...emptyCharacter });
  };

  const handleComplete = () => {
    const styleGuide = inferStyleGuide(ageBracket, genre);
    onComplete({
      locale,
      ageBracket,
      genre,
      theme,
      characters,
      styleGuide
    });
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white/80 p-8 shadow-xl ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/80 dark:ring-slate-700">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold">Historias Interactivas</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Diseña el punto de partida y deja que la IA continúe tu relato.
          </p>
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Paso {step + 1} de 3</span>
      </div>

      {step === 0 && (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Idioma preferido
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {localeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLocale(option.value)}
                  className={`rounded-lg border px-4 py-3 text-left transition hover:border-slate-400 ${
                    locale === option.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="block text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Rango de edad del lector
            </label>
            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
              {ageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAgeBracket(option.value)}
                  className={`rounded-lg border px-4 py-3 text-left transition hover:border-slate-400 ${
                    ageBracket === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="block text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Género narrativo
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {genreSuggestions.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
                    genre === g
                      ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-400 dark:bg-fuchsia-500/10'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <input
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              className="mt-3 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-200 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Introduce o ajusta el género"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Tema o trama inicial
            </label>
            <textarea
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              className="mt-2 h-24 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-200 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Describe brevemente el conflicto o la idea central"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Sugerencias generadas por la IA
              </h3>
              {suggestionsLoading && <span className="text-xs text-slate-500">Generando…</span>}
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setTheme(item.theme);
                  }}
                  className="rounded-xl border border-slate-200 p-4 text-left shadow-sm transition hover:border-indigo-400 dark:border-slate-700 dark:hover:border-indigo-400"
                >
                  <h4 className="text-base font-semibold text-indigo-600 dark:text-indigo-300">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{item.synopsis}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Personajes opcionales
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Añade protagonistas o personajes clave con rasgos y pistas visuales para mantener la continuidad.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={currentCharacter.name}
                onChange={(e) => setCurrentCharacter((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <select
                value={currentCharacter.role}
                onChange={(e) =>
                  setCurrentCharacter((prev) => ({
                    ...prev,
                    role: e.target.value as CharacterDescriptor['role']
                  }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="protagonist">Protagonista</option>
                <option value="antagonist">Antagonista</option>
                <option value="supporting">Aliado</option>
              </select>
              <input
                value={currentCharacter.traits.join(', ')}
                onChange={(e) =>
                  setCurrentCharacter((prev) => ({
                    ...prev,
                    traits: e.target.value.split(',').map((item) => item.trim())
                  }))
                }
                placeholder="Rasgos (separados por coma)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                value={currentCharacter.visual_cues.join(', ')}
                onChange={(e) =>
                  setCurrentCharacter((prev) => ({
                    ...prev,
                    visual_cues: e.target.value.split(',').map((item) => item.trim())
                  }))
                }
                placeholder="Pistas visuales (separadas por coma)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={addCharacter}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
                disabled={!currentCharacter.name.trim()}
              >
                Añadir personaje
              </button>
            </div>
            {characters.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {characters.map((character) => (
                  <li
                    key={character.name}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{character.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {character.role} · Rasgos: {character.traits.join(', ')} · Visual: {character.visual_cues.join(', ')}
                      </p>
                    </div>
                    <button
                      className="text-xs text-rose-500 hover:text-rose-600"
                      onClick={() =>
                        setCharacters((prev) => prev.filter((item) => item.name !== character.name))
                      }
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => (prev - 1) as Step)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
          >
            Atrás
          </button>
        ) : (
          <span />
        )}
        {step < 2 ? (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep((prev) => (prev + 1) as Step)}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-50"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            disabled={isBusy}
            onClick={handleComplete}
            className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {isBusy ? 'Generando…' : 'Crear historia'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
