'use client';

import { useState, useEffect } from 'react';
import { FamilyTreeData } from '@/types/family';
import { APIResponse } from '@/types/response';

interface UseFamilyTreeReturn {
  data: FamilyTreeData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFamilyTree(): UseFamilyTreeReturn {
  const [data, setData] = useState<FamilyTreeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFamilyTree = async () => {
    try {
      setLoading(true);
      setError(null);
      
      //TODO: change with axios
      const response = await fetch('http://localhost:3000/v1/admin/family/tree/16');
      console.log(response)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: APIResponse<FamilyTreeData | null> = await response.json();
      setData(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching family tree:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyTree();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchFamilyTree,
  };
}

