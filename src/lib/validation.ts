export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_QUESTION_LENGTH = 300;

export function validateFoodImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'That file type is not supported. Please choose a JPG, PNG, or WEBP photo.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'That photo is larger than 8 MB. Please choose a smaller image.';
  }
  return null;
}

export function validateQuestion(question: string): string | null {
  const trimmed = question.trim();
  if (trimmed.length === 0) {
    return 'Type a question about your meal first.';
  }
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    return `Please keep questions under ${MAX_QUESTION_LENGTH} characters.`;
  }
  return null;
}
