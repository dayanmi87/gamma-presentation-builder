'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Lang = 'he' | 'en';
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type StepMeta = {
  id: Step;
  title: string;
  desc: string;
  icon: string;
};

const APP_VERSION = '2026-06-26-immersive-ui-v1';

const labels = {
  he: {
    title: 'Gamma Presentation Builder',
    subtitle: 'מערכת פרימיום ליצירת מצגות חכמות עם OpenAI + Gamma + חיפוש אינטרנט + ניתוח קבצים.',
    password: 'סיסמת כניסה',
    enter: 'כניסה לאזור העבודה',
    wrongPassword: 'סיסמה שגויה',
    newPresentation: 'יצירת מצגת חדשה',
    next: 'הבא',
    back: 'חזור',
    generate: 'צור מצגת אוטומטית',
    loading: 'מנתח מקורות, בונה מבנה שקופיות, יוצר prompt ושולח ל-Gamma. פעולה זו יכולה להימשך כמה דקות.',
    result: 'המצגת נוצרה בהצלחה',
    openGamma: 'פתח ב-Gamma',
    exportFile: 'פתח קובץ ייצוא',
    error: 'שגיאה',
    workflowTitle: 'איך זה עובד',
    workflowSubtitle: 'מזינים מידע פעם אחת — והמערכת מטפלת בכל היתר.',
    featureOne: 'איסוף ודיוק מקורות',
    featureTwo: 'סיכום וארגון לוגי',
    featureThree: 'עיצוב והפקה אוטומטיים',
    loginCardTitle: 'כניסה מהירה',
    loginCardSubtitle: 'גישה מהירה למנוע המצגות האישי שלך',
    summary: 'סיכום חכם',
    summarySubtitle: 'תמונת מצב חיה של הפרויקט שלך',
    filesCount: 'קבצים',
    sourceMode: 'מצב מקורות',
    progress: 'התקדמות',
    selected: 'נבחר',
    yourPrompt: 'תקציר ופרומפט שנוצר',
    heroBadge: 'AI Presentation Studio',
    heroKicker: 'Presentation automation',
    statusSecure: 'חיבור מאובטח',
    statusSmart: 'AI orchestration',
    statusFast: 'Gamma delivery',
    summaryBefore: 'סקירה לפני יצירה',
    readyTitle: 'מוכן ליצירה',
    readyDesc: 'בדוק את ההגדרות, לחץ על הכפתור והמערכת תפיק עבורך מצגת מלאה.',
    uploadHint: 'PDF, Word, Excel, PowerPoint, TXT, images',
    noFiles: 'עדיין לא הועלו קבצים',
    authReady: 'מוכן לעבודה',
    generating: 'יוצר מצגת…'
  },
  en: {
    title: 'Gamma Presentation Builder',
    subtitle: 'A premium presentation operating system powered by OpenAI + Gamma + web search + file analysis.',
    password: 'Site password',
    enter: 'Enter workspace',
    wrongPassword: 'Wrong password',
    newPresentation: 'Create new presentation',
    next: 'Next',
    back: 'Back',
    generate: 'Generate automatically',
    loading: 'Analyzing sources, structuring slides, building the prompt and sending it to Gamma. This may take a few minutes.',
    result: 'Presentation created successfully',
    openGamma: 'Open in Gamma',
    exportFile: 'Open export file',
    error: 'Error',
    workflowTitle: 'How it works',
    workflowSubtitle: 'You provide the inputs once — the system handles the rest.',
    featureOne: 'Source collection and grounding',
    featureTwo: 'Summarization and structure',
    featureThree: 'Design and automated production',
    loginCardTitle: 'Quick sign in',
    loginCardSubtitle: 'Fast access to your personal presentation engine',
    summary: 'Smart summary',
    summarySubtitle: 'A live snapshot of your current project',
    filesCount: 'Files',
    sourceMode: 'Source mode',
    progress: 'Progress',
    selected: 'Selected',
    yourPrompt: 'Generated summary and prompt',
    heroBadge: 'AI Presentation Studio',
    heroKicker: 'Presentation automation',
    statusSecure: 'Secure access',
    statusSmart: 'AI orchestration',
    statusFast: 'Gamma delivery',
    summaryBefore: 'Review before generation',
    readyTitle: 'Ready to generate',
    readyDesc: 'Review the setup, click the button, and the system will produce a full presentation for you.',
    uploadHint: 'PDF, Word, Excel, PowerPoint, TXT, images',
    noFiles: 'No files uploaded yet',
    authReady: 'Ready to build',
    generating: 'Generating presentation…'
  }
};

const presentationTypes = [
  ['business', 'עסקית / הנהלה', 'Business / executive'],
  ['training', 'הדרכה / שיעור', 'Training / lesson'],
  ['sales', 'מכירה / שיווק', 'Sales / marketing'],
  ['safety', 'בטיחות / סביבה / רגולציה', 'Safety / environment / regulation'],
  ['project', 'סיכום פרויקט', 'Project summary'],
  ['workplan', 'תוכנית עבודה', 'Work plan'],
  ['school', 'בית ספר / תלמידים', 'School / students'],
  ['conference', 'כנס / הרצאה', 'Conference / lecture'],
  ['pitch', 'Pitch / investors', 'Pitch / investors'],
  ['free', 'חופשי / אחר', 'Free / other']
] as const;

const defaultForm = {
  topic: '',
  objective: '',
  presentationType: 'business',
  audience: '',
  audienceKnowledge: 'medium',
  presentationLanguage: 'he',
  numCards: '10',
  duration: '15',
  textAmount: 'medium',
  structure: 'auto',
  tone: 'professional',
  visualStyle: 'modern, clean, professional',
  designDirection: '',
  dimensions: '16x9',
  imageSource: 'aiGenerated',
  sourceMode: 'hybridSupplement',
  freeText: '',
  urls: '',
  mustInclude: '',
  avoid: '',
  exportAs: 'pptx'
};

function stepsFor(uiLang: Lang): StepMeta[] {
  return [
    { id: 0, icon: '✨', title: uiLang === 'he' ? 'נושא ומטרה' : 'Topic & goal', desc: uiLang === 'he' ? 'מה המצגת צריכה להשיג' : 'What the presentation should accomplish' },
    { id: 1, icon: '🎯', title: uiLang === 'he' ? 'קהל יעד' : 'Audience', desc: uiLang === 'he' ? 'למי המצגת מיועדת' : 'Who the presentation is for' },
    { id: 2, icon: '🧠', title: uiLang === 'he' ? 'תוכן ומבנה' : 'Content', desc: uiLang === 'he' ? 'מה ייכנס פנימה' : 'What content will go inside' },
    { id: 3, icon: '🎨', title: uiLang === 'he' ? 'עיצוב וסגנון' : 'Design', desc: uiLang === 'he' ? 'איך המצגת תיראה' : 'How the presentation should look' },
    { id: 4, icon: '📚', title: uiLang === 'he' ? 'מקורות וקבצים' : 'Sources', desc: uiLang === 'he' ? 'העלאות, קישורים וחיפוש' : 'Uploads, links and search' },
    { id: 5, icon: '⚙️', title: uiLang === 'he' ? 'Gamma וייצוא' : 'Gamma', desc: uiLang === 'he' ? 'הגדרות הפקה וייצוא' : 'Delivery and export settings' },
    { id: 6, icon: '🚀', title: uiLang === 'he' ? 'סיכום' : 'Summary', desc: uiLang === 'he' ? 'בדיקה אחרונה לפני יצירה' : 'Final review before generation' }
  ];
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Home() {
  const [uiLang, setUiLang] = useState<Lang>('he');
  const t = labels[uiLang];
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<Record<string, string>>(defaultForm);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const dir = uiLang === 'he' ? 'rtl' : 'ltr';
  const steps = useMemo(() => stepsFor(uiLang), [uiLang]);
  const progressPercent = Math.round(((step + 1) / steps.length) * 100);
  const currentStepMeta = steps[step];
  const selectedType = presentationTypes.find((item) => item[0] === form.presentationType);
  const filledFields = Object.entries(form).filter(([_, value]) => String(value).trim() !== '').length;

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('sitePassword') : '';
    if (!saved) return;

    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: saved })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          setPassword(saved);
          setAuthenticated(true);
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  function update(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoginError('');
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await response.json();
    if (data.ok) {
      sessionStorage.setItem('sitePassword', password);
      setAuthenticated(true);
    } else {
      setLoginError(t.wrongPassword);
    }
  }

  async function generate() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('form', JSON.stringify(form));
      files.forEach((file) => fd.append('files', file));
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'x-site-password': sessionStorage.getItem('sitePassword') || password },
        body: fd
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Generation failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <main className={cn('min-h-screen overflow-hidden px-5 py-8 md:px-8', dir === 'rtl' ? 'rtl' : 'ltr')} dir={dir}>
        <AmbientBackground />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:pt-8">
          <section className="relative overflow-hidden rounded-[36px] border border-white/50 bg-slate-950 px-7 py-8 text-white shadow-display md:px-10 md:py-10">
            <GlowOrbs />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                {t.heroBadge}
              </div>
              <div className="mt-6 max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-300/80">{t.heroKicker}</p>
                <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  {uiLang === 'he' ? 'בנה מצגות מדויקות, יפות ומהירות יותר.' : 'Build sharper, richer, more beautiful presentations.'}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                  {t.subtitle}
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <StatusPill title={t.statusSecure} subtitle={uiLang === 'he' ? 'גישה בסיסמה' : 'Password protected'} />
                <StatusPill title={t.statusSmart} subtitle={uiLang === 'he' ? 'ניתוח קבצים ומקורות' : 'Source and file analysis'} />
                <StatusPill title={t.statusFast} subtitle={uiLang === 'he' ? 'יצירה ב-Gamma' : 'Gamma generation'} />
              </div>

              <section className="mt-10 grid gap-4 md:grid-cols-3">
                <FeatureCard icon="📎" title={t.featureOne} text={uiLang === 'he' ? 'קבצים, קישורים, חיפוש אינטרנט וטקסט חופשי.' : 'Files, links, web search and free-form text.'} />
                <FeatureCard icon="🧩" title={t.featureTwo} text={uiLang === 'he' ? 'AI מסכם, מסנן ובונה מבנה מצגת חכם.' : 'AI summarizes, filters and builds a smart slide structure.'} />
                <FeatureCard icon="🌈" title={t.featureThree} text={uiLang === 'he' ? 'עיצוב, טון ואורך נשלטים מתוך הממשק.' : 'Design, tone and length are controlled directly from the UI.'} />
              </section>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-display backdrop-blur-xl md:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500" />
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">{t.loginCardTitle}</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{t.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{t.loginCardSubtitle}</p>
              </div>
              <LangSwitch uiLang={uiLang} setUiLang={setUiLang} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MiniInfoCard title="AI" subtitle="OpenAI" />
              <MiniInfoCard title="Slides" subtitle="Gamma" />
              <MiniInfoCard title="Search" subtitle="Web + Files" />
            </div>

            <form className="mt-8 space-y-5" onSubmit={login}>
              <Field label={t.password}>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" />
              </Field>
              {loginError && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{loginError}</p>}
              <button className="btn-primary w-full" type="submit">{t.enter}</button>
            </form>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">{t.workflowTitle}</p>
                  <p className="mt-2 text-sm text-slate-600">{t.workflowSubtitle}</p>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">{t.authReady}</div>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  uiLang === 'he' ? 'מזינים הגדרות וקבצים' : 'Enter preferences and files',
                  uiLang === 'he' ? 'המערכת מסכמת ומבנה את המצגת' : 'The system summarizes and structures the deck',
                  uiLang === 'he' ? 'Gamma מייצר מצגת מלאה' : 'Gamma produces the full presentation'
                ].map((line, idx) => (
                  <div key={line} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">{idx + 1}</span>
                    <span className="text-sm font-semibold text-slate-700">{line}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs font-bold text-slate-400">Version: {APP_VERSION}</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={cn('min-h-screen overflow-hidden px-4 py-4 md:px-6 md:py-6', dir === 'rtl' ? 'rtl' : 'ltr')} dir={dir}>
      <AmbientBackground />
      <div className="mx-auto max-w-7xl">
        <header className="hero-shell mb-6 overflow-hidden rounded-[34px] p-5 md:p-7">
          <GlowOrbs />
          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                {t.newPresentation}
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight text-white md:text-5xl">{t.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <MetricChip value={`${progressPercent}%`} label={t.progress} />
                <MetricChip value={`${filledFields}`} label={uiLang === 'he' ? 'שדות מלאים' : 'Filled fields'} />
                <MetricChip value={`${files.length}`} label={t.filesCount} />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:min-w-[280px]">
              <LangSwitch uiLang={uiLang} setUiLang={setUiLang} dark />
              <div className="rounded-[26px] border border-white/20 bg-white/10 p-4 text-white backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{currentStepMeta.title}</p>
                    <p className="mt-1 text-sm text-slate-200">{currentStepMeta.desc}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">{currentStepMeta.icon}</div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-300">Version: {APP_VERSION}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
          <section className="rounded-[32px] border border-white/60 bg-white/80 p-4 shadow-display backdrop-blur-xl md:p-6">
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((stepItem, index) => {
                const active = step === stepItem.id;
                const complete = step > stepItem.id;
                return (
                  <button
                    key={stepItem.id}
                    onClick={() => setStep(stepItem.id)}
                    className={cn(
                      'group rounded-[24px] border p-4 text-start transition duration-300',
                      active
                        ? 'border-transparent bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 text-white shadow-lg shadow-blue-500/20'
                        : complete
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:-translate-y-0.5'
                          : 'border-slate-200 bg-slate-50/90 text-slate-700 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl text-xl', active ? 'bg-white/10' : complete ? 'bg-emerald-100' : 'bg-white')}>
                        {stepItem.icon}
                      </div>
                      <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-black', active ? 'bg-white/10 text-cyan-200' : complete ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500')}>{index + 1}</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-black">{stepItem.title}</h3>
                      <p className={cn('mt-1 text-xs leading-5', active ? 'text-slate-200' : complete ? 'text-emerald-700' : 'text-slate-500')}>{stepItem.desc}</p>
                    </div>
                  </button>
                );
              })}
            </section>

            <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white">
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">{currentStepMeta.title}</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">{currentStepMeta.icon} {currentStepMeta.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{currentStepMeta.desc}</p>
                </div>
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                  {t.summaryBefore}
                </div>
              </div>

              <div className="p-5 md:p-6">
                {step === 0 && <StepTopic form={form} update={update} uiLang={uiLang} />}
                {step === 1 && <StepAudience form={form} update={update} uiLang={uiLang} />}
                {step === 2 && <StepContent form={form} update={update} uiLang={uiLang} />}
                {step === 3 && <StepDesign form={form} update={update} uiLang={uiLang} />}
                {step === 4 && <StepSources form={form} update={update} uiLang={uiLang} files={files} setFiles={setFiles} uploadHint={t.uploadHint} noFiles={t.noFiles} />}
                {step === 5 && <StepGamma form={form} update={update} uiLang={uiLang} />}
                {step === 6 && <StepSummary form={form} files={files} uiLang={uiLang} />}

                <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-6">
                  <button className="btn-secondary" disabled={step === 0 || loading} onClick={() => setStep((Math.max(0, step - 1) as Step))}>{t.back}</button>
                  {step < 6 ? (
                    <button className="btn-primary" onClick={() => setStep((Math.min(6, step + 1) as Step))}>{t.next}</button>
                  ) : (
                    <button className="btn-primary" disabled={loading || !form.topic} onClick={generate}>{loading ? t.generating : t.generate}</button>
                  )}
                </div>
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/60 bg-white/80 p-5 shadow-display backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">{t.summary}</p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">{t.summarySubtitle}</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-blue-600 text-xl text-white">📌</div>
              </div>

              <div className="mt-5 space-y-3">
                <SummaryLine label={uiLang === 'he' ? 'נושא' : 'Topic'} value={form.topic || '—'} />
                <SummaryLine label={uiLang === 'he' ? 'קהל יעד' : 'Audience'} value={form.audience || '—'} />
                <SummaryLine label={uiLang === 'he' ? 'סוג מצגת' : 'Presentation type'} value={selectedType ? (uiLang === 'he' ? selectedType[1] : selectedType[2]) : '—'} />
                <SummaryLine label={uiLang === 'he' ? 'שפה' : 'Language'} value={form.presentationLanguage === 'he' ? 'עברית' : 'English'} />
                <SummaryLine label={uiLang === 'he' ? 'שקופיות' : 'Slides'} value={form.numCards} />
                <SummaryLine label={t.sourceMode} value={sourceModeText(form.sourceMode, uiLang)} />
                <SummaryLine label={t.filesCount} value={String(files.length)} />
              </div>
            </section>

            <section className="rounded-[30px] border border-white/60 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 p-5 text-white shadow-display">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200/80">{t.progress}</p>
                  <h3 className="mt-2 text-2xl font-black">{progressPercent}%</h3>
                </div>
                <div className="text-4xl">⚡</div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <StatCard value={String(step + 1)} label={uiLang === 'he' ? 'שלב' : 'Step'} />
                <StatCard value={String(filledFields)} label={uiLang === 'he' ? 'שדות' : 'Fields'} />
                <StatCard value={String(files.length)} label={t.filesCount} />
              </div>
            </section>

            <section className="rounded-[30px] border border-white/60 bg-white/80 p-5 shadow-display backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-blue-600 text-xl text-white">🪄</div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">{t.readyTitle}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t.readyDesc}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <TipCard text={uiLang === 'he' ? 'כדאי להגדיר “מה חייב להיכלל” כדי לחדד את תוצאת ה-AI.' : 'Use “Must include” to make the AI output much sharper.'} />
                <TipCard text={uiLang === 'he' ? 'העלה שקופית לדוגמה כדי לשפר התאמת סגנון.' : 'Upload a sample slide to improve style matching.'} />
                <TipCard text={uiLang === 'he' ? 'בחר חיפוש אינטרנט להשלמה כאשר יש לך חומר חלקי בלבד.' : 'Choose supplemental web search when your source material is partial.'} />
              </div>
            </section>
          </aside>
        </div>

        {loading && (
          <section className="mt-6 rounded-[30px] border border-blue-200 bg-white/90 p-5 shadow-display backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="loader-ring" />
              <div>
                <h3 className="text-lg font-black text-blue-800">{t.generating}</h3>
                <p className="mt-1 text-sm text-blue-700">{t.loading}</p>
              </div>
            </div>
          </section>
        )}
        {error && <section className="mt-6 rounded-[30px] border border-red-200 bg-white/90 p-5 shadow-display backdrop-blur-xl"><h2 className="font-black text-red-700">{t.error}</h2><pre className="mt-2 whitespace-pre-wrap text-sm text-red-700">{error}</pre></section>}
        {result && <ResultCard result={result} uiLang={uiLang} />}
      </div>
    </main>
  );
}

function AmbientBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.18),_transparent_22%),radial-gradient(circle_at_50%_80%,_rgba(217,70,239,0.12),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_45%,_#f8fbff_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
    </>
  );
}

function GlowOrbs() {
  return (
    <>
      <div className="pointer-events-none absolute -left-10 top-12 h-32 w-32 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-24 h-36 w-36 rounded-full bg-fuchsia-500/20 blur-3xl" />
    </>
  );
}

function LangSwitch({ uiLang, setUiLang, dark = false }: { uiLang: Lang; setUiLang: (lang: Lang) => void; dark?: boolean }) {
  return (
    <div className={cn('inline-flex rounded-2xl p-1 shadow-sm', dark ? 'bg-white/10 ring-1 ring-white/15 backdrop-blur-md' : 'bg-slate-100')}>
      <button className={cn('rounded-xl px-4 py-2 text-sm font-bold transition', uiLang === 'he' ? dark ? 'bg-white text-slate-950' : 'bg-white text-slate-950 shadow-sm' : dark ? 'text-white/80' : 'text-slate-500')} onClick={() => setUiLang('he')}>עברית</button>
      <button className={cn('rounded-xl px-4 py-2 text-sm font-bold transition', uiLang === 'en' ? dark ? 'bg-white text-slate-950' : 'bg-white text-slate-950 shadow-sm' : dark ? 'text-white/80' : 'text-slate-500')} onClick={() => setUiLang('en')}>English</button>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:-translate-y-1">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">{icon}</div>
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}

function StatusPill({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
      <p className="text-sm font-black">{title}</p>
      <p className="mt-1 text-xs text-slate-300">{subtitle}</p>
    </div>
  );
}

function MiniInfoCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 text-center shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">{title}</div>
      <div className="mt-2 text-sm font-black text-slate-900">{subtitle}</div>
    </div>
  );
}

function MetricChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
      <div className="text-lg font-black text-white">{value}</div>
      <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">{label}</div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-lg font-black text-white">{value}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">{label}</div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value || '—'}</div>
    </div>
  );
}

function TipCard({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm font-semibold leading-6 text-slate-700">{text}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="field-label">{label}</label>{children}</div>;
}

function StepTopic({ form, update, uiLang }: any) {
  return <div className="grid gap-5 md:grid-cols-2">
    <Field label={uiLang === 'he' ? 'נושא המצגת' : 'Presentation topic'}><input className="input" value={form.topic} onChange={(e) => update('topic', e.target.value)} placeholder={uiLang === 'he' ? 'לדוגמה: דרישות אחסון משותף של חומרים מסוכנים' : 'Example: hazardous materials storage requirements'} /></Field>
    <Field label={uiLang === 'he' ? 'סוג מצגת' : 'Presentation type'}><select className="input" value={form.presentationType} onChange={(e) => update('presentationType', e.target.value)}>{presentationTypes.map(([v, he, en]) => <option key={v} value={v}>{uiLang === 'he' ? he : en}</option>)}</select></Field>
    <Field label={uiLang === 'he' ? 'מטרת המצגת' : 'Objective'}><textarea className="input min-h-32" value={form.objective} onChange={(e) => update('objective', e.target.value)} placeholder={uiLang === 'he' ? 'מה אתה רוצה שהקהל יבין, ילמד או יבצע בסוף המצגת?' : 'What should the audience understand, learn or do by the end?'} /></Field>
    <Field label={uiLang === 'he' ? 'מה חייב להיכלל' : 'Must include'}><textarea className="input min-h-32" value={form.mustInclude} onChange={(e) => update('mustInclude', e.target.value)} placeholder={uiLang === 'he' ? 'מסרים, נתונים, נושאים או שקופיות חובה' : 'Required messages, data points or mandatory slides'} /></Field>
  </div>;
}

function StepAudience({ form, update, uiLang }: any) {
  return <div className="grid gap-5 md:grid-cols-2">
    <Field label={uiLang === 'he' ? 'קהל יעד' : 'Target audience'}><input className="input" value={form.audience} onChange={(e) => update('audience', e.target.value)} placeholder={uiLang === 'he' ? 'לדוגמה: הנהלה, עובדים תפעוליים, תלמידים' : 'For example: executives, operators, students'} /></Field>
    <Field label={uiLang === 'he' ? 'רמת ידע של הקהל' : 'Audience knowledge'}><select className="input" value={form.audienceKnowledge} onChange={(e) => update('audienceKnowledge', e.target.value)}><option value="low">Low / בסיסית</option><option value="medium">Medium / בינונית</option><option value="high">High / גבוהה</option><option value="expert">Expert / מומחים</option></select></Field>
    <Field label={uiLang === 'he' ? 'שפת המצגת' : 'Presentation language'}><select className="input" value={form.presentationLanguage} onChange={(e) => update('presentationLanguage', e.target.value)}><option value="he">עברית</option><option value="en">English</option></select></Field>
    <Field label={uiLang === 'he' ? 'טון כתיבה' : 'Tone'}><select className="input" value={form.tone} onChange={(e) => update('tone', e.target.value)}><option value="professional">Professional</option><option value="executive">Executive</option><option value="educational">Educational</option><option value="persuasive">Persuasive</option><option value="simple">Simple</option><option value="formal">Formal</option></select></Field>
  </div>;
}

function StepContent({ form, update, uiLang }: any) {
  return <div className="grid gap-5 md:grid-cols-2">
    <Field label={uiLang === 'he' ? 'מספר שקופיות' : 'Number of slides'}><input className="input" type="number" min="1" max="60" value={form.numCards} onChange={(e) => update('numCards', e.target.value)} /></Field>
    <Field label={uiLang === 'he' ? 'משך הצגה בדקות' : 'Presentation duration'}><input className="input" type="number" min="1" max="180" value={form.duration} onChange={(e) => update('duration', e.target.value)} /></Field>
    <Field label={uiLang === 'he' ? 'כמות מלל' : 'Text amount'}><select className="input" value={form.textAmount} onChange={(e) => update('textAmount', e.target.value)}><option value="brief">קצר / Brief</option><option value="medium">בינוני / Medium</option><option value="detailed">ארוך / Detailed</option><option value="auto">אוטומטי / Auto</option></select></Field>
    <Field label={uiLang === 'he' ? 'מבנה לוגי' : 'Structure'}><select className="input" value={form.structure} onChange={(e) => update('structure', e.target.value)}><option value="auto">Auto</option><option value="problem-solution">Problem → Solution</option><option value="before-after">Before → After</option><option value="training">Training flow</option><option value="executive-summary">Executive summary</option><option value="storytelling">Storytelling</option></select></Field>
    <Field label={uiLang === 'he' ? 'טקסט חופשי / חומר גלם' : 'Free text / raw material'}><textarea className="input min-h-40" value={form.freeText} onChange={(e) => update('freeText', e.target.value)} placeholder={uiLang === 'he' ? 'הדבק כאן טיוטה, עיקרי מסרים, נתונים או מאמרים' : 'Paste draft notes, key messages, data or article excerpts here'} /></Field>
    <Field label={uiLang === 'he' ? 'ממה להימנע' : 'Avoid'}><textarea className="input min-h-40" value={form.avoid} onChange={(e) => update('avoid', e.target.value)} placeholder={uiLang === 'he' ? 'נושאים מיותרים, טון לא רצוי, אורך מוגזם וכו׳' : 'Unwanted topics, undesired tone, too much text, etc.'} /></Field>
  </div>;
}

function StepDesign({ form, update, uiLang }: any) {
  return <div className="grid gap-5 md:grid-cols-2">
    <Field label={uiLang === 'he' ? 'סגנון ויזואלי' : 'Visual style'}><select className="input" value={form.visualStyle} onChange={(e) => update('visualStyle', e.target.value)}><option value="modern, clean, professional">Modern clean</option><option value="corporate blue, minimal, executive">Corporate blue</option><option value="bold, visual, marketing oriented">Bold marketing</option><option value="educational, friendly, simple">Educational simple</option><option value="dark premium, high contrast">Dark premium</option><option value="regulatory, clear, structured">Regulatory structured</option></select></Field>
    <Field label={uiLang === 'he' ? 'יחס שקופית' : 'Dimensions'}><select className="input" value={form.dimensions} onChange={(e) => update('dimensions', e.target.value)}><option value="16x9">16:9</option><option value="4x3">4:3</option><option value="fluid">Fluid</option></select></Field>
    <Field label={uiLang === 'he' ? 'מקור תמונות' : 'Image source'}><select className="input" value={form.imageSource} onChange={(e) => update('imageSource', e.target.value)}><option value="aiGenerated">AI Generated</option><option value="web">Web</option><option value="unsplash">Unsplash</option><option value="none">No images</option></select></Field>
    <Field label={uiLang === 'he' ? 'הנחיות עיצוב נוספות' : 'Additional design direction'}><textarea className="input min-h-32" value={form.designDirection} onChange={(e) => update('designDirection', e.target.value)} placeholder={uiLang === 'he' ? 'צבעי מותג, רמת עומס, סגנון איורים, לוגו, שימוש בגרפים וכו׳' : 'Brand colors, density, illustration style, logo usage, charts, etc.'} /></Field>
  </div>;
}

function StepSources({ form, update, uiLang, files, setFiles, uploadHint, noFiles }: any) {
  return <div className="grid gap-5 md:grid-cols-2">
    <Field label={uiLang === 'he' ? 'מקור מידע לבניית המצגת' : 'Information source mode'}><select className="input" value={form.sourceMode} onChange={(e) => update('sourceMode', e.target.value)}><option value="uploadedOnly">רק מידע שהוזן / הועלה</option><option value="hybridFull">מידע שהוזן + חיפוש אינטרנט</option><option value="webOnly">חיפוש אינטרנט בלבד</option><option value="hybridSupplement">חיפוש אינטרנט להשלמה בלבד</option></select></Field>
    <Field label={uiLang === 'he' ? 'קישורים, כל קישור בשורה' : 'URLs, one per line'}><textarea className="input min-h-32" value={form.urls} onChange={(e) => update('urls', e.target.value)} placeholder={uiLang === 'he' ? 'https://example.com/article\nhttps://example.com/report.pdf' : 'https://example.com/article\nhttps://example.com/report.pdf'} /></Field>
    <div className="md:col-span-2">
      <Field label={uiLang === 'he' ? 'העלאת קבצים' : 'Upload files'}>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[26px] border border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-8 text-center transition hover:border-blue-400 hover:from-blue-100 hover:to-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">📁</div>
          <p className="mt-4 text-base font-black text-slate-900">{uiLang === 'he' ? 'לחץ להעלאת קבצים' : 'Click to upload files'}</p>
          <p className="mt-2 text-sm text-slate-500">{uploadHint}</p>
          <input className="hidden" type="file" multiple accept=".pdf,.docx,.xlsx,.xls,.csv,.pptx,.txt,.md,.png,.jpg,.jpeg" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        </label>
      </Field>
      {files.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {files.map((f: File) => (
            <div key={`${f.name}-${f.size}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="font-bold text-slate-900">{f.name}</div>
              <div className="mt-1 text-xs text-slate-500">{Math.round(f.size / 1024)} KB</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">{noFiles}</div>
      )}
    </div>
  </div>;
}

function StepGamma({ form, update, uiLang }: any) {
  return <div className="grid gap-5 md:grid-cols-2">
    <Field label={uiLang === 'he' ? 'ייצוא' : 'Export'}><select className="input" value={form.exportAs} onChange={(e) => update('exportAs', e.target.value)}><option value="pptx">PPTX</option><option value="pdf">PDF</option><option value="none">ללא ייצוא / None</option></select></Field>
    <div className="rounded-[26px] border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 text-sm text-blue-900">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">🚀</div>
        <div>
          <p className="font-black">Gamma Automation</p>
          <p className="mt-1 leading-6">{uiLang === 'he' ? 'לאחר הלחיצה, האתר ישלח אוטומטית את כל המידע ל-Gamma ויחזיר קישור למצגת מוכנה.' : 'After clicking generate, the site sends everything to Gamma automatically and returns a ready presentation link.'}</p>
        </div>
      </div>
    </div>
  </div>;
}

function StepSummary({ form, files, uiLang }: any) {
  const entries = Object.entries(form).filter(([_, v]) => Boolean(v));
  return <div>
    <div className="rounded-[26px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-5">
      <h2 className="text-2xl font-black text-slate-950">{uiLang === 'he' ? 'סיכום הגדרות' : 'Settings summary'}</h2>
      <p className="mt-2 text-sm text-slate-600">{uiLang === 'he' ? 'כל הנתונים שיישלחו ל-AI ול-Gamma מוצגים כאן.' : 'All inputs that will be sent to the AI and Gamma are shown here.'}</p>
    </div>
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {entries.map(([k, v]) => <div key={k} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"><div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{k}</div><div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{String(v)}</div></div>)}
      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"><div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">files</div><div className="mt-2 text-sm text-slate-800">{files.length}</div></div>
    </div>
  </div>;
}

function ResultCard({ result, uiLang }: { result: any; uiLang: Lang }) {
  const t = labels[uiLang];
  const gamma = result.gamma || {};
  return <section className="mt-6 rounded-[30px] border border-emerald-200 bg-white/90 p-5 shadow-display backdrop-blur-xl">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-black text-emerald-700">{t.result}</h2>
        <p className="mt-2 text-sm text-slate-600">{uiLang === 'he' ? 'הקישורים מוכנים. אפשר לפתוח את המצגת ב-Gamma או את קובץ הייצוא.' : 'Your links are ready. Open the presentation in Gamma or access the exported file.'}</p>
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-2xl text-white">✅</div>
    </div>
    <div className="mt-5 flex flex-wrap gap-3">
      {gamma.gammaUrl && <a className="btn-primary" href={gamma.gammaUrl} target="_blank">{t.openGamma}</a>}
      {gamma.exportUrl && <a className="btn-secondary" href={gamma.exportUrl} target="_blank">{t.exportFile}</a>}
    </div>
    <details className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <summary className="cursor-pointer font-bold text-slate-900">{t.yourPrompt}</summary>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-slate-700">{JSON.stringify(result.plan, null, 2)}</pre>
    </details>
  </section>;
}

function sourceModeText(value: string, uiLang: Lang) {
  const map: Record<string, { he: string; en: string }> = {
    uploadedOnly: { he: 'רק מידע שהוזן / הועלה', en: 'Only entered / uploaded information' },
    hybridFull: { he: 'מידע שהוזן + חיפוש אינטרנט', en: 'Entered info + web search' },
    webOnly: { he: 'חיפוש אינטרנט בלבד', en: 'Web search only' },
    hybridSupplement: { he: 'חיפוש אינטרנט להשלמה בלבד', en: 'Web search for supplementation only' }
  };
  return map[value]?.[uiLang] || value;
}
