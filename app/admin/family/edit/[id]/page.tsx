'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/lib/api-config';
import { AuthStorage } from '@/lib/secure-storage';
import { APIResponse } from '@/types/response';
import type { UpdateMemberRequest, UpdateMemberResponse, GetMemberDetailResponse } from '@/types/member';
import Link from 'next/link';
import { Gender, ParentRelation } from '@/types/family';
import MemberSelector from '@/components/MemberSelector';

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    fullname: '',
    nickname: '',
    gender: '' as 'male' | 'female' | '',
    birth_date: '',
    death_date: '',
    photo_url: '',
    bio: '',
    spouse_id: '',
    spouse_name: '',
    father_id: '',
    father_name: '',
    mother_id: '',
    mother_name: '',
    // Detail fields
    profession: '',
    domicile: '',
    full_address: '',
    whatsapp_number: '',
    instagram_handle: '',
  });

  useEffect(() => {
    if (memberId) {
      fetchMemberDetail();
    }
  }, [memberId]);

  const fetchMemberDetail = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = AuthStorage.getToken();
      if (!token) {
        router.push('/superuser');
        return;
      }

      const response = await axios.get<APIResponse<GetMemberDetailResponse>>(
        API_ENDPOINTS.member.detail(Number(memberId)),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code === 200 && response.data.data) {
        const member = response.data.data;
        
        // Convert Date objects to YYYY-MM-DD format for input fields
        const formatDateForInput = (date?: Date): string => {
          if (!date) return '';
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        };

        setFormData({
          fullname: member.fullname || '',
          nickname: member.nickname || '',
          gender: member.gender || '',
          birth_date: formatDateForInput(member.birth_date),
          death_date: formatDateForInput(member.death_date),
          photo_url: member.photo_url || '',
          bio: member.bio || '',
          spouse_id: member.spouse?.id?.toString() || '',
          spouse_name: member.spouse?.fullname || '',
          father_id: member.parents?.find(p => p.relation === ParentRelation.FATHER)?.parent.id.toString() || '',
          father_name: member.parents?.find(p => p.relation === ParentRelation.FATHER)?.parent.fullname || '',
          mother_id: member.parents?.find(p => p.relation === ParentRelation.MOTHER)?.parent.id.toString() || '',
          mother_name: member.parents?.find(p => p.relation === ParentRelation.MOTHER)?.parent.fullname || '',
          profession: member.detail?.profession || '',
          domicile: member.detail?.domicile || '',
          full_address: member.detail?.full_address || '',
          whatsapp_number: member.detail?.whatsapp_number || '',
          instagram_handle: member.detail?.instagram_handle || '',
        });
      }
    } catch (err) {
      const axiosError = err as AxiosError<APIResponse<any>>;
      if (axiosError.response?.status === 401) {
        AuthStorage.clearSession();
        router.push('/superuser');
      } else {
        setError('Failed to load member details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberSelect = (field: 'spouse' | 'father' | 'mother', id: string, fullname: string) => {
    setFormData(prev => ({
      ...prev,
      [`${field}_id`]: id,
      [`${field}_name`]: fullname,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const token = AuthStorage.getToken();
      if (!token) {
        router.push('/superuser');
        return;
      }

      // Prepare request data matching backend schema
      const requestData: UpdateMemberRequest = {
        id: memberId,
        fullname: formData.fullname,
        nickname: formData.nickname || null,
        gender: formData.gender as Gender,
        birth_date: formData.birth_date || null,
        death_date: formData.death_date || null,
        photo_url: formData.photo_url || null,
        bio: formData.bio || null,
        spouse_id: formData.spouse_id ? Number(formData.spouse_id) : null,
        father_id: formData.father_id ? Number(formData.father_id) : null,
        mother_id: formData.mother_id ? Number(formData.mother_id) : null,
        detail: {
          profession: formData.profession || null,
          domicile: formData.domicile || null,
          full_address: formData.full_address || null,
          whatsapp_number: formData.whatsapp_number || null,
          instagram_handle: formData.instagram_handle || null,
        },
      };

      const response = await axios.put<APIResponse<UpdateMemberResponse>>(
        API_ENDPOINTS.member.update(Number(memberId)),
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.code === 200) {
        setSuccess(`Member "${response.data.data.fullname}" updated successfully!`);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/admin/family/${memberId}`);
        }, 2000);
      }
    } catch (err) {
      const axiosError = err as AxiosError<APIResponse<any>>;
      if (axiosError.response?.status === 401) {
        AuthStorage.clearSession();
        router.push('/superuser');
      } else if (axiosError.response?.data) {
        setError(axiosError.response.data.message || 'Failed to update member');
      } else {
        setError('Failed to update member. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/family/${memberId}`}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Edit Member
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Update member information
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullname"
                  required
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="Enter nickname"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Pria</option>
                  <option value="female">Wanita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Death Date (if applicable)
                </label>
                <input
                  type="date"
                  name="death_date"
                  value={formData.death_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Photo URL
                </label>
                <input
                  type="url"
                  name="photo_url"
                  value={formData.photo_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Biography
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="Enter biography..."
                />
              </div>
            </div>
          </div>

          {/* Contact & Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Contact & Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Profession
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Domicile
                </label>
                <input
                  type="text"
                  name="domicile"
                  value={formData.domicile}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="e.g., Jakarta"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Full Address
                </label>
                <input
                  type="text"
                  name="full_address"
                  value={formData.full_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="e.g., Jl. Sudirman No. 123, Jakarta Selatan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="6281234567890"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Format: 6281234567890 (without + or spaces)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  name="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          {/* Relationships Section (Optional) */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Relationships (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MemberSelector
                label="Father"
                name="father"
                value={formData.father_id}
                displayValue={formData.father_name}
                onChange={(id, fullname) => handleMemberSelect('father', id, fullname)}
                placeholder="Type to search father..."
              />

              <MemberSelector
                label="Mother"
                name="mother"
                value={formData.mother_id}
                displayValue={formData.mother_name}
                onChange={(id, fullname) => handleMemberSelect('mother', id, fullname)}
                placeholder="Type to search mother..."
              />

              <MemberSelector
                label="Spouse"
                name="spouse"
                value={formData.spouse_id}
                displayValue={formData.spouse_name}
                onChange={(id, fullname) => handleMemberSelect('spouse', id, fullname)}
                placeholder="Type to search spouse..."
              />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Leave empty if not applicable. You can link relationships later.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <Link
              href={`/admin/family/${memberId}`}
              className="px-6 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || !!success}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSaving ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
