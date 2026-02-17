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
  // Family Tree
  familyTree: (treeId: string) => `${API_CONFIG.baseURL}/${API_CONFIG.version}/family/tree/${treeId}`,
  familyMember: (memberId: string) => `${API_CONFIG.baseURL}/${API_CONFIG.version}/family/member/${memberId}`,
  
  // Member Management
  member: {
    create: `${API_CONFIG.baseURL}/${API_CONFIG.version}/admin/family/member`,
    update: (memberId: number) => `${API_CONFIG.baseURL}/${API_CONFIG.version}/admin/family/member/${memberId}`,
    delete: (memberId: number) => `${API_CONFIG.baseURL}/${API_CONFIG.version}/admin/family/member/${memberId}`,
    list: (page: number, limit: number, q?: string) => `${API_CONFIG.baseURL}/${API_CONFIG.version}/admin/family/all?page=${page}&limit=${limit}${q ? `&q=${q}` : ''}`,
    detail: (memberId: number) => `${API_CONFIG.baseURL}/${API_CONFIG.version}/admin/family/${memberId}`,
    selector: (query: string) => `${API_CONFIG.baseURL}/${API_CONFIG.version}/admin/family/selector?q=${query}`
  },

  family: {
    create: `${API_CONFIG.baseURL}/${API_CONFIG.version}/admin/family/`,
  },
  
  // Authentication
  auth: {
    login: `${API_CONFIG.baseURL}/${API_CONFIG.version}/auth/check-signin`,
    sendOTP: `${API_CONFIG.baseURL}/${API_CONFIG.version}/auth/otp/request`,
    verifyOTP: `${API_CONFIG.baseURL}/${API_CONFIG.version}/auth/otp/verify`,
  },
} as const;
