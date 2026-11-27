import PublicLayout from '@/components/PublicLayout';
import {
  HowChannels,
  HowCta,
  HowFlow,
  HowHero,
  HowLive,
  HowSteps,
} from '@/components/how-it-works';

export default function HowItWorks() {
  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <HowHero />
        <HowFlow />
        <HowSteps />
        <HowChannels />
        <HowLive />
        <HowCta />
      </div>
    </PublicLayout>
  );
}
