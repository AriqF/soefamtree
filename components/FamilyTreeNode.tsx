import React from 'react';
import { FamilyMember } from '@/types/family';
import Image from 'next/image';

interface FamilyTreeNodeProps {
  member: FamilyMember;
  spouse?: FamilyMember;
  isRoot?: boolean;
  nickname?: string;
  location?: string;
  relationshipLabel?: string;
  onPersonClick?: (person: FamilyMember) => void;
}

function getInitials(fullname: string): string {
  const parts = fullname.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return fullname.slice(0, 2).toUpperCase() || fullname.charAt(0).toUpperCase();
}

function getRelations(member: FamilyMember): string {
  let relation: string = '';
  switch (member.depth) {
    case 1:
      relation = "Anak";
      break;
    case 2:
      relation=  "Cucu";
      break;
    case 3:
      relation = "Cicit";
      break;
    default:
      relation = ''
      break;
  }
  
  return relation
}

export const FamilyTreeNode: React.FC<FamilyTreeNodeProps> = ({
  member,
  spouse,
  isRoot = false,
  nickname,
  relationshipLabel,
  onPersonClick,
}) => {
  const calculateAge = (birthDate?: string, deathDate?: string): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    return end.getFullYear() - birth.getFullYear();
  };

  const renderPerson = (person: FamilyMember, isLeft: boolean = false) => {
    const age = calculateAge(person.birthDate, person.deathDate);
    const ageText = age !== null ? `${age} thn` : '';

    return (
      <div
        onClick={() => onPersonClick?.(person)}
        className={`relative flex flex-col p-4 rounded-[16px] border border-[#F5F5F5] dark:border-zinc-700 shadow-md hover:shadow-lg transition-all duration-200 bg-white dark:bg-zinc-900 min-w-[240px] cursor-pointer ${isLeft ? 'mr-2' : ''} ${person.deathDate ? 'opacity-90' : 'opacity-100'}`}
      >
        {/* Wafat badge - top right */}
        {person.deathDate && (
          <div className="absolute top-0 right-0 rounded-tr-[16px] rounded-bl-lg px-3 py-1 text-xs font-medium bg-[#6B7280] dark:bg-zinc-600 text-white shadow-sm z-40">
            Wafat
          </div>
        )}

        <div className={`flex gap-3 flex-1 ${person.deathDate ? 'opacity-75' : ''}`}>
          {/* Avatar - left */}
          <div
            className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold 
              ${person.deathDate ? 'bg-[#CBD5E1] dark:bg-blue-900/30 text-white dark:text-blue-400' : person.gender === 'male'
                ? 'bg-[#77CCF8] dark:bg-blue-900/30 text-white dark:text-blue-400'
                : 'bg-[#F59FCC] dark:bg-pink-900/30 text-white dark:text-pink-400'
              }`}
          >
            {getInitials(person.fullname)}
          </div>

          {/* Personal details - right of avatar */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className={`font-[500] tracking-[-0.44] text-base text-[#0F172B] dark:text-zinc-50 leading-tight ${person.deathDate ? 'pr-20' : ''} truncate`}>
              {person.fullname} 
            </h3>
            {nickname && (
              <p className="text-sm italic text-[#62748E] dark:text-zinc-400 mt-0.5">
                {nickname}
              </p>
            )}

            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <Image src={'/icons/location.svg'} width={10} height={10} alt='loc'></Image>
              {person.domicile ?? '-'}
            </p>
            
          </div>
        </div>

        {/* Badges row - bottom */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
          {person.depth !== null && person.depth > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Image src={'/icons/users.svg'} width={10} height={10} alt='loc'></Image>
              {getRelations(person)}  
            </span>
          )}
          {ageText && (
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {ageText}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {person.gender === 'male' ? <Image src={'/icons/male.svg'} width={10} height={10} alt='loc'></Image> : <Image src={'/icons/female.svg'} width={10} height={10} alt='loc'></Image>}
            {person.gender === 'male' ? 'Pria' : 'Wanita'}
          </span>
        </div>
      </div>
    );
  };

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
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1"><Image src={'icons/love.svg'} alt={'love'} width={20} height={20}></Image></div>
            </div>
            {renderPerson(spouse)}
          </>
        )}
      </div>
    </div>
  );
};

