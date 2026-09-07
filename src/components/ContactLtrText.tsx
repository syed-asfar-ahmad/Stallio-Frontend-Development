import type { ReactNode } from 'react';

export default function ContactLtrText({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <span dir="ltr" className={`inline-block [unicode-bidi:isolate] tabular-nums${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  );
}
