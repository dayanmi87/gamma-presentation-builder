# Gamma Presentation Builder

אתר אישי ליצירת מצגות אוטומטיות באמצעות:

- Next.js + TypeScript
- OpenAI API
- Gamma API
- Tavily API
- העלאת קבצי PDF / Word / Excel / PPTX / TXT / תמונות
- חיפוש אינטרנט אופציונלי
- סיסמת כניסה פשוטה

## הרצה מקומית

```bash
npm install
cp .env.example .env.local
npm run dev
```

פתח:

```txt
http://localhost:3000
```

## משתני סביבה

```env
OPENAI_API_KEY=sk-proj-xxxxxxxx
GAMMA_API_KEY=xxxxxxxx
TAVILY_API_KEY=tvly-dev-xxxxxxxx
SITE_PASSWORD=1233
OPENAI_MODEL=gpt-5.5
```

## פריסה ל-Render

1. העלה את התיקייה ל-GitHub.
2. ב-Render צור Web Service חדש.
3. חבר את הריפוזיטורי.
4. הגדר:

```txt
Build Command: npm install && npm run build
Start Command: npm start
```

5. הוסף Environment Variables:

```env
OPENAI_API_KEY=...
GAMMA_API_KEY=...
TAVILY_API_KEY=...
SITE_PASSWORD=1233
OPENAI_MODEL=gpt-5.5
```

## הערות

- אין שמירת היסטוריה בשלב זה, לפי החלטת המשתמש.
- קבצים משמשים לעיבוד בזמן יצירה בלבד.
- Gamma מחזירה `gammaUrl` ו-`exportUrl` אם נבחר PDF/PPTX.
- אם קישור לא פתוח לציבור, האתר לא יוכל לקרוא אותו.
