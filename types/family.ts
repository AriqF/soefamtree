export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}
export interface FamilyMember {
  id: string;
  fullname: string;
  nickname: string;
  domicile: string | null;
  bio: string | null;
  gender: Gender;
  depth: number;
  birthDate?: string;
  deathDate?: string;
  photoUrl?: string;
  spouseId?: string;
  parentIds?: string[];
  childrenIds?: string[];
}

export interface FamilyTreeData {
  members: FamilyMember[];
  rootId: string; // The ID of the top ancestor to start the tree from
}

export interface TreeNode {
  member: FamilyMember;
  spouse?: FamilyMember;
  children: TreeNode[];
  level: number;
}

export interface MemberDetail{
  id: number;
  fullname: string;
  nickname: string;
  gender: Gender;
  birth_date: string;
  death_date: string;
  photo_url: string;
  bio: string;
  detail: {
    profession: string;
    domicile: string;
    full_address: string;
    whatsapp_number: string;
  }
}

