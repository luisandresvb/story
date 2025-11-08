export type LocaleOption = 'es-ES' | 'en-US';
export type AgeBracket = 'kids' | 'teens' | 'adults';

export interface CharacterDescriptor {
  name: string;
  traits: string[];
  visual_cues: string[];
  role: 'protagonist' | 'antagonist' | 'supporting';
}

export interface StyleGuide {
  imageStyle: string;
  palette: string[];
  lighting: string;
}

export interface LoreGuide {
  setting: string;
  rules: string[];
  objects: string[];
  continuity_notes: string[];
}

export interface StoryPageOption {
  id: string;
  summary: string;
  textHint: string;
  imageUrl?: string;
}

export interface StoryPage {
  id: string;
  text: string;
  imageUrl: string;
  createdAt: number;
  options: StoryPageOption[];
}

export interface StoryState {
  locale: LocaleOption;
  ageBracket: AgeBracket;
  genre: string;
  theme: string;
  characters: CharacterDescriptor[];
  styleGuide: StyleGuide;
  lore: LoreGuide;
  pages: StoryPage[];
}

export interface StorySuggestion {
  id: string;
  title: string;
  synopsis: string;
  theme: string;
}

export interface SuggestionRequestPayload {
  locale: LocaleOption;
  ageBracket: AgeBracket;
  genre: string;
  theme?: string;
}

export interface SuggestionResponse {
  suggestions: StorySuggestion[];
}

export interface StoryGenerationRequest {
  state: StoryState;
  continueFromOptionId?: string;
}

export interface StoryGenerationResponse {
  text: string;
  options: Array<Pick<StoryPageOption, 'id' | 'summary' | 'textHint'>>;
  loreUpdate?: Partial<LoreGuide>;
}

export interface ImageGenerationRequest {
  description: string;
  state: StoryState;
  optionId?: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
}
