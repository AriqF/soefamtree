// ============================================
// Family Member Request Types
// ============================================

import { Gender, ParentRelation } from "./family";


export interface MemberDetail {
  profession: string | null;
  domicile: string | null;
  full_address: string | null;
  whatsapp_number: string | null;
  instagram_handle: string | null;
}

export interface CreateMemberRequest {
  fullname: string;
  nickname: string | null;
  gender: Gender;
  birth_date: string | null;
  death_date: string | null;
  photo_url: string | null;
  bio: string | null;
  spouse_id: number | null;
  father_id?: number | null;
  mother_id?: number | null;
  detail: MemberDetail;
}

export interface UpdateMemberRequest extends CreateMemberRequest {
  id: string;
}

// ============================================
// Family Member Response Types
// ============================================

export interface CreateMemberResponse {
  id: string;
  fullname: string;
  message?: string;
}

export interface UpdateMemberResponse {
  id: string;
  fullname: string;
  message?: string;
}

export interface DeleteMemberResponse {
  success: boolean;
  message: string;
}

export interface PaginateList<T> {
  rows: Array<T>;
  total_data: number;
  limit: number;
  total_page: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  has_previous_page: boolean;
  has_next_page: boolean;
}

export interface GetBasicMember{
  id: number;
  fullname: string;
  nickname: string;
}

export interface GetMemberResponse {
  id: number;
  fullname: string;
  nickname?: string;
  gender: Gender;
  birth_date?: string;
  death_date?: string;
  photo_url?: string;
  detail: {
    domicile?: string;
  }
}

export interface GetMemberDetailResponse {
  id: number;
  fullname: string;
  nickname?: string;
  gender: Gender;
  birth_date: Date;
  death_date: Date;
  photo_url: string;
  bio: string;
  spouse: GetBasicMember
  detail: {
    id: number;
    profession: string;
    domicile: string;
    full_address: string;
    whatsapp_number: string;
    instagram_handle: string;
  };
  parents: {
    relation: ParentRelation;
    parent: GetBasicMember;
  }[];
}