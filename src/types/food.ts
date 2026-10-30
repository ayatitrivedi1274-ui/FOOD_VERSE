export type DietaryPreference = 'vegetarian' | 'vegan' | 'high-protein' | 'low-carb';

export interface AnalysisResult {
  food_items: string[];
  likely_ingredients: string[];
  estimated_portion: string | null;
  estimated_calories: number | null;
  protein_g: number | null;
  carbohydrates_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  uncertainty_notes: string[];
  follow_up_suggestions: string[];
}

export interface FoodAnalysis {
  source: 'ai' | 'demo';
  imageUrl: string | null;
  result: AnalysisResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isError?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepMinutes: number;
  calories: number;
  proteinG: number;
  tags: DietaryPreference[];
}
