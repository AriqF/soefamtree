'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateMemberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement member creation
    console.log('Create member');
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
          Create New Member
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Add a new family member to the tree
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="Enter nickname"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Gender *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Pria</option>
                  <option value="female">Wanita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Domicile
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="+62 812 3456 7890"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Job/Occupation
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="Enter occupation"
                />
              </div>
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
              {isLoading ? 'Creating...' : 'Create Member'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
