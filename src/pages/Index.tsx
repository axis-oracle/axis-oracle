import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/sections/HeroSection';
import { ModulesSection } from '@/components/sections/ModulesSection';
import { MyFeedsSection } from '@/components/sections/MyFeedsSection';
import { AllFeedsSection } from '@/components/sections/AllFeedsSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ModulesSection />
      <MyFeedsSection />
      <AllFeedsSection />
    </Layout>
  );
};

export default Index;
