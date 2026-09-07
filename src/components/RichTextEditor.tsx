import { useRef, useEffect, useState, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Smile,
  ChevronDown,
} from 'lucide-react';
import {
  normalizeShopRichTextHtml,
  normalizeShopRichTextHtmlLight,
  SHOP_RICH_TEXT_BODY_CLASS,
} from '../lib/prepareShopAboutHtml';

function normalizeHtml(html: string, full = false): string {
  const base = (html || '').replace(/<br\s*\/?>/gi, '<br>');
  return full ? normalizeShopRichTextHtml(base) : normalizeShopRichTextHtmlLight(base);
}

const FONT_SIZES = [
  { label: 'Default', value: '' },
  { label: '8', value: '8px' },
  { label: '9', value: '9px' },
  { label: '10', value: '10px' },
  { label: '11', value: '11px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
  { label: '36', value: '36px' },
] as const;

const INNER_RADIUS_TOP = 'rounded-t-[10px]';
const INNER_RADIUS_BOTTOM = 'rounded-b-[10px]';

function FontSizeDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (size: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = FONT_SIZES.find((s) => s.value === value) ?? FONT_SIZES[0];

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={t('dashboard.richTextEditor.fontSize')}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 min-w-[4.25rem] items-center justify-between gap-1 rounded-lg px-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
      >
        <span className="truncate">{selected.label === 'Default' ? t('dashboard.richTextEditor.sizeLabel') : selected.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-stone-500 transition-transform dark:text-zinc-400 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute start-0 top-full z-[200] mt-1 max-h-60 min-w-[5.5rem] overflow-y-auto rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40"
        >
          {FONT_SIZES.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.label} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-200'
                      : 'text-stone-700 hover:bg-stone-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {opt.label === 'Default' ? t('dashboard.richTextEditor.defaultSize') : opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  dir?: 'ltr' | 'rtl';
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  minHeight = '8rem',
  className = '',
  dir = 'ltr',
}: RichTextEditorProps) {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef<string>('');
  const emojiWrapRef = useRef<HTMLDivElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [mobileEmojiUi, setMobileEmojiUi] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  );
  const [emojiPickerWidth, setEmojiPickerWidth] = useState(320);
  const [emojiPickerPos, setEmojiPickerPos] = useState<{ top: number; left: number } | null>(null);
  const [fontSize, setFontSize] = useState('');
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  );

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const v = normalizeHtml(value || '');
    if (v !== normalizeHtml(lastValueRef.current)) {
      el.innerHTML = value || '';
      lastValueRef.current = value || '';
    }
  }, [value]);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setMobileEmojiUi(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const updateEmojiPickerPlacement = useCallback(() => {
    const wrap = emojiWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 24, 320);
    const height = Math.min(Math.round(window.innerHeight * 0.42), 320);
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const showBelow = spaceBelow >= height || spaceBelow >= spaceAbove;
    const top = showBelow
      ? Math.min(rect.bottom + gap, window.innerHeight - height - 12)
      : Math.max(12, rect.top - height - gap);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    setEmojiPickerWidth(width);
    setEmojiPickerPos({ top, left });
  }, []);

  useEffect(() => {
    if (!emojiOpen || !mobileEmojiUi) {
      setEmojiPickerPos(null);
      return;
    }
    const frame = requestAnimationFrame(() => updateEmojiPickerPlacement());
    window.addEventListener('resize', updateEmojiPickerPlacement);
    window.addEventListener('scroll', updateEmojiPickerPlacement, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateEmojiPickerPlacement);
      window.removeEventListener('scroll', updateEmojiPickerPlacement, true);
    };
  }, [emojiOpen, mobileEmojiUi, updateEmojiPickerPlacement]);

  useEffect(() => {
    if (!emojiOpen || mobileEmojiUi) return;
    const onPointerDown = (e: MouseEvent) => {
      if (emojiWrapRef.current && !emojiWrapRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [emojiOpen, mobileEmojiUi]);

  const emitNormalizedHtml = useCallback(
    (full = false) => {
      const el = editorRef.current;
      if (!el) return;
      const normalized = normalizeHtml(el.innerHTML, full);
      if (normalized !== el.innerHTML) {
        el.innerHTML = normalized;
      }
      lastValueRef.current = normalized;
      onChange(normalized);
    },
    [onChange],
  );

  const handleInput = useCallback(() => {
    emitNormalizedHtml(false);
  }, [emitNormalizedHtml]);

  const handleBlur = useCallback(() => {
    emitNormalizedHtml(true);
  }, [emitNormalizedHtml]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const pastedHtml = e.clipboardData.getData('text/html');
      const pastedText = e.clipboardData.getData('text/plain');
      const chunk = pastedHtml
        ? normalizeHtml(pastedHtml, true)
        : pastedText
            .split(/\n{2,}/)
            .map((para) => para.trim())
            .filter(Boolean)
            .map((para) => `<div>${para.replace(/\n/g, '<br>')}</div>`)
            .join('');
      if (!chunk) return;
      document.execCommand('insertHTML', false, chunk);
      emitNormalizedHtml(true);
    },
    [emitNormalizedHtml],
  );

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const applyFontSize = (size: string) => {
    setFontSize(size);
    editorRef.current?.focus();
    if (!size) {
      document.execCommand('removeFormat', false);
      handleInput();
      return;
    }
    document.execCommand('fontSize', false, '7');
    const editor = editorRef.current;
    if (!editor) return;
    editor.querySelectorAll('font[size="7"]').forEach((font) => {
      const span = document.createElement('span');
      span.style.fontSize = size;
      span.innerHTML = font.innerHTML;
      font.replaceWith(span);
    });
    handleInput();
  };

  const insertEmoji = (emojiData: EmojiClickData) => {
    editorRef.current?.focus();
    document.execCommand('insertText', false, emojiData.emoji);
    handleInput();
    setEmojiOpen(false);
  };

  const btnClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-700 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors shrink-0';

  const toolbarGroupClass = 'flex items-center gap-0.5 shrink-0';

  const emojiPickerHeight =
    mobileEmojiUi && typeof window !== 'undefined'
      ? Math.min(Math.round(window.innerHeight * 0.42), 320)
      : 380;

  const emojiPickerNode = (
    <EmojiPicker
      onEmojiClick={insertEmoji}
      theme={isDark ? Theme.DARK : Theme.LIGHT}
      width={emojiPickerWidth}
      height={emojiPickerHeight}
      searchPlaceholder={t('dashboard.richTextEditor.searchEmoji')}
      previewConfig={{ showPreview: false }}
    />
  );

  return (
    <div
      className={`rounded-xl border-2 border-stone-200 dark:border-zinc-700 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 dark:focus-within:ring-brand-500/20 ${className}`}
    >
      <div
        className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 p-2 border-b border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 ${INNER_RADIUS_TOP}`}
      >
        <div className={toolbarGroupClass}>
          <FontSizeDropdown value={fontSize} onChange={applyFontSize} />
        </div>

        <div className={toolbarGroupClass}>
          <button type="button" onClick={() => exec('bold')} className={btnClass} title={t('dashboard.richTextEditor.bold')} aria-label={t('dashboard.richTextEditor.bold')}>
            <Bold className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => exec('italic')} className={btnClass} title={t('dashboard.richTextEditor.italic')} aria-label={t('dashboard.richTextEditor.italic')}>
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            className={btnClass}
            title={t('dashboard.richTextEditor.underline')}
            aria-label={t('dashboard.richTextEditor.underline')}
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        <div className={toolbarGroupClass}>
          <button
            type="button"
            onClick={() => exec('justifyLeft')}
            className={btnClass}
            title={t('dashboard.richTextEditor.alignLeft')}
            aria-label={t('dashboard.richTextEditor.alignLeft')}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            className={btnClass}
            title={t('dashboard.richTextEditor.alignCenter')}
            aria-label={t('dashboard.richTextEditor.alignCenter')}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            className={btnClass}
            title={t('dashboard.richTextEditor.alignRight')}
            aria-label={t('dashboard.richTextEditor.alignRight')}
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyFull')}
            className={btnClass}
            title={t('dashboard.richTextEditor.justify')}
            aria-label={t('dashboard.richTextEditor.justify')}
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        <div className={toolbarGroupClass}>
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            className={btnClass}
            title={t('dashboard.richTextEditor.bulletList')}
            aria-label={t('dashboard.richTextEditor.bulletList')}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            className={btnClass}
            title={t('dashboard.richTextEditor.numberedList')}
            aria-label={t('dashboard.richTextEditor.numberedList')}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className={`relative ${toolbarGroupClass}`} ref={emojiWrapRef}>
          <button
            type="button"
            onClick={() => setEmojiOpen((v) => !v)}
            className={`${btnClass} ${emojiOpen ? 'bg-stone-200 dark:bg-zinc-700 text-stone-900 dark:text-zinc-100' : ''}`}
            title={t('dashboard.richTextEditor.insertEmoji')}
            aria-label={t('dashboard.richTextEditor.insertEmoji')}
            aria-expanded={emojiOpen}
          >
            <Smile className="w-4 h-4" />
          </button>
          {emojiOpen && !mobileEmojiUi ? (
            <div className="absolute start-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-stone-200 shadow-xl dark:border-zinc-700">
              {emojiPickerNode}
            </div>
          ) : null}
        </div>
      </div>

      {emojiOpen && mobileEmojiUi && emojiPickerPos
        ? createPortal(
            <>
              <button
                type="button"
                aria-label={t('dashboard.common.cancel')}
                className="fixed inset-0 z-[200] bg-black/45"
                onClick={() => setEmojiOpen(false)}
              />
              <div
                className="fixed z-[210] overflow-hidden rounded-xl border border-stone-200 shadow-2xl dark:border-zinc-700"
                style={{
                  top: emojiPickerPos.top,
                  left: emojiPickerPos.left,
                  width: emojiPickerWidth,
                  maxHeight: 'min(70vh, 400px)',
                }}
              >
                {emojiPickerNode}
              </div>
            </>,
            document.body,
          )
        : null}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dir={dir}
        onInput={handleInput}
        onBlur={handleBlur}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className={`w-full px-4 py-3 text-start text-stone-900 dark:text-zinc-100 text-base outline-none min-h-[8rem] bg-white dark:bg-zinc-950 ${INNER_RADIUS_BOTTOM} ${SHOP_RICH_TEXT_BODY_CLASS} [&:empty::before]:content-[attr(data-placeholder)] [&:empty::before]:text-stone-400 dark:[&:empty::before]:text-zinc-500`}
        style={{ minHeight }}
      />
    </div>
  );
}
