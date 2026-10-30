import type { FoodAnalysis } from '@/types/food';

// Demonstration only. Shown when a visitor explicitly opens the demo preview. Never used as real analysis.
export const DEMO_ANALYSIS: FoodAnalysis = {
  source: 'demo',
  imageUrl: 'https://images.pexels.com/photos/40108716/pexels-photo-40108716.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  result: {
    food_items: ['Grilled chicken with roasted vegetables'],
    likely_ingredients: ['Grilled chicken breast', 'Roasted bell peppers', 'Zucchini', 'Red onion', 'Herbed rice', 'Olive oil'],
    estimated_portion: '1 plate (about 350 g)',
    estimated_calories: 480,
    protein_g: 42,
    carbohydrates_g: 28,
    fat_g: 19,
    fiber_g: 6,
    uncertainty_notes: ['Demonstration data only. This is sample output, not an analysis of your photo.'],
    follow_up_suggestions: ['Upload your own photo to see a real estimate.'],
  },
};
