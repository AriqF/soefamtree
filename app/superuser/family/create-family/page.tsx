'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateFamilyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement family creation
    console.log('Create family');
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/family"
          className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Family List
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Create New Family
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Create a couple relationship with optional children
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="space-y-8">
          {/* Primary Member Section */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold">
                1
              </span>
              Primary Member
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Select Member *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                >
                  <option value="">Choose a member</option>
                  {/* TODO: Load from API */}
                </select>
              </div>
            </div>
          </div>

          {/* Spouse Section */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-bold">
                2
              </span>
              Spouse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Select Spouse *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                >
                  <option value="">Choose a spouse</option>
                  {/* TODO: Load from API */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Marriage Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Children Section */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-bold">
                3
              </span>
              Children (Optional)
            </h3>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Select Children
              </label>
              <select
                multiple
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white h-40"
              >
                {/* TODO: Load from API */}
              </select>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                Hold Ctrl/Cmd to select multiple children
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <Link
              href="/admin/family"
              className="px-6 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Family'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
