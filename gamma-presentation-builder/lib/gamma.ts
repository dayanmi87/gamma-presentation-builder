export type GammaCreatePayload = {
  inputText: string;
  additionalInstructions?: string;
  textMode: 'generate' | 'condense' | 'preserve';
  format: 'presentation';
  numCards?: number;
  cardSplit?: 'auto' | 'inputTextBreaks';
  exportAs?: 'pptx' | 'pdf';
  textOptions?: {
    amount?: 'brief' | 'medium' | 'detailed' | 'auto';
    tone?: string;
    audience?: string;
    language?: string;
  };
  imageOptions?: {
    source?: 'aiGenerated' | 'web' | 'unsplash' | 'none';
    style?: string;
    model?: string;
  };
  cardOptions?: {
    dimensions?: '16x9' | '4x3' | 'fluid';
  };
};

export async function createGamma(payload: GammaCreatePayload) {
  const apiKey = process.env.GAMMA_API_KEY;
  if (!apiKey) throw new Error('Missing GAMMA_API_KEY');

  const response = await fetch('https://public-api.gamma.app/v1.0/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Gamma create failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return data as { generationId: string; warnings?: string };
}

export async function pollGamma(generationId: string) {
  const apiKey = process.env.GAMMA_API_KEY;
  if (!apiKey) throw new Error('Missing GAMMA_API_KEY');

  for (let i = 0; i < 60; i++) {
    const response = await fetch(`https://public-api.gamma.app/v1.0/generations/${generationId}`, {
      headers: { 'X-API-KEY': apiKey }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Gamma polling failed: ${response.status} ${JSON.stringify(data)}`);
    if (data.status === 'completed' || data.status === 'failed') return data;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error('Gamma polling timed out');
}
