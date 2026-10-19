import { useState } from 'react';
import { IconMail, IconMessage, IconSend, IconUser, type Icon } from '@tabler/icons-react';
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
};

type FieldKey = 'name' | 'email' | 'subject' | 'message';

const FIELDS: {
  key: FieldKey;
  icon: Icon;
  type: 'text' | 'email' | 'textarea';
  placeholderKey: string;
  dir?: 'ltr';
}[] = [
  { key: 'name', icon: IconUser, type: 'text', placeholderKey: 'placeholderName' },
  { key: 'email', icon: IconMail, type: 'email', placeholderKey: 'placeholderEmail', dir: 'ltr' },
  { key: 'subject', icon: IconMessage, type: 'text', placeholderKey: 'placeholderSubject' },
  { key: 'message', icon: IconMessage, type: 'textarea', placeholderKey: 'placeholderMessage' },
];

export function ContactForm({ onSuccess }: ContactFormProps) {
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
        throw new Error((data as { error?: string }).error || 'Failed to send message');
      }
      setValues({ name: '', email: '', subject: '', message: '' });
      toast.success(t('contact.toastSent'));
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  const inputBase = cn(
    'border-border/70 bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border px-4 py-3 ps-12 text-sm transition-[border-color,box-shadow] duration-300',
    'focus:border-brand focus:ring-brand/25 focus:ring-2 focus:outline-none',
    'dark:bg-zinc-900',
  );

  return (
    <motion.div
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.1 } },
      }}
    >
      <BezelShell className="rounded-2xl" innerClassName="rounded-[calc(1rem-0.375rem)] p-6 sm:p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <motion.div variants={fadeUp()}>
            <h2 className="text-foreground text-lg font-semibold md:text-xl">{t('contact.form.title')}</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">{t('contact.form.intro')}</p>
          </motion.div>

          <motion.div className="space-y-5" variants={fadeUp()}>
            {FIELDS.map((field) => {
              const FieldIcon = field.icon;
              const id = `contact-${field.key}`;
              const err = errors[field.key];
              const errorClass = err
                ? 'border-destructive focus:border-destructive focus:ring-destructive/25'
                : '';

              return (
                <div key={field.key}>
                  <label htmlFor={id} className="text-foreground mb-2 block text-sm font-medium">
                    {t(`contact.form.${field.key}`)} <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <FieldIcon
                      className={cn(
                        'text-muted-foreground pointer-events-none absolute start-4 size-5',
                        field.type === 'textarea' ? 'top-[0.875rem]' : 'top-1/2 -translate-y-1/2',
                      )}
                      stroke={1.5}
                      aria-hidden
                    />
                    {field.type === 'textarea' ? (
                      <textarea
                        id={id}
                        value={values[field.key]}
                        onChange={(e) => setField(field.key, e.target.value)}
                        placeholder={t(`contact.form.${field.placeholderKey}`)}
                        rows={5}
                        className={cn(inputBase, 'resize-none pt-3', errorClass)}
                        aria-invalid={Boolean(err)}
                      />
                    ) : (
                      <input
                        id={id}
                        type={field.type}
                        dir={field.dir}
                        value={values[field.key]}
                        onChange={(e) => setField(field.key, e.target.value)}
                        placeholder={t(`contact.form.${field.placeholderKey}`)}
                        className={cn(inputBase, errorClass)}
                        aria-invalid={Boolean(err)}
                      />
                    )}
                  </div>
                  {err ? <p className="text-destructive mt-1.5 text-sm font-medium">{err}</p> : null}
                </div>
              );
            })}
          </motion.div>

          <motion.div variants={fadeUp()}>
            <MovingBorderButton
              type="submit"
              disabled={sending}
              borderRadius="9999px"
              containerClassName="h-12 w-full disabled:cursor-not-allowed disabled:opacity-65"
              className="w-full"
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
