import { Clock, Flame, Dumbbell, SearchX } from 'lucide-react';
import { DIETARY_OPTIONS } from '@/data/dietaryOptions';
import { RECIPES } from '@/data/recipes';
import type { DietaryPreference, Recipe } from '@/types/food';

interface RecipeRecommendationsProps {
  preferences: DietaryPreference[];
  onClearPreferences: () => void;
}

function matchesPreferences(recipe: Recipe, preferences: DietaryPreference[]) {
  return preferences.every((preference) => recipe.tags.includes(preference));
}

export default function RecipeRecommendations({ preferences, onClearPreferences }: RecipeRecommendationsProps) {
  const recipes = RECIPES.filter((recipe) => matchesPreferences(recipe, preferences));
  const labelFor = (id: DietaryPreference) => DIETARY_OPTIONS.find((option) => option.id === id)?.label ?? id;

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-cream-300 bg-cream-50 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200 text-ink-700">
          <SearchX className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="text-xl font-semibold text-ink-900">No recipes match every preference yet</h3>
        <p className="max-w-sm text-sm text-ink-600">Try removing one of your selected preferences to see more ideas.</p>
        <button
          type="button"
          onClick={onClearPreferences}
          className="mt-1 rounded-full border border-leaf-300 px-5 py-2 text-sm font-semibold text-leaf-800 transition-colors hover:bg-leaf-50"
        >
          Clear preferences
        </button>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {recipes.map((recipe) => (
        <li
          key={recipe.id}
          className="group flex flex-col overflow-hidden rounded-3xl border border-cream-300 bg-cream-50 shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
        >
          <div className="relative overflow-hidden">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-xs font-semibold text-leaf-800">
                  {labelFor(tag)}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-semibold text-ink-900">{recipe.title}</h3>
            <p className="text-sm text-ink-600">{recipe.description}</p>
            <dl className="mt-auto flex items-center gap-4 border-t border-cream-300 pt-4 text-xs font-semibold text-ink-700">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-ink-500" aria-hidden="true" />
                <dt className="sr-only">Prep time</dt>
                <dd>{recipe.prepMinutes} min</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-apricot-500" aria-hidden="true" />
                <dt className="sr-only">Calories</dt>
                <dd>{recipe.calories} kcal</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4 text-lake-500" aria-hidden="true" />
                <dt className="sr-only">Protein</dt>
                <dd>{recipe.proteinG} g protein</dd>
              </div>
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}
