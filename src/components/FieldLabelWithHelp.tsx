import type { ReactNode } from 'react';
import FieldHelpButton from './FieldHelpButton';

type HelpAlign = 'start' | 'end';

type LabelProps = {
  children: ReactNode;
  help?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  labelClassName?: string;
  align?: HelpAlign;
};

export function FieldLabelWithHelp({
  children,
  help,
  required,
  htmlFor,
  className = 'mb-2',
  labelClassName = 'text-sm font-semibold text-stone-800 dark:text-zinc-200',
  align,
}: LabelProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className={labelClassName}>
        {children}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {help ? <FieldHelpButton text={help} align={align} /> : null}
    </div>
  );
}

type TitleProps = {
  title: ReactNode;
  help?: string;
  className?: string;
  titleClassName?: string;
  align?: HelpAlign;
};

export function FieldTitleWithHelp({
  title,
  help,
  className,
  titleClassName = 'font-semibold text-stone-800 dark:text-zinc-200 text-sm',
  align,
}: TitleProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className ?? ''}`}>
      <span className={titleClassName}>{title}</span>
      {help ? <FieldHelpButton text={help} align={align} /> : null}
    </div>
  );
}
