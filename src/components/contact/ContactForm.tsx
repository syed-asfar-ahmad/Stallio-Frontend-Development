import { useState } from 'react';
import { IconSend } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import { MovingBorderButton } from '@/components/ui/moving-border';
import { getApiBase } from '@/lib/api';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/utils';

type ContactFormProps = {
  onSuccess: () => void;
  className?: string;
};

type FieldKey = 'name' | 'email' | 'subject' | 'message';

type FieldDef = {
  key: FieldKey;
  type: 'text' | 'email' | 'textarea';
  placeholderKey: string;
  autoComplete?: string;
  dir?: 'ltr';
  rows?: number;
  half?: boolean;
};

const FIELDS: FieldDef[] = [
  { key: 'name', type: 'text', placeholderKey: 'placeholderName', autoComplete: 'name', half: true },
  {
    key: 'email',
    type: 'email',
    placeholderKey: 'placeholderEmail',
    autoComplete: 'email',
    dir: 'ltr',
    half: true,
  },
  { key: 'subject', type: 'text', placeholderKey: 'placeholderSubject' },
  { key: 'message', type: 'textarea', placeholderKey: 'placeholderMessage', rows: 6 },
];

export function ContactForm({ onSuccess, className }: ContactFormProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [sending, setSending] = useState(false);

  function setField(key: FieldKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!values.name.trim()) next.name = t('contact.form.errors.nameRequired');
    if (!values.email.trim()) next.email = t('contact.form.errors.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = t('contact.form.errors.emailInvalid');
    }
    if (!values.subject.trim()) next.subject = t('contact.form.errors.subjectRequired');
    if (!values.message.trim()) next.message = t('contact.form.errors.messageRequired');
    else if (values.message.trim().length < 10) {
      next.message = t('contact.form.errors.messageMin');
    }
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
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || t('contact.form.errors.sendFailed'));
      }
      setValues({ name: '', email: '', subject: '', message: '' });
      toast.success(t('contact.toastSent'));
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('contact.form.errors.sendFailed'));
    } finally {
      setSending(false);
    }
  }

  const inputBase = cn(
    'border-border/70 bg-background text-foreground placeholder:text-muted-foreground w-full rounded-2xl border px-4 py-3.5 text-sm transition-[border-color,box-shadow,background-color] duration-300',
    'focus:border-brand focus:ring-brand/20 focus:ring-4 focus:outline-none',
    'dark:bg-zinc-950/60',
  );

  function renderField(field: FieldDef) {
    const id = `contact-${field.key}`;
    const err = errors[field.key];
    const errorClass = err
      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
      : '';

    return (
      <div key={field.key} className={field.half ? undefined : 'sm:col-span-2'}>
        <label htmlFor={id} className="text-foreground mb-2 block text-sm font-medium">
          {t(`contact.form.${field.key}`)}
          <span className="text-destructive ms-0.5" aria-hidden>
            *
          </span>
        </label>
        {field.type === 'textarea' ? (
          <textarea
            id={id}
            value={values[field.key]}
            onChange={(e) => setField(field.key, e.target.value)}
            placeholder={t(`contact.form.${field.placeholderKey}`)}
            rows={field.rows ?? 5}
            className={cn(inputBase, 'min-h-[10rem] resize-y', errorClass)}
            aria-invalid={Boolean(err)}
          />
        ) : (
          <input
            id={id}
            type={field.type}
            dir={field.dir}
            autoComplete={field.autoComplete}
            value={values[field.key]}
            onChange={(e) => setField(field.key, e.target.value)}
            placeholder={t(`contact.form.${field.placeholderKey}`)}
            className={cn(inputBase, errorClass)}
            aria-invalid={Boolean(err)}
          />
        )}
        {err ? <p className="text-destructive mt-1.5 text-sm font-medium">{err}</p> : null}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
      }}
    >
      <BezelShell
        className="rounded-[2rem]"
        innerClassName="rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 md:p-10"
      >
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <motion.div variants={fadeUp()}>
            <h2 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
              {t('contact.form.title')}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-[42ch] text-sm leading-6 sm:text-base sm:leading-7">
              {t('contact.form.intro')}
            </p>
          </motion.div>

          <motion.div className="grid gap-5 sm:grid-cols-2" variants={fadeUp()}>
            {FIELDS.map(renderField)}
          </motion.div>

          <motion.div variants={fadeUp()}>
            <MovingBorderButton
              type="submit"
              disabled={sending}
              borderRadius="9999px"
              containerClassName="h-12 w-full disabled:cursor-not-allowed disabled:opacity-65"
              className="w-full active:scale-[0.99]"
            >
              <IconSend className="size-4" stroke={1.5} aria-hidden />
              {sending ? t('contact.form.sending') : t('contact.form.send')}
            </MovingBorderButton>
          </motion.div>
        </form>
      </BezelShell>
    </motion.div>
  );
}
