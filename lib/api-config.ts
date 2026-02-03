/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints
 */

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  version: 'v1',
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  familyTree: (treeId: string) => `${API_CONFIG.baseURL}/${API_CONFIG.version}/family/tree/${treeId}`,
  familyMember: (memberId: string) => `${API_CONFIG.baseURL}/${API_CONFIG.version}/family/member/${memberId}`,
} as const;
