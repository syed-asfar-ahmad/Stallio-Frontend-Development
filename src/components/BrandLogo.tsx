type Props = { className?: string };

export default function BrandLogo({ className = '' }: Props) {
  return (
    <img
      src="/assets/logo.png"
      alt="Stallio"
      className={`w-auto object-contain ${className}`}
    />
  );
}
