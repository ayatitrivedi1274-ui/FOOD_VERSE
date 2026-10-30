import { ArrowRight, Flame, MessageCircle, Salad } from 'lucide-react';

const HERO_IMAGE_URL =
  'https://images.pexels.com/photos/6252732/pexels-photo-6252732.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-leaf-200 bg-leaf-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-leaf-700">
            <Salad className="h-4 w-4" aria-hidden="true" />
            Multimodal food intelligence
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-ink-900 sm:text-5xl lg:text-6xl">
            Discover What's on Your Plate
          </h1>
          <p className="mt-6 max-w-xl text-base text-ink-600 sm:text-lg">
            Snap a photo of any meal to explore its estimated calories, macronutrients, and ingredients. Ask follow-up
            questions and get recipe ideas that fit how you eat.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#analyze"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-leaf-600 px-6 py-3.5 text-base font-semibold text-cream-50 shadow-card transition-all hover:-translate-y-0.5 hover:bg-leaf-700 hover:shadow-lift"
            >
              Analyze my meal
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#assistant"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-6 py-3.5 text-base font-semibold text-ink-700 transition-colors hover:border-leaf-300 hover:bg-leaf-50"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Ask the assistant
            </a>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-ink-500">Nutrition</dt>
              <dd className="mt-1 font-semibold text-ink-900">Macros at a glance</dd>
            </div>
            <div>
              <dt className="text-ink-500">Ingredients</dt>
              <dd className="mt-1 font-semibold text-ink-900">Identified visually</dd>
            </div>
            <div>
              <dt className="text-ink-500">Recipes</dt>
              <dd className="mt-1 font-semibold text-ink-900">Matched to you</dd>
            </div>
          </dl>
        </div>

        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-apricot-100 blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[2rem] border border-cream-300 bg-cream-50 p-3 shadow-lift">
            <img
              src={HERO_IMAGE_URL}
              alt="A Mediterranean spread with hummus, chickpeas, lemon, and fresh herbs"
              className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 shadow-card sm:left-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-apricot-100 text-apricot-700">
              <Flame className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-ink-500">Built for everyday meals</p>
              <p className="text-sm font-semibold text-ink-900">Simple, fast, and clear</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
