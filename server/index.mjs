import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { config } from 'dotenv';
import { buildImagePrompt, buildStoryPrompt, buildSuggestionPrompt } from './promptBuilders.js';

config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));

const port = process.env.PORT || 8787;

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ Falta la variable OPENAI_API_KEY. Define la clave antes de usar la API.');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const safeParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Error parsing JSON response', error, text);
    throw new Error('No se pudo interpretar la respuesta de la IA.');
  }
};

const ensureChildFriendly = (ageBracket, text) => {
  if (ageBracket === 'kids') {
    const forbidden = /(violence|gore|blood|death|murder|weapon)/i;
    if (forbidden.test(text)) {
      throw new Error('El contenido generado no es apto para niños. Inténtalo de nuevo.');
    }
  }
};

app.post('/api/generate/story', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Falta OPENAI_API_KEY en el servidor.' });
    }

    const { state, continueFromOptionId } = req.body;
    const prompt = buildStoryPrompt(state, continueFromOptionId);

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
      response_format: { type: 'json_object' }
    });

    const raw = response.output_text;
    const data = safeParse(raw);

    ensureChildFriendly(state.ageBracket, data.text ?? '');

    return res.json({
      text: data.text,
      options: data.options,
      loreUpdate: data.loreUpdate
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Error al generar la historia.');
  }
});

app.post('/api/generate/image', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Falta OPENAI_API_KEY en el servidor.' });
    }

    const { description, state } = req.body;
    const prompt = buildImagePrompt({ description, state });
    const image = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024'
    });

    const imageUrl = image.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No se pudo obtener la imagen.');
    }

    res.json({ imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Error al generar la imagen.');
  }
});

app.post('/api/generate/suggestions', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Falta OPENAI_API_KEY en el servidor.' });
    }

    const payload = req.body;
    const prompt = buildSuggestionPrompt(payload);

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
      response_format: { type: 'json_object' }
    });

    const data = safeParse(response.output_text);
    const list = Array.isArray(data.suggestions) ? data.suggestions.slice(0, 6) : [];
    if (list.length < 3) {
      throw new Error('No se generaron suficientes sugerencias.');
    }

    res.json({ suggestions: list });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Error al generar sugerencias.');
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`🚀 Historias Interactivas API escuchando en http://localhost:${port}`);
});
