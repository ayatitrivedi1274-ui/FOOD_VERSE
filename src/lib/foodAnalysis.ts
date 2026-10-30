import { FunctionError, postToFunction } from '@/lib/edgeFunctions';
import { prepareImageForUpload } from '@/lib/imageCompression';
import type { AnalysisResult, FoodAnalysis } from '@/types/food';

interface AnalyzeResponse {
  analysis: unknown;
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');
const isNullableNumber = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isFinite(value));
const isNullableString = (value: unknown): value is string | null => value === null || typeof value === 'string';

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    isStringArray(candidate.food_items) &&
    isStringArray(candidate.likely_ingredients) &&
    isNullableString(candidate.estimated_portion) &&
    isNullableNumber(candidate.estimated_calories) &&
    isNullableNumber(candidate.protein_g) &&
    isNullableNumber(candidate.carbohydrates_g) &&
    isNullableNumber(candidate.fat_g) &&
    isNullableNumber(candidate.fiber_g) &&
    isStringArray(candidate.uncertainty_notes) &&
    isStringArray(candidate.follow_up_suggestions)
  );
}

export async function analyzeFoodImage(image: File): Promise<FoodAnalysis> {
  let prepared: File;
  try {
    prepared = await prepareImageForUpload(image);
  } catch {
    throw new FunctionError('invalid_file', 'This photo could not be read. Please try a JPG, PNG, or WEBP photo.');
  }

  const form = new FormData();
  form.append('image', prepared);

  const payload = await postToFunction<AnalyzeResponse>('analyze-food', form);
  if (!isAnalysisResult(payload.analysis)) {
    throw new FunctionError('server_error', 'The analysis came back in an unexpected format. Please try again.');
  }

  return { source: 'ai', imageUrl: null, result: payload.analysis };
}
