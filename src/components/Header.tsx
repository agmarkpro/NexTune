import React from 'react';
import { Music2 } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-black bg-opacity-90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
              <Music2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">NexTune</h1>
              <p className="text-xs text-gray-400">Powered by Chosic</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Live Search</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}