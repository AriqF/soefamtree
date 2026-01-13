import { NextResponse } from 'next/server';
import familyTreeData from '@/data/family-tree.json';
import { FamilyTreeData } from '@/types/family';

export async function GET() {
  try {
    // TODO: Replace this with actual API call to your backend
    // Example:
    // const response = await fetch('https://your-api.com/family-tree');
    // const data = await response.json();
    
    // Simulate API delay (remove this in production)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, return the local JSON data
    return NextResponse.json(familyTreeData as FamilyTreeData);
  } catch (error) {
    console.error('Error fetching family tree data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family tree data' },
      { status: 500 }
    );
  }
}

