import { useState } from 'react';
import { ChefHat, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#analyze', label: 'Analyze' },
  { href: '#assistant', label: 'Assistant' },
  { href: '#recipes', label: 'Recipes' },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300/70 bg-cream-100/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-600 text-cream-50 shadow-card">
            <ChefHat className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold text-ink-900">Food Verse AI</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-leaf-50 hover:text-leaf-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-ink-700 transition-colors hover:bg-leaf-50 md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        hidden={!isOpen}
        className="border-t border-cream-300/70 bg-cream-50 px-4 py-3 md:hidden"
      >
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-semibold text-ink-700 transition-colors hover:bg-leaf-50 hover:text-leaf-700"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
