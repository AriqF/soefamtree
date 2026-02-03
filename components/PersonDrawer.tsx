'use client';

import React, { useEffect, useState } from 'react';
import { FamilyMember, MemberDetail } from '@/types/family';
import { APIResponse } from '@/types/response';
import { API_ENDPOINTS } from '@/lib/api-config';
import Image from 'next/image';
import axios from 'axios';

interface PersonDrawerProps {
  person: FamilyMember | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PersonDrawerState {
  data: MemberDetail | null;
  loading: boolean;
  error: string | null;
}

function getInitials(fullname: string): string {
  const parts = fullname.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return fullname.slice(0, 2).toUpperCase() || fullname.charAt(0).toUpperCase();
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function calculateAge(birthDate?: string, deathDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  return end.getFullYear() - birth.getFullYear();
}

export const PersonDrawer: React.FC<PersonDrawerProps> = ({ person, isOpen, onClose }) => {
  const [state, setState] = useState<PersonDrawerState>({
    data: null,
    loading: false,
    error: null,
  });

  // Fetch member data when drawer opens
  useEffect(() => {
    if (isOpen && person?.id) {
      setState({ data: null, loading: true, error: null });

      axios.get(API_ENDPOINTS.familyMember(person.id), {
        headers: {
          // "ngrok-skip-browser-warning": "69420"
        }
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error('Failed to fetch member data');
          }
          const result: APIResponse<MemberDetail> = response.data;
          setState({ data: result.data, loading: false, error: null });
        })
        .catch((error) => {
          console.error('Error fetching member data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to load member details';
          setState({
            data: null,
            loading: false,
            error: errorMessage
          });
        });
    }
  }, [isOpen, person?.id]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setState({ data: null, loading: false, error: null });
    }
  }, [isOpen]);

  if (!person) return null;

  const displayPerson = state.data;
  const age = calculateAge(displayPerson?.birth_date, displayPerson?.death_date);
  const formattedBirthDate = formatDate(displayPerson?.birth_date);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 dark:bg-black/40 transition-opacity duration-300 z-[100] ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-[101] ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Detail</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Close drawer"
            >
              <svg
                className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Loading State */}
            {state.loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <svg
                  className="animate-spin h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading details...</p>
              </div>
            )}

            {/* Error State */}
            {state.error && !state.loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
                  {state.error}
                </p>
                <button
                  onClick={() => {
                    if (person?.id) {
                      setState({ data: null, loading: true, error: null });
                      axios.get(API_ENDPOINTS.familyMember(person.id))
                        .then((response) => {
                          if (response.status !== 200) throw new Error('Failed to fetch member data');
                          const result: APIResponse<MemberDetail> = response.data;
                          setState({ data: result.data, loading: false, error: null });
                        })
                        .catch((error) => {
                          const errorMessage = error instanceof Error ? error.message : 'Failed to load member details';
                          setState({
                            data: null,
                            loading: false,
                            error: errorMessage
                          });
                        });
                    }
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Success State - Show Data */}
            {!state.loading && !state.error && displayPerson && (
              <>
                {/* Avatar and Name */}
                <div className="flex flex-col items-center mb-6">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold mb-3
                      ${displayPerson.death_date
                        ? 'bg-[#CBD5E1] dark:bg-blue-900/30 text-white dark:text-blue-400'
                        : displayPerson.gender === 'male'
                          ? 'bg-[#77CCF8] dark:bg-blue-900/30 text-white dark:text-blue-400'
                          : 'bg-[#F59FCC] dark:bg-pink-900/30 text-white dark:text-pink-400'
                      }`}
                  >
                    {getInitials(displayPerson.fullname)}
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 text-center">
                    {displayPerson.fullname}
                  </h3>
                  {displayPerson.nickname && (
                    <p className="text-sm italic text-zinc-600 dark:text-zinc-400 mt-1">
                      {displayPerson.nickname}
                    </p>
                  )}
                </div>

                {/* Details List */}
                <div className="space-y-4">
                  {/* Gender */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 text-zinc-500 dark:text-zinc-400">
                      <Image
                        src={displayPerson.gender === 'male' ? '/icons/male.svg' : '/icons/female.svg'}
                        width={20}
                        height={20}
                        alt="gender"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Gender</p>
                      <p className="text-base text-zinc-900 dark:text-zinc-50">
                        {displayPerson.gender === 'male' ? 'Pria' : 'Wanita'}
                      </p>
                    </div>
                  </div>

                  {/* Birth Date & Age */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5">
                      <svg className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Tanggal Lahir</p>
                      <p className="text-base text-zinc-900 dark:text-zinc-50">
                        {formattedBirthDate} {age !== null && `(${age} tahun)`}
                      </p>
                    </div>
                  </div>

                  {/* Domicile */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5">
                      <Image src="/icons/location.svg" width={20} height={20} alt="location" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Domisili</p>
                      <p className="text-base text-zinc-900 dark:text-zinc-50">
                        {displayPerson.detail.domicile || '-'}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp */}

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5">
                      <svg className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">WhatsApp</p>
                      <p className="text-base text-zinc-900 dark:text-zinc-50">
                        {displayPerson.detail.whatsapp_number ?? '-'}
                      </p>
                    </div>
                  </div>


                  {/* Job */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5">
                      <svg className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Pekerjaan</p>
                      <p className="text-base text-zinc-900 dark:text-zinc-50">
                        {displayPerson.detail.profession ?? '-'}
                      </p>
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>

          {/* Footer with Contact Button */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => {
                if (displayPerson?.detail.whatsapp_number) {
                  window.open(`https://wa.me/${displayPerson.detail.whatsapp_number.replace(/\D/g, '')}`, '_blank');
                }
              }}
              disabled={!displayPerson?.detail.whatsapp_number || state.loading}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Contact
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
