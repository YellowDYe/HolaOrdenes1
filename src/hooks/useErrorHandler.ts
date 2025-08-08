import { useCallback } from 'react';
import { errorLogger } from '../utils/errorLogger';

interface UseErrorHandlerReturn {
  handleError: (error: Error, context?: Record<string, any>) => void;
  handleApiError: (endpoint: string, method: string, error: Error, responseStatus?: number, responseData?: any) => void;
  logUserAction: (action: string, details?: Record<string, any>) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const handleError = useCallback((error: Error, context?: Record<string, any>) => {
    errorLogger.logError(error, null, context);
  }, []);

  const handleApiError = useCallback((
    endpoint: string,
    method: string,
    error: Error,
    responseStatus?: number,
    responseData?: any
  ) => {
    errorLogger.logApiError(endpoint, method, error, responseStatus, responseData);
  }, []);

  const logUserAction = useCallback((action: string, details?: Record<string, any>) => {
    errorLogger.logUserAction(action, details);
  }, []);

  return {
    handleError,
    handleApiError,
    logUserAction
  };
};