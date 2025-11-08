const paragraphGuidance = {
  kids: 'Write 1-2 short paragraphs (3-4 sentences total).',
  teens: 'Write 3-4 paragraphs with 4-5 sentences each.',
  adults: 'Write 4-5 paragraphs with vivid detail (approx 16-22 sentences).'
};

const ageGuidance = {
  kids: 'Use simple vocabulary and short sentences appropriate for children aged 6-9.',
  teens: 'Use engaging YA tone with moderate complexity suitable for teenagers 13-17.',
  adults: 'Use rich, evocative language for adult readers with moderate sophistication.'
};

export const buildStoryPrompt = (state, continueFromOptionId) => {
  const { lore, genre, theme, locale, characters, ageBracket } = state;
  const characterText = characters.length
    ? characters
        .map(
          (c) =>
            `${c.name} (${c.role}). Traits: ${c.traits.join(', ')}. Visual cues: ${c.visual_cues.join(', ')}`
        )
        .join(' | ')
    : 'Introduce compelling characters matching the genre.';

  const localeText = locale === 'es-ES' ? 'Spanish (Spain)' : 'English (US)';

  return `You are the narrative engine for the interactive web app "Historias Interactivas".
Maintain strict continuity with the existing lore: setting=${lore.setting || 'TBD'}, rules=${
    lore.rules.join('; ') || 'none yet'
  }, objects=${lore.objects.join('; ') || 'none yet'}, notes=${
    lore.continuity_notes.join('; ') || 'none yet'
  }.
Genre: ${genre}. Theme: ${theme}.
Locale: ${localeText}.
Characters: ${characterText}
${ageGuidance[ageBracket]}
${paragraphGuidance[ageBracket]}
Close with a cliffhanger hook that invites a decision.
Return JSON with keys: text (string), options (array of 2 objects with id, summary (<=2 sentences), textHint (1-3 paragraphs outline for the continuation)), and optional loreUpdate (object with fields setting, rules, objects, continuity_notes when new details are introduced).
Ensure summaries and hints are consistent with existing lore and characters.
Continue the story${continueFromOptionId ? ` following the outcome ${continueFromOptionId}` : ''}.`;
};

export const buildSuggestionPrompt = ({ locale, ageBracket, genre, theme }) => {
  const language = locale === 'es-ES' ? 'Spanish' : 'English';
  return `Generate between 3 and 6 interactive story starter suggestions as JSON.
Language: ${language}.
Genre emphasis: ${genre}.
Audience: ${ageBracket}.
Optional theme hint: ${theme || 'user will decide'}.
Each suggestion must include: id (slug), title, synopsis (2 sentences), and theme (short hook).
Output a JSON object with key "suggestions" as an array.`;
};

export const buildImagePrompt = ({ description, state }) => {
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
Recurring characters and props must match prior depictions: ${
    cast || 'introduce consistent original characters and reuse them going forward'
  }.
Maintain consistent art direction across pages.`;
};
