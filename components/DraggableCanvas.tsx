'use client';

import React, { ReactNode, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Image from 'next/image';

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
  const [currentScale, setCurrentScale] = useState(1);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-50 dark:bg-black">
      <TransformWrapper
        initialScale={1}
        minScale={minZoom}
        maxScale={maxZoom}
        centerOnInit={true}
        wheel={{ step: zoomStep }}
        doubleClick={{ disabled: false, step: 0.3 }}
        pinch={{ step: 5 }}
        panning={{
          velocityDisabled: true,
        }}
        alignmentAnimation={{
          disabled: false,
          sizeX: 100,
          sizeY: 100,
        }}
        onTransformed={(ref) => {
          setCurrentScale(ref.state.scale);
        }}
      >
        {({ zoomIn, zoomOut, resetTransform, instance }) => (
          <>
            {/* Canvas with TransformComponent */}
            <TransformComponent
              wrapperClass="w-full h-full"
              contentClass="w-full h-full"
              wrapperStyle={{
                width: '100%',
                height: '100%',
                cursor: 'grab',
              }}
            >
              <div className="inline-block">
                {children}
              </div>
            </TransformComponent>

            {/* Control Panel */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
              {/* Zoom Controls */}
              <div className="flex gap-2 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-2 border border-zinc-200 dark:border-zinc-800">
                {/* Zoom In */}
                <button
                  onClick={() => zoomIn()}
                  disabled={currentScale >= maxZoom}
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-zinc-300 dark:active:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <Image 
                    src={'/icons/zoom_in.svg'} 
                    alt={'zoom_in'} 
                    width={20} 
                    height={20} 
                    className='w-5 h-5'
                  />
                </button>

                {/* Zoom Level Display */}
                <div className="min-w-[3rem] flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {Math.round(currentScale * 100)}%
                </div>

                {/* Zoom Out */}
                <button
                  onClick={() => zoomOut()}
                  disabled={currentScale <= minZoom}
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-zinc-300 dark:active:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <Image 
                    src={'/icons/zoom_out.svg'} 
                    alt={'zoom_out'} 
                    width={20} 
                    height={20} 
                    className='w-5 h-5'
                  />
                </button>
              </div>
            </div>

            {/* Instructions - Hidden on mobile */}
            <div className="hidden md:block absolute bottom-4 left-4 bg-white dark:bg-zinc-900 rounded-lg shadow-lg px-4 py-3 border border-zinc-200 dark:border-zinc-800 pointer-events-auto">
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

            {/* Mobile Instructions */}
            <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 rounded-lg shadow-lg px-4 py-2 border border-zinc-200 dark:border-zinc-800 pointer-events-auto">
              <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">👆 Touch:</span> Drag to pan, pinch to zoom
              </div>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

