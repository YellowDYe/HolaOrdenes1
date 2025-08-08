interface ErrorLogData {
  error: Error;
  errorInfo?: any;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  additionalContext?: Record<string, any>;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private isProduction = process.env.NODE_ENV === 'production';

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public logError(
    error: Error, 
    errorInfo?: any, 
    additionalContext?: Record<string, any>
  ): void {
    const errorData: ErrorLogData = {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      additionalContext
    };

    // Always log to console in development
    if (!this.isProduction) {
      console.group('🚨 Error Logged');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Additional Context:', additionalContext);
      console.error('Full Error Data:', errorData);
      console.groupEnd();
    }

    // In production, send to external logging service
    if (this.isProduction) {
      this.sendToLoggingService(errorData);
    }
  }

  public logApiError(
    endpoint: string,
    method: string,
    error: Error,
    responseStatus?: number,
    responseData?: any
  ): void {
    this.logError(error, null, {
      type: 'API_ERROR',
      endpoint,
      method,
      responseStatus,
      responseData
    });
  }

  public logUserAction(
    action: string,
    details?: Record<string, any>
  ): void {
    if (!this.isProduction) {
      console.log('👤 User Action:', action, details);
    }

    // In production, you might want to send user actions to analytics
    if (this.isProduction) {
      // TODO: Send to analytics service
    }
  }

  private async sendToLoggingService(errorData: ErrorLogData): Promise<void> {
    try {
      // TODO: Replace with your actual logging service endpoint
      // Examples: Sentry, LogRocket, Bugsnag, etc.
      
      // For now, we'll use a simple fetch to a hypothetical endpoint
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(errorData),
      // });

      console.warn('Production error logging not configured. Error data:', errorData);
    } catch (loggingError) {
      console.error('Failed to send error to logging service:', loggingError);
    }
  }
}

export const errorLogger = ErrorLogger.getInstance();