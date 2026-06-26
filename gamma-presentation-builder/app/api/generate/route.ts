import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractFile } from '@/lib/extractors';
import { buildAnalysisPrompt } from '@/lib/prompts';
import { createGamma, pollGamma } from '@/lib/gamma';
import { fetchUrlText, tavilySearch } from '@/lib/websearch';

export const runtime = 'nodejs';
export const maxDuration = 300;

const APP_VERSION = '2026-06-26-no-temperature-v2';

type AiPlan = {
  sourceSummary: string;
  keyMessages: string[];
  gammaInputText: string;
  gammaAdditionalInstructions: string;
  suggestedTitle: string;
};

function requirePassword(request: Request) {
  const expected = process.env.SITE_PASSWORD || '1233';
  const supplied = request.headers.get('x-site-password');
  if (supplied !== expected) throw new Error('Unauthorized');
}

function safeJsonParse(text: string): AiPlan {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const json = cleaned.slice(start, end + 1);
  return JSON.parse(json);
}

export async function POST(request: Request) {
  try {
    requirePassword(request);
    const formData = await request.formData();
    const rawForm = formData.get('form');
    const form = rawForm ? JSON.parse(String(rawForm)) : {};
    const files = formData.getAll('files').filter((item): item is File => item instanceof File && item.size > 0);

    const extracted = await Promise.all(files.map((file) => extractFile(file)));
    const uploadedContent = extracted
      .map((f) => `--- קובץ: ${f.fileName} (${f.mimeType}, ${Math.round(f.size / 1024)}KB) ---\n${f.extractedText}`)
      .join('\n\n');

    const urls: string[] = String(form.urls || '')
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);
    const urlTexts = await Promise.all(urls.slice(0, 8).map(async (url) => `--- URL: ${url} ---\n${await fetchUrlText(url)}`));
    const urlContent = urlTexts.join('\n\n');

    const sourceMode = String(form.sourceMode || 'hybridSupplement');
    const shouldSearch = sourceMode !== 'uploadedOnly' && Boolean(form.topic);
    const webContent = shouldSearch ? await tavilySearch(`${form.topic}. ${form.objective || ''}. ${form.audience || ''}`) : '';

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || 'gpt-5.5';

    // Important: do not pass temperature/top_p for GPT-5.5.
    // This model only accepts the default sampling parameters.
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'Return valid JSON only. You are a senior presentation strategist and Gamma prompt engineer.' },
        { role: 'user', content: buildAnalysisPrompt({ form, uploadedContent, webContent, urlContent }) }
      ]
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const plan = safeJsonParse(content);

    const exportAsRaw = String(form.exportAs || 'none');
    const exportAs = exportAsRaw === 'pptx' || exportAsRaw === 'pdf' ? exportAsRaw : undefined;
    const language = form.presentationLanguage === 'he' ? 'he' : 'en';
    const textAmount = String(form.textAmount || 'auto') as 'brief' | 'medium' | 'detailed' | 'auto';

    const created = await createGamma({
      inputText: plan.gammaInputText.slice(0, 390000),
      additionalInstructions: plan.gammaAdditionalInstructions.slice(0, 4900),
      textMode: 'generate',
      format: 'presentation',
      numCards: Number(form.numCards || 10),
      cardSplit: 'auto',
      exportAs,
      textOptions: {
        amount: textAmount,
        tone: String(form.tone || 'professional'),
        audience: String(form.audience || ''),
        language
      },
      imageOptions: {
        source: String(form.imageSource || 'aiGenerated') as any,
        style: String(form.visualStyle || 'modern, clean, professional')
      },
      cardOptions: {
        dimensions: String(form.dimensions || '16x9') as any
      }
    });

    const result = await pollGamma(created.generationId);

    return NextResponse.json({
      ok: true,
      version: APP_VERSION,
      plan,
      gamma: result,
      extractedFiles: extracted.map((f) => ({ fileName: f.fileName, mimeType: f.mimeType, size: f.size }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ ok: false, error: message, version: APP_VERSION }, { status });
  }
}
