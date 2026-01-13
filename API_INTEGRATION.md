# Family Tree API Integration Guide

This document explains how to integrate your family tree application with your backend API.

## Current Setup

The application is currently configured with placeholder API integration that uses local JSON data. Here's what's included:

### Files Structure

```
├── app/
│   ├── api/
│   │   └── family-tree/
│   │       └── route.ts          # API route handler (placeholder)
│   └── page.tsx                   # Main page with API integration
├── hooks/
│   └── useFamilyTree.ts           # Custom hook for fetching data
├── components/
│   ├── FamilyTree.tsx             # Main tree component
│   ├── FamilyTreeNode.tsx         # Individual node component
│   ├── LoadingSpinner.tsx         # Loading state UI
│   └── ErrorMessage.tsx           # Error state UI
├── data/
│   └── family-tree.json           # Local dummy data
└── types/
    └── family.ts                  # TypeScript types
```

## How to Integrate with Your Backend API

### Option 1: Using Next.js API Route (Recommended for proxying)

Update `/app/api/family-tree/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { FamilyTreeData } from '@/types/family';

export async function GET() {
  try {
    // Replace with your actual backend API endpoint
    const response = await fetch('https://your-backend-api.com/api/family-tree', {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // or 'force-cache' depending on your needs
    });
    
    if (!response.ok) {
      throw new Error(\`API error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching family tree data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family tree data' },
      { status: 500 }
    );
  }
}
```

### Option 2: Direct API Call from Client

Update `/hooks/useFamilyTree.ts`:

```typescript
const fetchFamilyTree = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Replace with your actual backend API endpoint
    const response = await fetch('https://your-backend-api.com/api/family-tree', {
      headers: {
        'Authorization': `Bearer ${YOUR_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const result = await response.json();
    setData(result);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    setError(errorMessage);
    console.error('Error fetching family tree:', err);
  } finally {
    setLoading(false);
  }
};
```

## Expected API Response Format

Your backend API should return data in the following format:

```json
{
  "rootId": "1",
  "members": [
    {
      "id": "1",
      "firstName": "John",
      "lastName": "Doe",
      "gender": "male",
      "birthDate": "1950-01-15",
      "deathDate": "2020-05-20",
      "spouseId": "2",
      "parentIds": [],
      "childrenIds": ["3", "4"]
    }
  ]
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rootId` | string | Yes | ID of the root ancestor to start the tree |
| `members` | array | Yes | Array of family member objects |
| `id` | string | Yes | Unique identifier for the member |
| `firstName` | string | Yes | First name |
| `lastName` | string | Yes | Last name |
| `gender` | "male" \| "female" | Yes | Gender for color coding |
| `birthDate` | string | No | ISO date string (YYYY-MM-DD) |
| `deathDate` | string | No | ISO date string (YYYY-MM-DD) |
| `photoUrl` | string | No | URL to profile photo (future feature) |
| `spouseId` | string | No | ID of spouse |
| `parentIds` | string[] | No | Array of parent IDs |
| `childrenIds` | string[] | No | Array of children IDs |

## Environment Variables

Create a `.env.local` file in your project root:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
API_TOKEN=your-secret-api-token

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_PHOTOS=false
```

## Features Included

✅ **Loading State** - Spinner with custom message  
✅ **Error Handling** - User-friendly error messages with retry  
✅ **Retry Logic** - Manual refetch capability  
✅ **Type Safety** - Full TypeScript support  
✅ **Responsive Design** - Works on all screen sizes  
✅ **Dark Mode** - Automatic theme support  

## Testing the Integration

1. **Test with local data** (current setup):
   ```bash
   pnpm dev
   ```
   Visit http://localhost:2095

2. **Test with your API**:
   - Update the API endpoint in either `route.ts` or `useFamilyTree.ts`
   - Ensure your API returns data in the expected format
   - Check browser console for any errors

3. **Test error handling**:
   - Use an invalid API endpoint temporarily
   - Check if the error message displays correctly
   - Test the "Try Again" button

## Additional Features to Implement

Here are some suggestions for future API integration:

### 1. Add Member (POST)
```typescript
// hooks/useFamilyTree.ts
const addMember = async (member: Omit<FamilyMember, 'id'>) => {
  const response = await fetch('/api/family-tree/member', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });
  return response.json();
};
```

### 2. Update Member (PUT)
```typescript
const updateMember = async (id: string, member: Partial<FamilyMember>) => {
  const response = await fetch(\`/api/family-tree/member/\${id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });
  return response.json();
};
```

### 3. Delete Member (DELETE)
```typescript
const deleteMember = async (id: string) => {
  const response = await fetch(\`/api/family-tree/member/\${id}\`, {
    method: 'DELETE',
  });
  return response.json();
};
```

### 4. Search/Filter
```typescript
const searchMembers = async (query: string) => {
  const response = await fetch(\`/api/family-tree/search?q=\${query}\`);
  return response.json();
};
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors when calling your backend directly:
- Use the Next.js API route (Option 1) as a proxy
- Or configure CORS headers on your backend

### Authentication
Add authentication headers in your fetch calls:
```typescript
headers: {
  'Authorization': \`Bearer \${token}\`,
}
```

### Caching
Control Next.js caching behavior:
```typescript
// Force fresh data on every request
fetch(url, { cache: 'no-store' })

// Cache for 1 hour
fetch(url, { next: { revalidate: 3600 } })
```

## Support

For questions or issues, refer to:
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- React Hooks: https://react.dev/reference/react/hooks


