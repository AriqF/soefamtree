# API Type Definitions - Best Practices

## 📚 Overview

This document outlines best practices for defining TypeScript types/interfaces for API requests and responses.

## 🎯 Best Practices

### 1. **Separate Request and Response Types**
Always separate request bodies from response bodies, even if they share similar fields.

```typescript
// ✅ Good
interface LoginRequest { email: string; password: string; }
interface LoginResponse { token: string; user: User; }

// ❌ Bad
interface Login { email: string; password: string; token: string; user: User; }
```

### 2. **Use Descriptive Names**
Follow naming conventions:
- Requests: `{Action}Request` (e.g., `LoginRequest`, `SendOTPRequest`)
- Responses: `{Action}Response` (e.g., `AuthResponse`, `SendOTPResponse`)
- Errors: `{Context}Error` (e.g., `AuthError`, `ValidationError`)

### 3. **Group Related Types**
Organize types by domain/feature in separate files:
```
types/
  ├── auth.ts        # Authentication types
  ├── family.ts      # Family tree types
  ├── user.ts        # User types
  └── response.ts    # Generic response types
```

### 4. **Use Generic Wrappers for Consistent API Responses**
If your API has a consistent wrapper format:

```typescript
// types/response.ts
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

// Usage
type LoginAPIResponse = APIResponse<AuthResponse>;
```

### 5. **Make Optional Fields Explicit**
Use `?` for optional fields:

```typescript
interface LoginRequest {
  email: string;          // Required
  password: string;       // Required
  rememberMe?: boolean;   // Optional
}
```

### 6. **Use Union Types for States**
```typescript
type AuthMethod = 'password' | 'otp' | 'social';
type UserRole = 'superuser' | 'admin' | 'user';
```

### 7. **Type API Calls Properly**

```typescript
// ✅ Good - Typed request and response
const requestData: LoginRequest = { email, password };
const response = await axios.post<AuthResponse>(url, requestData);
const { data } = response; // data is typed as AuthResponse

// ❌ Bad - No typing
const response = await axios.post(url, { email, password });
const data = response.data; // data is 'any'
```

### 8. **Handle Errors with Proper Types**

```typescript
// Define error type
interface AuthError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// Use in catch block
try {
  const response = await axios.post<AuthResponse>(url, data);
} catch (err) {
  const axiosError = err as AxiosError<AuthError>;
  const errorMessage = axiosError.response?.data.message || 'Unknown error';
}
```

## 📝 Example Structure

### File: `types/auth.ts`

```typescript
// ============================================
// Request Types
// ============================================
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SendOTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

// ============================================
// Response Types
// ============================================
export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: AuthUser;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

// ============================================
// Data Types
// ============================================
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'superuser' | 'admin' | 'user';
}

// ============================================
// Error Types
// ============================================
export interface AuthError {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
```

### Usage in Component

```typescript
import type { LoginRequest, AuthResponse, AuthError } from '@/types/auth';
import axios, { AxiosError } from 'axios';

async function handleLogin() {
  try {
    // Type the request body
    const requestData: LoginRequest = {
      email: 'user@example.com',
      password: 'password123',
      rememberMe: true,
    };

    // Type the response
    const response = await axios.post<AuthResponse>(
      '/api/auth/login',
      requestData
    );

    // Now response.data is fully typed
    const { token, user, expiresIn } = response.data;
    
    // TypeScript knows these exist and their types
    localStorage.setItem('token', token);
    console.log(user?.name); // Safe optional chaining
    
  } catch (err) {
    // Type the error
    const axiosError = err as AxiosError<AuthError>;
    
    // Safely access error data
    const errorMessage = axiosError.response?.data.message || 'Login failed';
    console.error(errorMessage);
  }
}
```

## 🚀 Benefits

1. **Type Safety**: Catch errors at compile time
2. **Autocomplete**: Better IDE support
3. **Documentation**: Types serve as inline documentation
4. **Refactoring**: Easy to update when API changes
5. **Consistency**: Ensures consistent data shapes
6. **Validation**: Can use with runtime validators like Zod

## ⚠️ Common Mistakes to Avoid

```typescript
// ❌ Don't use 'any'
const response = await axios.post(url, data as any);

// ❌ Don't reuse types when they're different
type LoginData = { email: string; password: string; token: string };

// ❌ Don't make everything optional
interface User {
  id?: string;        // Should this really be optional?
  email?: string;
  name?: string;
}

// ✅ Do use specific types
const response = await axios.post<AuthResponse>(url, requestData);

// ✅ Do separate concerns
interface LoginRequest { email: string; password: string; }
interface LoginResponse { token: string; user: User; }

// ✅ Do use required fields when appropriate
interface User {
  id: string;          // Required
  email: string;       // Required
  name?: string;       // Optional
}
```

## 🔗 Resources

- [TypeScript Handbook - Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
- [Axios TypeScript Guide](https://axios-http.com/docs/typescript)
- [Type vs Interface](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
