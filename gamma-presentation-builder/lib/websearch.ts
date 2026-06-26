export async function tavilySearch(query: string) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || !query.trim()) return '';

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query,
      search_depth: 'advanced',
      include_answer: true,
      include_raw_content: false,
      max_results: 6
    })
  });

  if (!response.ok) return `שגיאת חיפוש Tavily: ${response.status}`;
  const data = await response.json();
  const results = (data.results || [])
    .map((r: any, i: number) => `${i + 1}. ${r.title}\n${r.url}\n${r.content}`)
    .join('\n\n');
  return `תשובה מסכמת: ${data.answer || ''}\n\nמקורות:\n${results}`.slice(0, 80000);
}

export async function fetchUrlText(url: string) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 PresentationBuilder/1.0' } });
    if (!response.ok) return `לא ניתן לקרוא קישור ${url}: ${response.status}`;
    const html = await response.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 50000);
  } catch (error) {
    return `שגיאה בקריאת קישור ${url}: ${(error as Error).message}`;
  }
}
