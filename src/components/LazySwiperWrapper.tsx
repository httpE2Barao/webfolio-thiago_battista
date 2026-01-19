"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface LazySwiperWrapperProps {
    children: ReactNode;
    /** Height of placeholder when not yet visible */
    height?: string;
    /** Root margin for intersection observer (load earlier) */
    rootMargin?: string;
    /** Optional className for the wrapper */
    className?: string;
}

/**
 * Wrapper component that delays rendering of swiper until visible in viewport.
 * Reduces initial page load and improves scroll performance.
 */
export default function LazySwiperWrapper({
    children,
    height = "400px",
    rootMargin = "200px",
    className = "",
}: LazySwiperWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    setHasBeenVisible(true);
                    // Once visible, we can disconnect to save resources
                    observer.disconnect();
                }
            },
            {
                rootMargin,
                threshold: 0,
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [rootMargin]);

    return (
        <div ref={containerRef} className={className} style={{ minHeight: height }}>
            {hasBeenVisible ? (
                children
            ) : (
                <div
                    className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse rounded-lg flex items-center justify-center"
                    style={{ height }}
                >
                    <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
