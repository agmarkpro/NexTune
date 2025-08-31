import React from 'react';
import { Loader2, Music } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
            <Music className="h-8 w-8 text-green-500" />
          </div>
          <Loader2 className="absolute -top-1 -left-1 h-18 w-18 text-green-500 animate-spin" />
        </div>
        <div>
          <p className="text-lg font-medium text-white">{message}</p>
          <p className="text-sm text-gray-400">This may take a few moments...</p>
        </div>
      </div>
    </div>
  );
}