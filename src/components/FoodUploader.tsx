import { useEffect, useRef, useState, type DragEvent } from 'react';
import { AlertCircle, ImagePlus, Loader2, RefreshCw, ScanSearch, Trash2 } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES, validateFoodImage } from '@/lib/validation';

interface FoodUploaderProps {
  isAnalyzing: boolean;
  onAnalyze: (file: File) => void;
}

export default function FoodUploader({ isAnalyzing, onAnalyze }: FoodUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const acceptFile = (candidate: File | undefined) => {
    if (!candidate) return;
    const validationError = validateFoodImage(candidate);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setFile(candidate);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isAnalyzing) return;
    acceptFile(event.dataTransfer.files[0]);
  };

  const clearPhoto = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const hasPhoto = file !== null && previewUrl !== null;

  return (
    <div className="rounded-3xl border border-cream-300 bg-cream-50 p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink-900">Upload your meal</h2>
          <p className="mt-1.5 text-sm text-ink-600">Use a clear, top-down photo with good lighting.</p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-leaf-50 px-3 py-1 text-xs font-semibold text-leaf-700 sm:inline-flex">
          JPG, PNG, WEBP
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="sr-only"
        aria-label="Choose a food photo"
        disabled={isAnalyzing}
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!isAnalyzing) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mt-6 overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-leaf-500 bg-leaf-50'
            : hasPhoto
              ? 'border-cream-300 bg-cream-100'
              : 'border-cream-300 bg-cream-100 hover:border-leaf-300'
        }`}
      >
        {hasPhoto ? (
          <div className="animate-fade-up">
            <img
              src={previewUrl}
              alt="Preview of the meal you uploaded"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="flex items-center justify-between gap-3 border-t border-cream-300 bg-cream-50 px-4 py-3">
              <p className="min-w-0 truncate text-sm font-semibold text-ink-700">{file.name}</p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-leaf-700 transition-colors hover:bg-leaf-50 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={clearPhoto}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-berry-700 transition-colors hover:bg-berry-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex w-full flex-col items-center justify-center gap-3 px-6 py-12 text-center disabled:cursor-not-allowed"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
              <ImagePlus className="h-7 w-7" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold text-ink-900">Drop a photo here or browse</span>
            <span className="text-sm text-ink-500">Up to 8 MB</span>
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-berry-500/30 bg-berry-50 px-4 py-3 text-sm text-berry-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => file && onAnalyze(file)}
        disabled={!hasPhoto || isAnalyzing}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-leaf-600 px-6 py-3.5 text-base font-semibold text-cream-50 shadow-card transition-all hover:bg-leaf-700 hover:shadow-lift disabled:cursor-not-allowed disabled:bg-leaf-200 disabled:text-leaf-800 disabled:shadow-none"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Analyzing...
          </>
        ) : (
          <>
            <ScanSearch className="h-5 w-5" aria-hidden="true" />
            Analyze Food
          </>
        )}
      </button>
      {!hasPhoto && !error && (
        <p className="mt-3 text-center text-xs text-ink-500">Add a photo to enable analysis.</p>
      )}
    </div>
  );
}
