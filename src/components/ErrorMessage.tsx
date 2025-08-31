import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-300 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-200 text-sm mb-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                       text-white rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}