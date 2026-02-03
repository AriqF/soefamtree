'use client';

import React, { useState } from 'react';
import { FamilyMember, FamilyTreeData, TreeNode } from '@/types/family';
import { FamilyTreeNode } from './FamilyTreeNode';
import { DraggableCanvas } from './DraggableCanvas';
import { PersonDrawer } from './PersonDrawer';

interface FamilyTreeProps {
  data: FamilyTreeData;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({ data }) => {
  const [selectedPerson, setSelectedPerson] = useState<FamilyMember | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handlePersonClick = (person: FamilyMember) => {
    setSelectedPerson(person);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };
  // Build tree structure from flat data
  const buildTree = (memberId: string, level: number = 0): TreeNode | null => {
    const member = data.members.find(m => m.id === memberId);
    if (!member) return null;

    const spouse = member.spouseId 
      ? data.members.find(m => m.id === member.spouseId)
      : undefined;

    const childrenIds = member.childrenIds || [];
    const children = childrenIds
      .map(childId => buildTree(childId, level + 1))
      .filter((child): child is TreeNode => child !== null);

    return {
      member,
      spouse,
      children,
      level,
    };
  };

  const rootNode = buildTree(data.rootId);

  if (!rootNode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="bg-[#F7F7F3] text-zinc-600 dark:text-zinc-400">No family tree data available</p>
      </div>
    );
  }

  // Render tree recursively
  const renderTree = (node: TreeNode): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const childCount = node.children.length;

    return (
      <div key={node.member.id} className="flex flex-col items-center">
        {/* Current node */}
        <FamilyTreeNode 
          member={node.member} 
          spouse={node.spouse}
          isRoot={node.level === 0}
          onPersonClick={handlePersonClick}
        />

        {/* Connector to children */}
        {hasChildren && (
          <div className="flex flex-col items-center">
            {/* Vertical line down from parent */}
            <div className="w-0.5 h-12 bg-zinc-400 dark:bg-zinc-600"></div>
            
            {/* Children container with positioning wrapper */}
            <div className="relative">
              <div className="flex gap-12">
                {node.children.map((child, index) => {
                  const isFirstChild = index === 0;
                  const isLastChild = index === childCount - 1;
                  const isSingleChild = childCount === 1;
                  
                  return (
                    <div key={child.member.id} className="flex flex-col items-center relative">
                      {/* Vertical connector line from horizontal bar to child */}
                      <div className="w-0.5 h-12 bg-zinc-400 dark:bg-zinc-600 relative">
                        {/* Horizontal line segment */}
                        {!isSingleChild && (
                          <>
                            {/* Left side of horizontal line */}
                            {!isFirstChild && (
                              <div className="absolute right-1/2 top-0 h-0.5 bg-zinc-400 dark:bg-zinc-600" 
                                   style={{ width: 'calc(24px + 70px)' }}></div>
                            )}
                            {/* Right side of horizontal line */}
                            {!isLastChild && (
                              <div className="absolute left-1/2 top-0 h-0.5 bg-zinc-400 dark:bg-zinc-600" 
                                   style={{ width: 'calc(24px + 70px)' }}></div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* Child node */}
                      {renderTree(child)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <DraggableCanvas>
        <div className="py-12 px-8 inline-block min-w-full">
          <div className="flex flex-col items-center">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {rootNode.member.fullname}  Family Tree
              </h1>
              {/* <p className="text-zinc-600 dark:text-zinc-400">
                Family
              </p> */}
            </div>

            {/* Tree visualization */}
            <div className="flex justify-center items-start">
              {renderTree(rootNode)}
            </div>

            {/* Legend */}
            {/* <div className="mt-12 flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 dark:border-blue-600 rounded"></div>
                <span>Male</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-pink-400 dark:border-pink-600 rounded"></div>
                <span>Female</span>
              </div>
              <div className="flex items-center gap-2">
                <span>♥</span>
                <span>Married</span>
              </div>
            </div> */}
          </div>
        </div>
      </DraggableCanvas>

      {/* Person Details Drawer */}
      <PersonDrawer
        person={selectedPerson}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
};

