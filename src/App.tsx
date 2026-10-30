import { useCallback, useState } from 'react';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import DietaryPreferences from '@/components/DietaryPreferences';
import FoodAssistant from '@/components/FoodAssistant';
import FoodUploader from '@/components/FoodUploader';
import HeroSection from '@/components/HeroSection';
import RecipeRecommendations from '@/components/RecipeRecommendations';
import SectionHeading from '@/components/SectionHeading';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { useFoodAnalysis } from '@/hooks/useFoodAnalysis';
import type { DietaryPreference } from '@/types/food';

function App() {
  const { state, analyze, showDemo } = useFoodAnalysis();
  const [preferences, setPreferences] = useState<DietaryPreference[]>([]);

  const togglePreference = useCallback((preference: DietaryPreference) => {
    setPreferences((current) =>
      current.includes(preference) ? current.filter((item) => item !== preference) : [...current, preference]
    );
  }, []);

  const clearPreferences = useCallback(() => setPreferences([]), []);

  const analysis = state.status === 'ready' ? state.analysis : null;
  const resultKey = state.status === 'ready' ? state.resultId : 0;

  return (
    <div className="min-h-screen bg-cream-100">
      <SiteHeader />

      <main>
        <HeroSection />

        <section id="analyze" className="scroll-mt-20 border-t border-cream-300/70 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Step 1"
              title="Analyze your plate"
              description="Upload a photo, then review the identified meal, its estimated nutrition, and its ingredients."
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <FoodUploader isAnalyzing={state.status === 'loading'} onAnalyze={analyze} />
              <AnalysisDashboard state={state} onShowDemo={showDemo} />
            </div>
          </div>
        </section>

        <section id="assistant" className="scroll-mt-20 border-t border-cream-300/70 bg-cream-200/50 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Step 2"
              title="Ask about your meal"
              description="Curious about portions, protein, or a healthier swap? Ask the food assistant."
            />
            <div className="mt-10 max-w-3xl">
              <FoodAssistant key={resultKey} analysis={analysis} />
            </div>
          </div>
        </section>

        <section id="recipes" className="scroll-mt-20 border-t border-cream-300/70 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Step 3"
              title="Recipes made for you"
              description="Choose how you eat and discover recipe ideas that fit."
            />
            <div className="mt-10 space-y-10">
              <DietaryPreferences selected={preferences} onToggle={togglePreference} />
              <RecipeRecommendations preferences={preferences} onClearPreferences={clearPreferences} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default App;
