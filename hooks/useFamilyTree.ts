'use client';

import { useState, useEffect } from 'react';
import { FamilyTreeData } from '@/types/family';
import { APIResponse } from '@/types/response';
import { API_ENDPOINTS } from '@/lib/api-config';
import axios from 'axios';

interface UseFamilyTreeReturn {
  data: FamilyTreeData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFamilyTree(treeId: string = '2'): UseFamilyTreeReturn {
  const [data, setData] = useState<FamilyTreeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFamilyTree = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(API_ENDPOINTS.familyTree(treeId), {
        headers: {
          // "ngrok-skip-browser-warning": "69420"
        }
      });
      console.log(response);

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<FamilyTreeData | null> = await response.data;
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
  }, [treeId]);

  return {
    data,
    loading,
    error,
    refetch: fetchFamilyTree,
  };
}

