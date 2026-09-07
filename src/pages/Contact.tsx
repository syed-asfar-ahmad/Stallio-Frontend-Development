import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, User, MessageSquare, Send, CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import ContactLtrText from '../components/ContactLtrText';
import { getSocialBrandColor, SocialIcon } from '../components/SocialIcons';
import { getApiBase } from '../lib/api';
import { marketingSocialLinks } from '../lib/marketingSocialLinks';

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-brand-600">{children}</p>
  );
}

function SpotlightCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty('--spot-x');
    el.style.removeProperty('--spot-y');
  };
  return (
    <div ref={ref} className={`home-spotlight ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

export default function Contact() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t('contact.form.errors.nameRequired');
    if (!email.trim()) next.email = t('contact.form.errors.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t('contact.form.errors.emailInvalid');
    if (!subject.trim()) next.subject = t('contact.form.errors.subjectRequired');
    if (!message.trim()) next.message = t('contact.form.errors.messageRequired');
    else if (message.trim().length < 10) next.message = t('contact.form.errors.messageMin');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setErrors({});
    try {
      const res = await fetch(`${getApiBase()}/api/marketing/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to send message');
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      toast.success(t('contact.toastSent'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  const inputBase =
    'w-full rounded-xl border px-4 py-3 ps-12 text-stone-800 placeholder-stone-400 transition-all focus:outline-none focus:ring-2 bg-white dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-brand-400 dark:focus:ring-brand-400/25';
  const inputFocus = 'focus:border-brand-500 focus:ring-brand-500/25';
  const inputError = 'border-red-300 focus:border-red-500 focus:ring-red-500/25';
  const inputOk = 'border-stone-200';

  if (submitted) {
    return (
      <PublicLayout>
        <div className="home-marketing min-w-0 w-full overflow-x-clip bg-white">
          <section className="relative isolate overflow-hidden py-12 max-lg:py-12 md:py-32">
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-[min(55%,400px)] w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(91,69,229,0.12),transparent_58%)]"
              aria-hidden
            />
            <div className="relative mx-auto w-full min-w-0 max-w-lg px-4 text-center max-lg:px-4 md:px-5">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-200 bg-brand-50 text-brand-700 shadow-sm sm:mb-6 sm:h-16 sm:w-16">
                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
              </div>
              <h1 className="home-headline text-xl font-extrabold text-stone-900 sm:text-2xl md:text-3xl">{t('contact.success.title')}</h1>
              <p className="mt-3 text-base font-medium leading-relaxed text-stone-600 sm:mt-4 sm:text-lg">
                {t('contact.success.body')}
              </p>
              <p className="mt-4 text-sm font-medium text-stone-500">
                {t('contact.success.hint')}
              </p>
              <div className="marketing-twin-cta-sm">
                <Link
                  to="/"
                  className="home-btn-primary marketing-twin-cta-btn group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-8"
                >
                  <span className="relative z-[2] inline-flex items-center gap-2">
                    {t('contact.success.backHome')}
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                  </span>
                </Link>
                <Link
                  to="/signup"
                  className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-7"
                >
                  {t('contact.success.openShop')}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip bg-white">
        <section className="relative isolate overflow-hidden bg-white text-stone-900">
          <div
            className="pointer-events-none absolute -left-28 top-1/4 h-56 w-56 rounded-full bg-brand-400/14 blur-[80px] animate-blob max-lg:opacity-70 sm:h-72 sm:w-72 sm:blur-[90px] md:h-80 md:w-80 md:blur-[100px] md:opacity-100"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-20 bottom-[15%] h-48 w-48 rounded-full bg-brand-400/12 blur-[70px] animate-blob animate-blob-delayed max-lg:opacity-70 sm:h-64 sm:w-64 sm:blur-[80px] md:h-72 md:w-72 md:blur-[90px] md:opacity-100"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[min(50%,420px)] w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(91,69,229,0.14),transparent_58%)]"
            aria-hidden
          />

          <div className="relative mx-auto w-full min-w-0 max-w-3xl px-4 py-10 text-center max-lg:px-4 sm:py-12 md:px-5 md:py-20">
            <SectionEyebrow>{t('contact.hero.eyebrow')}</SectionEyebrow>
            <h1 className="home-headline mt-4 text-balance text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-stone-900 max-lg:mt-4 sm:mt-5 sm:text-5xl md:text-[3rem]">
              {t('contact.hero.title')}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[0.9375rem] font-medium leading-relaxed text-stone-600 max-lg:mt-4 sm:mt-6 sm:text-base md:text-lg">
              {t('contact.hero.subtitle')}
            </p>
          </div>
        </section>

        <section className="relative border-t border-stone-200/80 bg-stone-50 py-10 max-lg:py-10 md:py-24">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/80 to-transparent" aria-hidden />
          <div className="relative mx-auto w-full min-w-0 max-w-6xl px-4 max-lg:px-4 md:px-5">
            <div className="grid min-w-0 items-start gap-6 max-lg:gap-6 lg:grid-cols-2 lg:gap-10">
              <SpotlightCard className="min-w-0 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm max-lg:rounded-2xl max-lg:p-5 sm:rounded-[1.75rem] md:p-8">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-700">
                  <MessageCircle className="h-6 w-6" aria-hidden />
                </div>
                <h2 className="text-xl font-extrabold text-stone-900">{t('contact.info.title')}</h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-stone-600">
                  {t('contact.info.body')}
                </p>
                <div className="mt-8 space-y-3">
                  <a
                    href="mailto:contact@stallio.shop"
                    className="group flex items-center gap-3 rounded-xl border border-stone-200/90 bg-stone-50/50 p-3 no-underline transition-all duration-300 hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-700 transition-colors group-hover:border-brand-200 group-hover:bg-white">
                      <Mail className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold text-stone-800 transition-colors group-hover:text-brand-900">
                      <ContactLtrText>contact@stallio.shop</ContactLtrText>
                    </span>
                  </a>
                </div>
                <div className="mt-8 border-t border-stone-200/80 pt-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('contact.info.social')}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {marketingSocialLinks.map((link, index) => (
                      <a
                        key={`${link.platform}-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 no-underline shadow-sm transition-all duration-300 hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-900 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-brand-500/50 dark:hover:bg-zinc-700 dark:hover:text-brand-100"
                        aria-label={link.platform}
                      >
                        <span style={{ color: getSocialBrandColor(link.platform) }}>
                          <SocialIcon platform={link.platform} size={18} />
                        </span>
                        <span>{link.platform === 'twitter' ? 'X' : link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </SpotlightCard>

              <SpotlightCard className="min-w-0 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm max-lg:rounded-2xl max-lg:p-5 sm:rounded-[1.75rem] md:p-10 lg:p-11">
                <h2 className="text-xl font-extrabold text-stone-900 md:text-2xl">{t('contact.form.title')}</h2>
                <p className="mt-2 text-sm font-medium text-stone-600">
                  {t('contact.form.intro')}
                </p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-stone-700">
                      {t('contact.form.name')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-400" aria-hidden />
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setErrors((p) => ({ ...p, name: '' }));
                        }}
                        placeholder={t('contact.form.placeholderName')}
                        className={`${inputBase} ${inputFocus} ${errors.name ? inputError : inputOk}`}
                      />
                    </div>
                    {errors.name && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-stone-700">
                      {t('contact.form.email')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-400" aria-hidden />
                      <input
                        id="contact-email"
                        type="email"
                        dir="ltr"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((p) => ({ ...p, email: '' }));
                        }}
                        placeholder="you@example.com"
                        className={`${inputBase} ${inputFocus} ${errors.email ? inputError : inputOk}`}
                      />
                    </div>
                    {errors.email && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="mb-2 block text-sm font-semibold text-stone-700">
                      {t('contact.form.subject')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-400" aria-hidden />
                      <input
                        id="contact-subject"
                        type="text"
                        value={subject}
                        onChange={(e) => {
                          setSubject(e.target.value);
                          setErrors((p) => ({ ...p, subject: '' }));
                        }}
                        placeholder={t('contact.form.placeholderSubject')}
                        className={`${inputBase} ${inputFocus} ${errors.subject ? inputError : inputOk}`}
                      />
                    </div>
                    {errors.subject && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.subject}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-stone-700">
                      {t('contact.form.message')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageCircle className="pointer-events-none absolute start-4 top-[0.875rem] h-5 w-5 text-stone-400 dark:text-zinc-400" aria-hidden />
                      <textarea
                        id="contact-message"
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          setErrors((p) => ({ ...p, message: '' }));
                        }}
                        placeholder={t('contact.form.placeholderMessage')}
                        rows={5}
                        className={`${inputBase} resize-none pt-3 ${inputFocus} ${errors.message ? inputError : inputOk}`}
                      />
                    </div>
                    {errors.message && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="home-btn-primary group relative mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-4 text-base font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    <span className="relative z-[2] inline-flex items-center justify-center gap-2">
                      <Send className="h-5 w-5 shrink-0" aria-hidden />
                      {sending ? t('contact.form.sending') : t('contact.form.send')}
                    </span>
                  </button>
                </form>
              </SpotlightCard>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200/80 bg-white py-10 max-lg:py-10 md:py-16 dark:border-zinc-700 dark:bg-zinc-950">
          <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col items-center justify-between gap-6 px-4 text-center max-lg:px-4 md:flex-row md:items-center md:gap-8 md:px-5 md:text-start">
            <div className="min-w-0 md:max-w-md md:flex-1">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                {t('contact.strip.eyebrow')}
              </p>
              <p className="mt-2 text-lg font-semibold text-stone-900 dark:text-zinc-100">{t('contact.strip.title')}</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-stone-600 dark:text-zinc-300">
                {t('contact.strip.body')}
              </p>
            </div>
            <div className="flex w-full max-w-sm shrink-0 flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-nowrap sm:items-center sm:justify-center md:w-auto md:justify-end">
              <Link
                to="/how-it-works"
                className="home-btn-secondary inline-flex w-full items-center justify-center whitespace-nowrap rounded-2xl px-6 py-3.5 text-sm font-bold text-stone-800 no-underline sm:w-auto"
              >
                {t('contact.strip.howItWorks')}
              </Link>
              <Link
                to="/features"
                className="home-btn-primary group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-3.5 text-sm font-bold text-white no-underline sm:w-auto"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  {t('contact.strip.features')}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
