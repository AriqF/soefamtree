'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/api-config';
import { AuthStorage } from '@/lib/secure-storage';
import { APIResponse } from '@/types/response';
import { GetBasicMember } from '@/types/member';

interface MemberSelectorProps {
  label: string;
  name: string;
  value: string; // ID as string
  displayValue: string; // Fullname to display
  onChange: (id: string, fullname: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function MemberSelector({
  label,
  name,
  value,
  displayValue,
  onChange,
  placeholder = 'Type to search...',
  required = false,
}: MemberSelectorProps) {
  const [searchQuery, setSearchQuery] = useState(displayValue);
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<GetBasicMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch members when search query changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() && isOpen) {
        fetchMembers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isOpen]);

  const fetchMembers = async (query: string) => {
    setIsLoading(true);
    try {
      const token = AuthStorage.getToken();
      const response = await axios.get<APIResponse<GetBasicMember[]>>(
        API_ENDPOINTS.member.selector(query),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code === 200 && response.data.data) {
        setMembers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);
    
    // Clear selection if user changes the text
    if (newValue !== displayValue) {
      onChange('', '');
    }
  };

  const handleSelect = (member: GetBasicMember) => {
    onChange(member.id.toString(), member.fullname);
    setSearchQuery(member.fullname);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('', '');
    setSearchQuery('');
    setMembers([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          name={name}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-2 pr-10 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
          placeholder={placeholder}
          autoComplete="off"
        />
        
        {/* Clear button */}
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" name={`${name}_id`} value={value} />

      {/* Dropdown */}
      {isOpen && searchQuery.trim() && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : members.length > 0 ? (
            <ul>
              {members.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(member)}
                    className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {member.fullname}
                    </div>
                    {member.nickname && (
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                        "{member.nickname}"
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 text-center">
              No members found
            </div>
          )}
        </div>
      )}

      {/* Selected value display */}
      {value && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Selected ID: {value}
        </p>
      )}
    </div>
  );
}
