type Props = { className?: string };

export default function BrandLogo({ className = '' }: Props) {
  return (
    <img
      src="/assets/logo.png"
      alt="Stallio"
      className={`h-[7.5rem] w-auto object-contain ${className}`}
    />
  );
}
