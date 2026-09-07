type Props = { size?: 'sm' | 'md' };

export default function AdminBrandMark({ size = 'sm' }: Props) {
  const box = size === 'md' ? 'h-12 w-12' : 'h-10 w-10';
  const img = size === 'md' ? 'h-8 w-8' : 'h-7 w-7';
  return (
    <span
      className={`flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800`}
    >
      <img src="/assets/logo.png" alt="Stallio" className={`${img} object-contain`} />
    </span>
  );
}
