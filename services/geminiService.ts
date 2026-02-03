
type ApiResponse = { text?: string; error?: string };

const postJson = async (path: string, payload: Record<string, unknown>): Promise<ApiResponse> => {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as ApiResponse;

  if (!response.ok) {
    const message = data.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};

export const optimizeText = async (text: string, context: string): Promise<string> => {
  try {
    const data = await postJson('/api/optimize', { text, context });
    return data.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text;
  }
};

export const translateToItalian = async (text: string): Promise<string> => {
  try {
    const data = await postJson('/api/translate', { text });
    return data.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text;
  }
};
