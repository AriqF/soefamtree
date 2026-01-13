import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-zinc-200 dark:border-zinc-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400 text-lg">{message}</p>
    </div>
  );
};

