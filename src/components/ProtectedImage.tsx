"use client";

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface ProtectedImageProps extends Omit<ImageProps, 'onContextMenu' | 'onDragStart'> {
    showOverlay?: boolean;
}

export function ProtectedImage({ showOverlay = true, className, ...props }: ProtectedImageProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isFill = (props as any).fill;

    return (
        <div
            className={`relative overflow-hidden ${isFill ? 'h-full w-full' : ''} ${className || ''}`}
            onContextMenu={(e) => e.preventDefault()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Image
                {...(props as any)}
                onDragStart={(e: any) => e.preventDefault()}
                className={`pointer-events-none select-none ${isFill ? 'object-cover' : ''} ${className || ''}`}
            />

            {/* Transparent Protective Overlay */}
            <div className="absolute inset-0 z-10 bg-transparent cursor-default" />

            {/* Visual protection indicator on hover (optional) */}
            {showOverlay && isHovered && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-black/5">
                    <span className="text-white/20 font-black text-[10px] uppercase tracking-widest rotate-[-45deg] select-none">
                        Protegido
                    </span>
                </div>
            )}
        </div>
    );
}
