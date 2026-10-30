import { AlertCircle, BarChart3, Flame, Info, Lightbulb, Ruler, ScanSearch, Sparkles, TriangleAlert } from 'lucide-react';
import type { AnalysisState } from '@/hooks/useFoodAnalysis';
import type { AnalysisResult, FoodAnalysis } from '@/types/food';
import type { FunctionErrorCode } from '@/lib/edgeFunctions';

interface AnalysisDashboardProps {
  state: AnalysisState;
  onShowDemo: () => void;
}

export default function AnalysisDashboard({ state, onShowDemo }: AnalysisDashboardProps) {
  return (
    <section
      aria-live="polite"
      aria-label="Analysis results"
      className="flex h-full flex-col rounded-3xl border border-cream-300 bg-cream-50 p-5 shadow-card sm:p-6"
    >
      {state.status === 'idle' && <IdleState onShowDemo={onShowDemo} />}
      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && <ErrorState code={state.code} message={state.message} />}
      {state.status === 'ready' && <ResultState analysis={state.analysis} />}
    </section>
  );
}

function IdleState({ onShowDemo }: { onShowDemo: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
        <BarChart3 className="h-8 w-8" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-2xl font-semibold text-ink-900">Your nutrition breakdown</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600">
          Upload a meal photo and press Analyze Food to see the foods it contains, estimated nutrition, and ingredients
          here.
        </p>
      </div>
      <button
        type="button"
        onClick={onShowDemo}
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-leaf-300 bg-leaf-50 px-5 py-2.5 text-sm font-semibold text-leaf-800 transition-colors hover:bg-leaf-100"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Preview the layout with demo data
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 flex-col gap-5" role="status">
      <p className="text-sm font-semibold text-leaf-700">Identifying foods and estimating nutrition...</p>
      <div className="skeleton h-8 w-2/3 rounded-xl" />
      <div className="skeleton h-4 w-full rounded-lg" />
      <div className="skeleton h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-24 rounded-2xl" />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="skeleton h-8 w-24 rounded-full" />
        <div className="skeleton h-8 w-32 rounded-full" />
        <div className="skeleton h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

const ERROR_TITLES: Record<FunctionErrorCode, string> = {
  missing_key: 'Analysis is not set up yet',
  invalid_key: 'The AI key needs attention',
  quota_exceeded: 'Free AI quota reached',
  invalid_file: 'This photo cannot be analyzed',
  invalid_input: 'Request not accepted',
  network: 'Connection problem',
  server_error: 'Analysis failed',
  timeout: 'The AI took too long',
};

function ErrorState({ code, message }: { code: FunctionErrorCode; message: string }) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-berry-50 text-berry-700">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-semibold text-ink-900">{ERROR_TITLES[code]}</h2>
      <p className="max-w-sm text-sm text-ink-600">{message}</p>
    </div>
  );
}

function EmptyState({ result }: { result: AnalysisResult }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
        <ScanSearch className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-semibold text-ink-900">No food identified</h2>
      <p className="max-w-sm text-sm text-ink-600">
        The model could not find food in this photo. Try a closer, well-lit, top-down photo of a meal.
      </p>
      {result.uncertainty_notes.length > 0 && <NoteList notes={result.uncertainty_notes} />}
    </div>
  );
}

function ResultState({ analysis }: { analysis: FoodAnalysis }) {
  const { result } = analysis;
  if (result.food_items.length === 0) return <EmptyState result={result} />;

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-up">
      {analysis.source === 'demo' && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold">Demonstration data.</span> This sample result is not an analysis of your
            photo.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {analysis.imageUrl && (
          <img
            src={analysis.imageUrl}
            alt={result.food_items.join(', ')}
            className="h-28 w-full rounded-2xl object-cover sm:w-36 sm:shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-leaf-700">Identified foods</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink-900">{result.food_items.join(', ')}</h2>
          {result.estimated_portion && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1 text-ink-700">
                <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
                {result.estimated_portion}
              </span>
            </div>
          )}
        </div>
      </div>

      <CaloriesCard calories={result.estimated_calories} />
      <MacroGrid result={result} />

      {result.likely_ingredients.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-ink-900">Likely ingredients</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {result.likely_ingredients.map((ingredient) => (
              <li
                key={ingredient}
                className="rounded-full border border-cream-300 bg-cream-100 px-3 py-1.5 text-sm font-medium text-ink-700"
              >
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.uncertainty_notes.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
            <TriangleAlert className="h-5 w-5 text-amber-700" aria-hidden="true" />
            How sure are we?
          </h3>
          <div className="mt-3">
            <NoteList notes={result.uncertainty_notes} />
          </div>
        </div>
      )}

      {result.follow_up_suggestions.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
            <Lightbulb className="h-5 w-5 text-leaf-700" aria-hidden="true" />
            To refine this estimate
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            {result.follow_up_suggestions.map((suggestion) => (
              <li key={suggestion} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" aria-hidden="true" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-auto border-t border-cream-300 pt-4 text-xs text-ink-500">
        All values are estimates based on the photo, not exact measurements.
      </p>
    </div>
  );
}

function NoteList({ notes }: { notes: string[] }) {
  return (
    <ul className="w-full space-y-2 rounded-2xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-left text-sm text-amber-700">
      {notes.map((note) => (
        <li key={note} className="flex gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  );
}

function CaloriesCard({ calories }: { calories: number | null }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-leaf-600 px-5 py-4 text-cream-50 shadow-card">
      <div>
        <p className="text-sm font-semibold text-leaf-100">Estimated calories</p>
        {calories === null ? (
          <p className="mt-1 text-base font-semibold">Not enough detail to estimate</p>
        ) : (
          <p className="font-display text-4xl font-semibold">
            {Math.round(calories)}
            <span className="ml-1.5 text-base font-semibold text-leaf-100">kcal</span>
          </p>
        )}
      </div>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-50/15">
        <Flame className="h-6 w-6" aria-hidden="true" />
      </span>
    </div>
  );
}

function MacroGrid({ result }: { result: AnalysisResult }) {
  const { protein_g: protein, carbohydrates_g: carbs, fat_g: fat, fiber_g: fiber } = result;
  const hasAllMacros = protein !== null && carbs !== null && fat !== null;
  const proteinKcal = (protein ?? 0) * 4;
  const carbsKcal = (carbs ?? 0) * 4;
  const fatKcal = (fat ?? 0) * 9;
  const macroKcal = proteinKcal + carbsKcal + fatKcal;
  const shareOf = (kcal: number) => (macroKcal > 0 ? Math.round((kcal / macroKcal) * 100) : 0);

  const macros = [
    { label: 'Protein', grams: protein, tint: 'bg-lake-50 text-lake-700', bar: 'bg-lake-500', share: shareOf(proteinKcal) },
    { label: 'Carbs', grams: carbs, tint: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500', share: shareOf(carbsKcal) },
    { label: 'Fats', grams: fat, tint: 'bg-apricot-100 text-apricot-700', bar: 'bg-apricot-500', share: shareOf(fatKcal) },
    { label: 'Fiber', grams: fiber, tint: 'bg-leaf-50 text-leaf-700', bar: null, share: 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {macros.map((macro) => (
        <div key={macro.label} className="rounded-2xl border border-cream-300 bg-cream-100 p-4">
          <p className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${macro.tint}`}>{macro.label}</p>
          <p className="mt-3 font-display text-2xl font-semibold text-ink-900">
            {macro.grams === null ? 'N/A' : macro.grams}
            {macro.grams !== null && <span className="ml-1 text-sm font-semibold text-ink-600">g</span>}
          </p>
          {macro.bar && hasAllMacros && (
            <>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-cream-300"
                role="progressbar"
                aria-label={`${macro.label} share of macro calories`}
                aria-valuenow={macro.share}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className={`h-full rounded-full transition-all duration-700 ${macro.bar}`} style={{ width: `${macro.share}%` }} />
              </div>
              <p className="mt-2 text-xs text-ink-500">About {macro.share}% of macro calories</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
