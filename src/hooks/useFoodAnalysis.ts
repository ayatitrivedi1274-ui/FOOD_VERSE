import { useCallback, useRef, useState } from 'react';
import { analyzeFoodImage } from '@/lib/foodAnalysis';
import { FunctionError, type FunctionErrorCode } from '@/lib/edgeFunctions';
import { DEMO_ANALYSIS } from '@/data/demoAnalysis';
import type { FoodAnalysis } from '@/types/food';

export type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; code: FunctionErrorCode; message: string }
  | { status: 'ready'; analysis: FoodAnalysis; resultId: number };

const UNEXPECTED_ERROR_MESSAGE = 'Something went wrong while analyzing this photo. Please try again.';

export function useFoodAnalysis() {
  const [state, setState] = useState<AnalysisState>({ status: 'idle' });
  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);

  const analyze = useCallback(async (file: File) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const requestId = ++requestIdRef.current;
    setState({ status: 'loading' });
    try {
      const analysis = await analyzeFoodImage(file);
      if (requestId === requestIdRef.current) {
        setState({ status: 'ready', analysis, resultId: requestId });
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      if (error instanceof FunctionError) {
        setState({ status: 'error', code: error.code, message: error.message });
      } else {
        setState({ status: 'error', code: 'server_error', message: UNEXPECTED_ERROR_MESSAGE });
      }
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  const showDemo = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setState({ status: 'ready', analysis: DEMO_ANALYSIS, resultId: requestId });
  }, []);

  return { state, analyze, showDemo };
}
