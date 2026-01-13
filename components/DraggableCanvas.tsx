'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';

interface DraggableCanvasProps {
  children: ReactNode;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

export const DraggableCanvas: React.FC<DraggableCanvasProps> = ({
  children,
  minZoom = 0.3,
  maxZoom = 2,
  zoomStep = 0.1,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle mouse wheel zoom
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
    const newScale = Math.min(maxZoom, Math.max(minZoom, scale + delta));
    
    if (newScale !== scale) {
      // Zoom towards cursor position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleRatio = newScale / scale;
        
        setPosition(prev => ({
          x: mouseX - (mouseX - prev.x) * scaleRatio,
          y: mouseY - (mouseY - prev.y) * scaleRatio,
        }));
      }
      
      setScale(newScale);
    }
  };

  // Handle mouse down - start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Handle mouse move - dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  // Handle mouse up - stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom buttons
  const handleZoomIn = () => {
    setScale(prev => Math.min(maxZoom, prev + zoomStep));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(minZoom, prev - zoomStep));
  };

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Add wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [scale, position]);

  // Change cursor when dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-50 dark:bg-black">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {children}
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Zoom Controls */}
        <div className="flex flex-col gap-2 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-2 border border-zinc-200 dark:border-zinc-800">
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={scale >= maxZoom}
            className="w-10 h-10 flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom In"
          >
            <svg className="w-5 h-5 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={scale <= minZoom}
            className="w-10 h-10 flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out"
          >
            <svg className="w-5 h-5 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="w-10 h-10 flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Reset View"
          >
            <svg className="w-5 h-5 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Zoom Level Display */}
          <div className="text-center text-xs text-zinc-600 dark:text-zinc-400 py-1 border-t border-zinc-200 dark:border-zinc-800 mt-1">
            {Math.round(scale * 100)}%
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-zinc-900 rounded-lg shadow-lg px-4 py-3 border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">🖱️ Drag</span>
            <span>Click and drag to pan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">🔍 Zoom</span>
            <span>Mouse wheel to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
};

