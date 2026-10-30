import { Dumbbell, Leaf, Sprout, Wheat } from 'lucide-react';
import type { DietaryPreference } from '@/types/food';

export interface DietaryOption {
  id: DietaryPreference;
  label: string;
  description: string;
  icon: typeof Leaf;
}

export const DIETARY_OPTIONS: DietaryOption[] = [
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish', icon: Leaf },
  { id: 'vegan', label: 'Vegan', description: 'No animal products', icon: Sprout },
  { id: 'high-protein', label: 'High-protein', description: '30 g+ per serving', icon: Dumbbell },
  { id: 'low-carb', label: 'Low-carb', description: 'Fewer carbs per plate', icon: Wheat },
];
