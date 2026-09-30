import PublicLayout from '@/components/PublicLayout';
import {
  HomeAudience,
  HomeCompare,
  HomeCta,
  HomeDemo,
  HomeHero,
  HomeSteps,
  HomeToolkit,
  HomeWhy,
} from '@/components/home';

export default function Home() {
  return (
    <PublicLayout>
      <HomeHero />
      <HomeAudience />
      <HomeCompare />
      <HomeSteps />
      <HomeDemo />
      <HomeToolkit />
      <HomeWhy />
      <HomeCta />
    </PublicLayout>
  );
}
