import type {
  ImageGenerationRequest,
  ImageGenerationResponse,
  StoryGenerationRequest,
  StoryGenerationResponse,
  SuggestionRequestPayload,
  SuggestionResponse
} from '../types/story';

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
};

export const generateStoryPage = async (
  payload: StoryGenerationRequest
): Promise<StoryGenerationResponse> => {
  const res = await fetch('/api/generate/story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<StoryGenerationResponse>(res);
};

export const generateImage = async (
  payload: ImageGenerationRequest
): Promise<ImageGenerationResponse> => {
  const res = await fetch('/api/generate/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<ImageGenerationResponse>(res);
};

export const fetchSuggestions = async (
  payload: SuggestionRequestPayload
): Promise<SuggestionResponse> => {
  const res = await fetch('/api/generate/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<SuggestionResponse>(res);
};
