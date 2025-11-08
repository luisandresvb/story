import type { ImageGenerationRequest, StoryState } from '../types/story';

export const buildStoryPrompt = (state: StoryState, continueFromOptionId?: string) => {
  const ageGuidance: Record<typeof state.ageBracket, string> = {
    kids: 'Use simple vocabulary and short sentences appropriate for children aged 6-9.',
    teens: 'Use engaging YA tone with moderate complexity suitable for teenagers 13-17.',
    adults: 'Use rich, evocative language for adult readers with moderate sophistication.'
  };

  const paragraphGuidance: Record<typeof state.ageBracket, string> = {
    kids: 'Write 1-2 short paragraphs (3-4 sentences total).',
    teens: 'Write 3-4 paragraphs with 4-5 sentences each.',
    adults: 'Write 4-5 paragraphs with vivid detail (approx 16-22 sentences).'
  };

  return `You are the narrative engine for the interactive web app "Historias Interactivas".
Maintain strict continuity with the existing lore: setting=${state.lore.setting || 'TBD'}, rules=${
    state.lore.rules.join('; ') || 'none yet'
  }, objects=${state.lore.objects.join('; ') || 'none yet'}, notes=${
    state.lore.continuity_notes.join('; ') || 'none yet'
  }.
Genre: ${state.genre}. Theme: ${state.theme}.
Locale: ${state.locale === 'es-ES' ? 'Spanish (Spain)' : 'English (US)'}.
Characters: ${
    state.characters.length
      ? state.characters
          .map(
            (c) =>
              `${c.name} (${c.role}). Traits: ${c.traits.join(', ')}. Visual cues: ${c.visual_cues.join(', ')}`
          )
          .join(' | ')
      : 'Introduce compelling characters matching the genre.'
  }
${ageGuidance[state.ageBracket]}
${paragraphGuidance[state.ageBracket]}
Close with a cliffhanger hook that invites a decision.
Return JSON with keys: text (string), options (array of 2 objects with id, summary (<=2 sentences), textHint (1-3 paragraphs outline for the continuation)).
Ensure summaries and hints are consistent with existing lore and characters.
Continue the story${continueFromOptionId ? ` following the outcome ${continueFromOptionId}` : ''}.`;
};

export const buildImagePrompt = ({ description, state }: ImageGenerationRequest) => {
  const language = state.locale === 'es-ES' ? 'Spanish' : 'English';
  const cast = state.characters
    .map(
      (c) =>
        `${c.name}: ${c.traits.join(', ')}; visual cues: ${c.visual_cues.join(', ')}; role: ${c.role}`
    )
    .join(' | ');

  return `Create a single illustration for the interactive story "Historias Interactivas".
Narrative consistency is mandatory. Depict exactly the scene: ${description}.
Genre: ${state.genre}. Age group: ${state.ageBracket}. Language of text: ${language}.
Style: ${state.styleGuide.imageStyle}. Color palette focus: ${state.styleGuide.palette.join(', ')}.
Lighting: ${state.styleGuide.lighting}.
Recurring characters and props must match prior depictions: ${cast || 'introduce consistent original characters and reuse them going forward'}.
Maintain consistent art direction across pages.`;
};
