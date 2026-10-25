import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Mail, Phone, MapPin, Clock } from 'lucide-react';
import type { Shop } from '../../../../types';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedFooterAddress } from '../../../../lib/shopContentLanguages';
import { SocialIcon } from '../../../SocialIcons';
import ContactLtrText from '../../../ContactLtrText';
import { readHours } from './NoirHours';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type Props = { shop: Shop; username: string; containerClass: string };

const inputCls =
  'mt-2 block w-full border bg-[var(--theme-surface-secondary)] px-4 py-3 text-sm placeholder:text-[var(--theme-text-muted)] placeholder:opacity-70 focus:outline-none focus:border-[var(--theme-primary)]';
const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.3em]';

export default function NoirContactPage({ shop, username, containerClass }: Props) {
  const { t, lang } = useShopLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const phone = shop.footerPhone?.trim() ?? '';
  const mail = shop.footerEmail?.trim() ?? '';
  const address = getLocalizedFooterAddress(shop, lang).trim();
  const hours = readHours(shop);
  const socials = (shop.footerSocialLinks ?? []).filter((l) => l?.url?.trim());
  const hasInfo = Boolean(phone || mail || address || hours.length > 0 || socials.length > 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/shop/${encodeURIComponent(username)}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('errorContactFailed'));
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <main className={`${containerClass} flex-1 py-24 text-center`}>
        <span className="text-3xl" style={{ color: 'var(--theme-primary)' }}>✦</span>
        <h2
          className="mt-6 text-3xl uppercase tracking-[0.2em]"
          style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
        >
          {t('contactSuccessTitle')}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
          {t('contactSuccessBody', { shopName: shop.shopName })}
        </p>
        <Link
          to={`/${username}`}
          className="mt-10 inline-flex border px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] no-underline"
          style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}
        >
          {t('backToStore')}
        </Link>
      </main>
    );
  }

  const infoRow = 'flex items-start gap-4 border-b py-5 first:pt-0 last:border-b-0 last:pb-0';

  return (
    <main className={`${containerClass} flex-1 pb-20 pt-12 lg:pb-32 lg:pt-20`}>
      <div className="text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.45em]" style={{ color: 'var(--theme-primary)' }}>
          ✦ {shop.shopName}
        </span>
        <h1
          className="mt-5 text-4xl uppercase tracking-[0.15em] lg:text-6xl"
          style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
        >
          {t('contactTitle', { shopName: shop.shopName })}
        </h1>
        <span className="mx-auto mt-8 block h-px w-24" style={{ background: 'var(--theme-primary)' }} />
        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
          {t('contactIntro')}
        </p>
      </div>

      <div
        className={`mx-auto mt-14 grid gap-8 lg:mt-16 lg:gap-10 ${
          hasInfo ? 'max-w-6xl lg:grid-cols-[1.35fr_1fr]' : 'max-w-2xl'
        }`}
      >
        <form
          onSubmit={submit}
          className="space-y-8 border p-8 lg:p-12"
          style={{ borderColor: 'var(--theme-primary)', background: 'var(--theme-surface)' }}
        >
          {error ? (
            <div role="alert" className="border p-3 text-xs" style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}>
              {error}
            </div>
          ) : null}
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="noir-name" className={labelCls} style={{ color: 'var(--theme-primary)' }}>{t('yourName')} *</label>
              <input
                id="noir-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                autoComplete="name"
                className={inputCls}
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
              />
            </div>
            <div>
              <label htmlFor="noir-email" className={labelCls} style={{ color: 'var(--theme-primary)' }}>{t('email')} *</label>
              <input
                id="noir-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className={inputCls}
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
              />
            </div>
          </div>
          <div>
            <label htmlFor="noir-msg" className={labelCls} style={{ color: 'var(--theme-primary)' }}>{t('message')} *</label>
            <textarea
              id="noir-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              placeholder="How can we help you?"
              className={`${inputCls} resize-y`}
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-3 px-9 py-4 text-xs font-semibold uppercase tracking-[0.3em] transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
          >
            <Send className="h-4 w-4" />
            {submitting ? t('sending') : t('sendMessage')}
          </button>
        </form>

        {hasInfo ? (
          <aside
            className="flex flex-col border p-8 lg:p-10"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface-secondary)' }}
          >
            <span className={labelCls} style={{ color: 'var(--theme-primary)' }}>✦ {t('getInTouch')}</span>
            <span className="mt-4 block h-px w-12" style={{ background: 'var(--theme-primary)' }} />

            <div className="mt-8">
              {mail ? (
                <div className={infoRow} style={{ borderColor: 'var(--theme-border)' }}>
                  <Mail className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} style={{ color: 'var(--theme-primary)' }} />
                  <div className="min-w-0">
                    <p className={labelCls} style={{ color: 'var(--theme-text-muted)' }}>{t('email')}</p>
                    <a href={`mailto:${mail}`} className="mt-1.5 block break-all text-sm no-underline hover:underline" style={{ color: 'var(--theme-text-primary)' }}>
                      <ContactLtrText>{mail}</ContactLtrText>
                    </a>
                  </div>
                </div>
              ) : null}

              {phone ? (
                <div className={infoRow} style={{ borderColor: 'var(--theme-border)' }}>
                  <Phone className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} style={{ color: 'var(--theme-primary)' }} />
                  <div className="min-w-0">
                    <p className={labelCls} style={{ color: 'var(--theme-text-muted)' }}>{t('phoneNumber')}</p>
                    <a href={`tel:${phone}`} className="mt-1.5 block text-sm no-underline hover:underline" style={{ color: 'var(--theme-text-primary)' }}>
                      <ContactLtrText>{phone}</ContactLtrText>
                    </a>
                  </div>
                </div>
              ) : null}

              {address ? (
                <div className={infoRow} style={{ borderColor: 'var(--theme-border)' }}>
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} style={{ color: 'var(--theme-primary)' }} />
                  <div className="min-w-0">
                    <p className={labelCls} style={{ color: 'var(--theme-text-muted)' }}>{t('address')}</p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>{address}</p>
                  </div>
                </div>
              ) : null}

              {hours.length > 0 ? (
                <div className={infoRow} style={{ borderColor: 'var(--theme-border)' }}>
                  <Clock className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} style={{ color: 'var(--theme-primary)' }} />
                  <div className="min-w-0 flex-1">
                    <p className={labelCls} style={{ color: 'var(--theme-text-muted)' }}>{t('footerOpeningHours')}</p>
                    <ul className="mt-3 space-y-2 text-[13px]">
                      {hours.map((row) => (
                        <li key={row.day} className="flex justify-between gap-4">
                          <span style={{ color: 'var(--theme-text-primary)' }}>{row.day}</span>
                          <span className="tabular-nums" style={{ color: 'var(--theme-text-secondary)' }}>{row.hours}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            {socials.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-2.5">
                {socials.map((link, index) => (
                  <a
                    key={`${link.platform}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex h-11 w-11 items-center justify-center border transition-colors hover:bg-[var(--theme-primary)] hover:text-[var(--theme-primary-contrast)]"
                    style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </main>
  );
}