import { NextResponse } from 'next/server';
import familyTreeData from '@/data/family-tree.json';
import { FamilyMember } from '@/types/family';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // TODO: Replace this with actual API call to your backend
    // Example:
    // const response = await fetch(`https://your-api.com/family/member/${id}`);
    // const data = await response.json();
    
    // Simulate API delay (remove this in production)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the member in the local data
    const member = familyTreeData.members.find(m => m.id === id);
    
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Return the member data
    return NextResponse.json(member as FamilyMember);
  } catch (error) {
    console.error('Error fetching member data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member data' },
      { status: 500 }
    );
  }
}
