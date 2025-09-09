"use client";

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// Virtual list implementation for efficient rendering
export function VirtualList({ 
  items, 
  renderItem, 
  parentHeight = '100%',
  estimateSize = 400 
}: {
  items: unknown[];
  renderItem: (index: number) => React.ReactNode;
  parentHeight?: string | number;
  estimateSize?: number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 3
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: parentHeight,
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {renderItem(virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}