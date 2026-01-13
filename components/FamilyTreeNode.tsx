import React from 'react';
import { FamilyMember } from '@/types/family';

interface FamilyTreeNodeProps {
  member: FamilyMember;
  spouse?: FamilyMember;
  isRoot?: boolean;
}

export const FamilyTreeNode: React.FC<FamilyTreeNodeProps> = ({ member, spouse, isRoot = false }) => {
  const calculateAge = (birthDate?: string, deathDate?: string): string => {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    
    if (deathDate) {
      return `(${age} years)`;
    }
    return `(${age} years old)`;
  };

  const formatDate = (date?: string): string => {
    if (!date) return '';
    return new Date(date).getFullYear().toString();
  };

  const renderPerson = (person: FamilyMember, isLeft: boolean = false) => (
    <div 
      className={`flex flex-col items-center p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 bg-white dark:bg-zinc-900 ${
        person.gender === 'male' 
          ? 'border-blue-400 dark:border-blue-600' 
          : 'border-pink-400 dark:border-pink-600'
      } hover:scale-105 min-w-[140px] ${isLeft ? 'mr-2' : ''} ${person.deathDate ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Avatar */}
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
        person.gender === 'male'
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
      }`}>
        <span className="text-2xl font-bold">
          {person.fullname.charAt(0)}
        </span>
      </div>

      {/* Name */}
      <div className="text-center">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
          {person.fullname}
        </h3>
      </div>

      {/* Dates */}
      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 text-center">
        <p>{formatDate(person.birthDate)} - {person.deathDate ? formatDate(person.deathDate) : 'Present'}</p>
        <p className="text-[10px] mt-0.5">{calculateAge(person.birthDate, person.deathDate)}</p>
      </div>

      {/* Deceased indicator */}
      {person.deathDate && (
        <div className="mt-2 text-[10px] text-zinc-500 dark:text-zinc-500">
          ✝
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {/* Couple or Single Person */}
      <div className="flex items-center justify-center gap-2">
        {renderPerson(member, !!spouse)}
        
        {spouse && (
          <>
            {/* Marriage connector */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-8 h-0.5 bg-zinc-400 dark:bg-zinc-600"></div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">♥</div>
            </div>
            {renderPerson(spouse)}
          </>
        )}
      </div>
    </div>
  );
};

