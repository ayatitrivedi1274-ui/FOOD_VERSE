import { ChefHat } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-cream-300 bg-cream-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-600 text-cream-50">
            <ChefHat className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold text-ink-900">Food Verse AI</span>
        </div>
        <p className="max-w-xl text-sm text-ink-600">
          This is a preview build. Nutrition figures and assistant replies are demonstration data until the AI
          analysis is connected, so do not use them for medical or dietary decisions.
        </p>
        <p className="text-sm text-ink-500">&copy; {new Date().getFullYear()} Food Verse AI</p>
      </div>
    </footer>
  );
}
