'use client';

import { FamilyTree } from '@/components/FamilyTree';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useFamilyTree } from '@/hooks/useFamilyTree';

export default function Home() {
  const { data, loading, error, refetch } = useFamilyTree();

  if (loading) {
    return <LoadingSpinner message="Loading family tree..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorMessage message="No family tree data available" onRetry={refetch} />;
  }

  return <FamilyTree data={data} />;
}
