export type PresentationForm = Record<string, string | string[] | boolean | undefined>;

export function buildAnalysisPrompt(params: {
  form: PresentationForm;
  uploadedContent: string;
  webContent: string;
  urlContent: string;
}) {
  const { form, uploadedContent, webContent, urlContent } = params;
  return `
אתה מומחה בכיר לבניית מצגות Gamma.
עליך לנתח את כל המידע, לסכם אותו רק לרמת הפירוט הנדרשת למצגת, ואז לבנות הוראות מדויקות ל-Gamma.

הגדרות המשתמש:
${JSON.stringify(form, null, 2)}

חומר מקבצים שהועלו:
${uploadedContent || 'לא הועלו קבצים / לא חולץ תוכן.'}

חומר מקישורים שהוזנו:
${urlContent || 'לא הוזנו קישורים / לא חולץ תוכן.'}

חומר מחיפוש אינטרנט:
${webContent || 'לא בוצע חיפוש אינטרנט / לא נמצאו תוצאות.'}

הפק JSON תקין בלבד, ללא Markdown, במבנה הבא:
{
  "sourceSummary": "תקציר ממוקד של המידע ששימש לבניית המצגת",
  "keyMessages": ["מסר מרכזי 1", "מסר מרכזי 2"],
  "gammaInputText": "טקסט מפורט שיישלח ל-Gamma כ-inputText. כלול מבנה שקופיות ברור עם כותרת, תוכן עיקרי, הצעה לוויזואל, ודגש עיצובי לכל שקופית.",
  "gammaAdditionalInstructions": "הוראות קצרות ומדויקות ל-Gamma עד 5000 תווים: טון, שפה, עיצוב, רמת מלל, קהל יעד, מה להדגיש וממה להימנע.",
  "suggestedTitle": "כותרת מצגת מוצעת"
}

כללים:
- אם המשתמש ביקש מצגת בעברית, כתוב את כל תוכן המצגת בעברית.
- אם המשתמש ביקש מצגת באנגלית, כתוב באנגלית.
- אל תמציא נתונים מספריים אם אין מקור.
- אם החומר חסר, בנה מצגת כללית אבל ציין בתוכן שלא נמסרו נתוני מקור ספציפיים.
- בנה פלט שמתאים ישירות ל-Gamma.
`;
}
