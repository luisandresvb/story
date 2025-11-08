import type { AgeBracket, StoryState, StyleGuide } from '../types/story';

const paletteByGenre: Record<string, string[]> = {
  fantasy: ['#8D5A97', '#FFD166', '#F2E9E4', '#2F3061'],
  scifi: ['#0B132B', '#1C2541', '#3A506B', '#5BC0BE'],
  mystery: ['#0B090A', '#161A1D', '#660708', '#BA181B'],
  romance: ['#FFE5EC', '#FFC2D1', '#FF8FAB', '#FB6F92'],
  kids: ['#FFB703', '#FB8500', '#8ECAE6', '#219EBC']
};

const lightingByAge: Record<AgeBracket, string> = {
  kids: 'soft daylight with gentle highlights',
  teens: 'cinematic twilight with vibrant accents',
  adults: 'dramatic chiaroscuro with focused rim lighting'
};

const imageStyleByGenre: Record<string, string> = {
  fantasy: 'Painterly illustration with whimsical details',
  scifi: 'Futuristic concept art with crisp neon highlights',
  mystery: 'Noir graphic novel style with moody atmosphere',
  romance: 'Soft watercolor illustration with warm glow',
  infantil: 'Playful storybook illustration with bold shapes'
};

export const inferStyleGuide = (age: AgeBracket, genre: string): StyleGuide => {
  const normalizedGenre = genre.toLowerCase();
  const palette =
    paletteByGenre[normalizedGenre] ||
    (age === 'kids' ? paletteByGenre.kids : ['#264653', '#2a9d8f', '#e9c46a', '#f4a261']);
  const lighting = lightingByAge[age];
  const style =
    imageStyleByGenre[normalizedGenre] ||
    (age === 'kids'
      ? 'Cheerful storybook illustration with clean outlines'
      : age === 'teens'
      ? 'Dynamic digital art with expressive lighting'
      : 'Elegant digital painting with cinematic depth');

  return {
    imageStyle: style,
    palette,
    lighting
  };
};

export const createInitialState = (overrides: Partial<StoryState>): StoryState => {
  const genre = overrides.genre ?? 'fantasy';
  const ageBracket = overrides.ageBracket ?? 'teens';
  const styleGuide = overrides.styleGuide ?? inferStyleGuide(ageBracket, genre);

  return {
    locale: overrides.locale ?? 'es-ES',
    ageBracket,
    genre,
    theme: overrides.theme ?? '',
    characters: overrides.characters ?? [],
    styleGuide,
    lore:
      overrides.lore ??
      ({
        setting: '',
        rules: [],
        objects: [],
        continuity_notes: []
      } as const),
    pages: overrides.pages ?? []
  };
};
