import PublicLayout from '@/components/PublicLayout';
import {
  AboutCta,
  AboutHero,
  AboutMission,
  AboutPillars,
  AboutPromise,
  AboutValues,
} from '@/components/about';

export default function About() {
  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <AboutHero />
        <AboutMission />
        <AboutPillars />
        <AboutValues />
        <AboutPromise />
        <AboutCta />
      </div>
    </PublicLayout>
  );
}
