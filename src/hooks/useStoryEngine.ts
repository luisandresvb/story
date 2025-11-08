import { useCallback, useMemo, useState } from 'react';
import { generateImage, generateStoryPage } from '../lib/api';
import { createInitialState, inferStyleGuide } from '../lib/styleGuide';
import type { StoryPage, StoryPageOption, StoryState } from '../types/story';

const withUpdatedPage = (
  pages: StoryPage[],
  pageId: string,
  updater: (page: StoryPage) => StoryPage
): StoryPage[] => pages.map((page) => (page.id === pageId ? updater(page) : page));

export interface StoryEngine {
  story: StoryState;
  updateStoryMeta: (payload: Partial<StoryState>) => void;
  currentPage: StoryPage | null;
  isGeneratingPage: boolean;
  isGeneratingOptions: boolean;
  error: string | null;
  generateInitialPage: () => Promise<void>;
  chooseOption: (optionId: string) => Promise<void>;
  resetStory: () => void;
  exportState: () => string;
  importState: (json: string) => void;
}

const enrichOption = (option: StoryPageOption): StoryPageOption => ({
  ...option,
  id: option.id || crypto.randomUUID()
});

export const useStoryEngine = (initial?: Partial<StoryState>): StoryEngine => {
  const [story, setStory] = useState<StoryState>(() => createInitialState(initial ?? {}));
  const [isGeneratingPage, setGeneratingPage] = useState(false);
  const [isGeneratingOptions, setGeneratingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPage = useMemo(() => {
    return story.pages.at(-1) ?? null;
  }, [story.pages]);

  const updateStoryMeta = useCallback((payload: Partial<StoryState>) => {
    setStory((prev) => {
      const merged: StoryState = {
        ...prev,
        ...payload
      };
      if (payload.genre || payload.ageBracket) {
        const age = payload.ageBracket ?? merged.ageBracket;
        const genre = payload.genre ?? merged.genre;
        merged.styleGuide = inferStyleGuide(age, genre);
      }
      return merged;
    });
  }, []);

  const applyLoreUpdate = useCallback((update: StoryState['lore'] | Partial<StoryState['lore']>) => {
    if (!update) return;
    setStory((prev) => ({
      ...prev,
      lore: {
        setting: update.setting ?? prev.lore.setting,
        rules: update.rules ?? prev.lore.rules,
        objects: update.objects ?? prev.lore.objects,
        continuity_notes: update.continuity_notes ?? prev.lore.continuity_notes
      }
    }));
  }, []);

  const generatePage = useCallback(
    async (continueFromOptionId?: string) => {
      setError(null);
      setGeneratingPage(true);
      try {
        const response = await generateStoryPage({
          state: story,
          continueFromOptionId
        });

        const pageId = crypto.randomUUID();
        const baseOptions = response.options.map((option) => enrichOption(option as StoryPageOption));
        const newPage: StoryPage = {
          id: pageId,
          text: response.text,
          imageUrl: '',
          createdAt: Date.now(),
          options: baseOptions
        };

        setStory((prev) => ({
          ...prev,
          pages: [...prev.pages, newPage]
        }));

        applyLoreUpdate(response.loreUpdate ?? {});

        const imageDescription = response.text;
        const imageResult = await generateImage({
          description: imageDescription,
          state: {
            ...story,
            pages: [...story.pages, newPage]
          }
        });

        setStory((prev) => ({
          ...prev,
          pages: withUpdatedPage(prev.pages, pageId, (page) => ({
            ...page,
            imageUrl: imageResult.imageUrl
          }))
        }));

        setGeneratingPage(false);
        setGeneratingOptions(true);

        const optionsWithImages: StoryPageOption[] = [];

        for (const option of baseOptions) {
          try {
            const image = await generateImage({
              description: `${option.textHint}\nFocus on key visual elements mentioned.`,
              state: {
                ...story,
                pages: [...story.pages, { ...newPage, imageUrl: imageResult.imageUrl }]
              },
              optionId: option.id
            });
            optionsWithImages.push({ ...option, imageUrl: image.imageUrl });
          } catch (optionError) {
            console.error('Failed to render option image', optionError);
            optionsWithImages.push(option);
          }
        }

        setStory((prev) => ({
          ...prev,
          pages: withUpdatedPage(prev.pages, pageId, (page) => ({
            ...page,
            options: optionsWithImages
          }))
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error generating story.';
        console.error(err);
        setError(message);
      } finally {
        setGeneratingPage(false);
        setGeneratingOptions(false);
      }
    },
    [applyLoreUpdate, story]
  );

  const generateInitialPage = useCallback(async () => {
    if (story.pages.length) return;
    await generatePage();
  }, [generatePage, story.pages.length]);

  const chooseOption = useCallback(
    async (optionId: string) => {
      setStory((prev) => ({
        ...prev,
        pages: prev.pages.map((page, index) =>
          index === prev.pages.length - 1
            ? {
                ...page,
                options: page.options.map((option) => ({
                  ...option,
                  summary: option.summary,
                  textHint: option.textHint
                }))
              }
            : page
        )
      }));
      await generatePage(optionId);
    },
    [generatePage]
  );

  const resetStory = useCallback(() => {
    setStory((prev) => createInitialState({ ...prev, pages: [], lore: { setting: '', rules: [], objects: [], continuity_notes: [] } }));
    setError(null);
  }, []);

  const exportState = useCallback(() => JSON.stringify(story, null, 2), [story]);

  const importState = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as StoryState;
      setStory(parsed);
    } catch (err) {
      setError('No se pudo importar el estado. Verifica el JSON.');
    }
  }, []);

  return {
    story,
    updateStoryMeta,
    currentPage,
    isGeneratingPage,
    isGeneratingOptions,
    error,
    generateInitialPage,
    chooseOption,
    resetStory,
    exportState,
    importState
  };
};
