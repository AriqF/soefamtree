export interface FamilyMember {
  id: string;
  fullname: string;
  gender: "male" | "female";
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

