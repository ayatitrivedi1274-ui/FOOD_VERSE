import { Check } from 'lucide-react';
import { DIETARY_OPTIONS } from '@/data/dietaryOptions';
import type { DietaryPreference } from '@/types/food';

interface DietaryPreferencesProps {
  selected: DietaryPreference[];
  onToggle: (preference: DietaryPreference) => void;
}

export default function DietaryPreferences({ selected, onToggle }: DietaryPreferencesProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-ink-900">Your dietary preferences</h3>
      <p className="mt-1 text-sm text-ink-600">Pick any that apply. Recipes below update to match.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DIETARY_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.id);
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option.id)}
              className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                isSelected
                  ? 'border-leaf-500 bg-leaf-50 shadow-card'
                  : 'border-cream-300 bg-cream-50 hover:-translate-y-0.5 hover:border-leaf-300'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isSelected ? 'bg-leaf-600 text-cream-50' : 'bg-cream-200 text-ink-700 group-hover:bg-leaf-100'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-900">{option.label}</span>
                <span className="block text-xs text-ink-500">{option.description}</span>
              </span>
              {isSelected && <Check className="h-5 w-5 shrink-0 text-leaf-700" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
