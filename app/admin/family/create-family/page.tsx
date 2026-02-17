'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/lib/api-config';
import { AuthStorage } from '@/lib/secure-storage';
import { APIResponse } from '@/types/response';
import { CreateFamilyRequest } from '@/types/family';
import { CreateMemberRequest, MemberDetail } from '@/types/member';
import { Gender } from '@/types/family';
import Link from 'next/link';
import MemberSelector from '@/components/MemberSelector';

interface MemberFormData {
  fullname: string;
  nickname: string;
  gender: Gender | '';
  birth_date: string;
  death_date: string;
  photo_url: string;
  bio: string;
  profession: string;
  domicile: string;
  full_address: string;
  whatsapp_number: string;
  instagram_handle: string;
  father_id: string;
  father_name: string;
  mother_id: string;
  mother_name: string;
}

const emptyMemberData: MemberFormData = {
  fullname: '',
  nickname: '',
  gender: '',
  birth_date: '',
  death_date: '',
  photo_url: '',
  bio: '',
  profession: '',
  domicile: '',
  full_address: '',
  whatsapp_number: '',
  instagram_handle: '',
  father_id: null,
  father_name: '',
  mother_id: null,
  mother_name: '',
};

export default function CreateFamilyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [father, setFather] = useState<MemberFormData>(emptyMemberData);
  const [mother, setMother] = useState<MemberFormData>(emptyMemberData);
  const [children, setChildren] = useState<MemberFormData[]>([]);

  const handleFatherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFather(prev => ({ ...prev, [name]: value }));
  };

  const handleFatherAncestorSelect = (field: 'father' | 'mother', id: string, fullname: string) => {
    setFather(prev => ({
      ...prev,
      [`${field}_id`]: id,
      [`${field}_name`]: fullname,
    }));
  };

  const handleMotherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMother(prev => ({ ...prev, [name]: value }));
  };

  const handleMotherAncestorSelect = (field: 'father' | 'mother', id: string, fullname: string) => {
    setMother(prev => ({
      ...prev,
      [`${field}_id`]: id,
      [`${field}_name`]: fullname,
    }));
  };

  const handleChildChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setChildren(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const addChild = () => {
    setChildren(prev => [...prev, { ...emptyMemberData }]);
  };

  const removeChild = (index: number) => {
    setChildren(prev => prev.filter((_, i) => i !== index));
  };

  const convertToCreateMemberRequest = (data: MemberFormData): CreateMemberRequest => {
    return {
      fullname: data.fullname,
      nickname: data.nickname || null,
      gender: data.gender as Gender,
      birth_date: data.birth_date || null,
      death_date: data.death_date || null,
      photo_url: data.photo_url || null,
      bio: data.bio || null,
      spouse_id: null,
      father_id: data.father_id ? Number(data.father_id) : null,
      mother_id: data.mother_id ? Number(data.mother_id) : null,
      detail: {
        profession: data.profession || null,
        domicile: data.domicile || null,
        full_address: data.full_address || null,
        whatsapp_number: data.whatsapp_number || null,
        instagram_handle: data.instagram_handle || null,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const token = AuthStorage.getToken();
      if (!token) {
        router.push('/superuser');
        return;
      }

      const requestData: CreateFamilyRequest = {
        father: convertToCreateMemberRequest(father),
        mother: convertToCreateMemberRequest(mother),
        children: children.map(child => convertToCreateMemberRequest(child)),
      };

      const response = await axios.post<APIResponse<any>>(
        API_ENDPOINTS.family.create,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.code === 201 || response.data.code === 200) {
        setSuccess('Family created successfully!');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/admin/family');
        }, 2000);
      }
    } catch (err) {
      const axiosError = err as AxiosError<APIResponse<any>>;
      if (axiosError.response?.status === 401) {
        AuthStorage.clearSession();
        router.push('/superuser');
      } else if (axiosError.response?.data) {
        setError(axiosError.response.data.message || 'Failed to create family');
      } else {
        setError('Failed to create family. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderMemberFields = (
    data: MemberFormData,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
    onAncestorSelect: ((field: 'father' | 'mother', id: string, fullname: string) => void) | null,
    title: string,
    required: boolean = true
  ) => (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-zinc-900 dark:text-white">{title}</h4>
      
      {/* Basic Information */}
      <div>
        <h5 className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 mb-3">Basic Information</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Full Name {required && '*'}
            </label>
            <input
              type="text"
              name="fullname"
              required={required}
              value={data.fullname}
              onChange={onChange}
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
              value={data.nickname}
              onChange={onChange}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
              placeholder="Enter nickname"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Gender {required && '*'}
            </label>
            <select
              name="gender"
              required={required}
              value={data.gender}
              onChange={onChange}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
            >
              <option value="">Select gender</option>
              <option value={Gender.MALE}>Pria</option>
              <option value={Gender.FEMALE}>Wanita</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Birth Date
            </label>
            <input
              type="date"
              name="birth_date"
              value={data.birth_date}
              onChange={onChange}
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
              value={data.death_date}
              onChange={onChange}
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
              value={data.photo_url}
              onChange={onChange}
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
              value={data.bio}
              onChange={onChange}
              rows={2}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
              placeholder="Enter biography..."
            />
          </div>
        </div>
      </div>

      {/* Contact & Details */}
      <div>
        <h5 className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 mb-3">Contact & Details</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              value={data.profession}
              onChange={onChange}
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
              value={data.domicile}
              onChange={onChange}
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
              value={data.full_address}
              onChange={onChange}
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
              value={data.whatsapp_number}
              onChange={onChange}
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
              value={data.instagram_handle}
              onChange={onChange}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
              placeholder="username"
            />
          </div>
        </div>
      </div>

      {/* Ancestors Section - Only show if onAncestorSelect is provided */}
      {onAncestorSelect && (
        <div>
          <h5 className="text-sm font-semibold text-zinc-700 dark:text-zinc-400 mb-3">Ancestors (Optional)</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MemberSelector
              label="Father"
              name="father"
              value={data.father_id}
              displayValue={data.father_name}
              onChange={(id, fullname) => onAncestorSelect('father', id, fullname)}
              placeholder="Type to search father..."
            />

            <MemberSelector
              label="Mother"
              name="mother"
              value={data.mother_id}
              displayValue={data.mother_name}
              onChange={(id, fullname) => onAncestorSelect('mother', id, fullname)}
              placeholder="Type to search mother..."
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Define ancestors to build the family tree hierarchy
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/family"
          className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Family List
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Create New Family
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Create a couple (father & mother) with optional children
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="space-y-8">
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

          {/* Father Section */}
          <div className="border border-blue-200 dark:border-blue-900/30 rounded-lg p-6 bg-blue-50/50 dark:bg-blue-900/10">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold">
                1
              </span>
              Father Information
            </h3>
            {renderMemberFields(father, handleFatherChange, handleFatherAncestorSelect, "Father Details")}
          </div>

          {/* Mother Section */}
          <div className="border border-pink-200 dark:border-pink-900/30 rounded-lg p-6 bg-pink-50/50 dark:bg-pink-900/10">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-bold">
                2
              </span>
              Mother Information
            </h3>
            {renderMemberFields(mother, handleMotherChange, handleMotherAncestorSelect, "Mother Details")}
          </div>

          {/* Children Section */}
          <div className="border border-green-200 dark:border-green-900/30 rounded-lg p-6 bg-green-50/50 dark:bg-green-900/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-bold">
                  3
                </span>
                Children (Optional)
              </h3>
              <button
                type="button"
                onClick={addChild}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Child
              </button>
            </div>

            {children.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                <p className="text-sm">No children added yet. Click "Add Child" to add children.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {children.map((child, index) => (
                  <div key={index} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-zinc-900 dark:text-white">
                        Child #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                        title="Remove child"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    {renderMemberFields(
                      child,
                      (e) => handleChildChange(index, e),
                      null, // No ancestor selection for children
                      `Child #${index + 1} Details`,
                      false
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <Link
              href="/admin/family"
              className="px-6 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || !!success}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Creating...' : success ? 'Created!' : 'Create Family'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
