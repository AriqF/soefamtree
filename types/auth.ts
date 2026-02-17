export interface LoginRequest {
  email: string;
  password: string;
}

export interface SendOTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface AuthData {
  token: string;
  exp: number;
  is_admin: boolean;
  admin_auth_index: number;
}

export interface SendOTPData {
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'superuser' | 'admin' | 'user';
  permissions?: string[];
}

export interface AuthErrorData {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
