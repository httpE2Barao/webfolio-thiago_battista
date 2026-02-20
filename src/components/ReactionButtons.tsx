"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
    { type: "LOVE", emoji: "❤️", label: "Amei" },
    { type: "HAHA", emoji: "😂", label: "Engraçado" },
    { type: "WOW", emoji: "😮", label: "Uau" },
    { type: "SAD", emoji: "😢", label: "Triste" },
];

interface FloatingReaction {
    id: number;
    emoji: string;
}

interface ReactionButtonsProps {
    imageId: string;
    initialReactions?: Record<string, number>;
    onReact: (type: ReactionType) => void;
}

export default function ReactionButtons({
    imageId,
    initialReactions = {},
    onReact
}: ReactionButtonsProps) {
    const [counts, setCounts] = useState<Record<string, number>>(initialReactions);
    const [driftingReactions, setDriftingReactions] = useState<FloatingReaction[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [userReaction, setUserReaction] = useState<ReactionType | null>(null);

    useEffect(() => {
        // Initialize userId and userReaction from localStorage
        const savedName = localStorage.getItem("commenter-name");
        let storedId = localStorage.getItem("user-reaction-id");

        if (!storedId) {
            storedId = savedName
                ? `${savedName}-${Math.random().toString(36).substring(2, 6)}`
                : Math.random().toString(36).substring(2, 15);
            localStorage.setItem("user-reaction-id", storedId);
        }
        setUserId(storedId);

        const storedUserReactions = JSON.parse(localStorage.getItem("user-reactions-map") || "{}");
        setUserReaction(storedUserReactions[imageId] || null);

        const fetchCounts = async () => {
            try {
                const res = await fetch(`/api/photos/${imageId}/reactions`);
                if (res.ok) {
                    const data = await res.json();
                    setCounts(data);
                }
            } catch (err) {
                console.error("Error fetching reaction counts:", err);
            }
        };
        fetchCounts();

        const handleExternalReact = (e: any) => {
            if (e.detail?.imageId === imageId) {
                handleReact(e.detail.type || "LOVE");
            }
        };

        window.addEventListener("external-react", handleExternalReact);
        return () => window.removeEventListener("external-react", handleExternalReact);
    }, [imageId]);

    const handleReact = async (type: ReactionType) => {
        if (!userId) return;

        const previousReaction = userReaction;

        // Optimistic UI Update
        setCounts(prev => {
            const next = { ...prev };
            // Increment new one
            if (previousReaction !== type) {
                next[type] = (next[type] || 0) + 1;
            }
            // Decrement old one if it was different
            if (previousReaction && previousReaction !== type) {
                next[previousReaction] = Math.max(0, (next[previousReaction] || 0) - 1);
            }
            // If clicking same one, it will be removed (handled by API toggle)
            if (previousReaction === type) {
                next[type] = Math.max(0, (next[type] || 0) - 1);
            }
            return next;
        });

        const newReaction = previousReaction === type ? null : type;
        setUserReaction(newReaction);

        // Save to localStorage
        const storedUserReactions = JSON.parse(localStorage.getItem("user-reactions-map") || "{}");
        if (newReaction) {
            storedUserReactions[imageId] = newReaction;
        } else {
            delete storedUserReactions[imageId];
        }
        localStorage.setItem("user-reactions-map", JSON.stringify(storedUserReactions));

        onReact(type);

        // Create drifting animation (only if adding/switching, not removing)
        if (newReaction) {
            const emoji = REACTIONS.find(r => r.type === type)?.emoji || "👍";
            const id = Date.now() + Math.random();
            setDriftingReactions(prev => [...prev, { id, emoji }]);
            setTimeout(() => {
                setDriftingReactions(prev => prev.filter(r => r.id !== id));
            }, 2000);
        }

        try {
            const res = await fetch(`/api/photos/${imageId}/reactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, userId }),
            });

            if (res.ok) {
                // Fetch actual counts from server to be sure
                const data = await res.json();
                // If the response is the reaction object, we should probably re-fetch all counts
                // to maintain consistency with the grouped counts format.
                const countRes = await fetch(`/api/photos/${imageId}/reactions`);
                if (countRes.ok) {
                    const updatedCounts = await countRes.json();
                    setCounts(updatedCounts);
                }
            } else {
                // Rollback on error
                setUserReaction(previousReaction);
                // ... potentially rollback counts too, but a re-fetch is safer
            }
        } catch (err) {
            console.error("Error sending reaction:", err);
            setUserReaction(previousReaction);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Drifting Emojis Layer */}
            <div className="absolute inset-0 pointer-events-none z-[10005]">
                <AnimatePresence>
                    {driftingReactions.map(reaction => (
                        <motion.span
                            key={reaction.id}
                            initial={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                            animate={{
                                opacity: 0,
                                y: -200,
                                scale: 2.5,
                                x: (Math.random() - 0.5) * 60
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute left-1/2 -top-10 -translate-x-1/2 text-2xl"
                        >
                            {reaction.emoji}
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>

            {/* Direct Reaction Buttons List */}
            <div className="flex flex-col items-center gap-2 md:gap-3">
                {REACTIONS.map((reaction) => {
                    const isActive = userReaction === reaction.type;
                    return (
                        <button
                            key={reaction.type}
                            onClick={() => handleReact(reaction.type)}
                            className={`group relative flex flex-col items-center gap-1 p-2 md:p-3 rounded-full transition-all backdrop-blur-md border shadow-lg active:scale-90 ${isActive
                                ? "bg-white/30 border-white ring-2 ring-white/20"
                                : "bg-white/5 border-white/5 hover:bg-white/20"
                                }`}
                        >
                            <span className={`text-xl md:text-3xl filter transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'drop-shadow-md group-hover:scale-125'}`}>
                                {reaction.emoji}
                            </span>
                            {counts[reaction.type] > 0 && (
                                <span className={`text-[9px] md:text-[11px] font-bold px-1.5 md:px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-black' : 'text-white/50 bg-black/40'}`}>
                                    {counts[reaction.type]}
                                </span>
                            )}
                            {/* Label on Hover */}
                            <span className="absolute right-full mr-3 px-2 py-1 bg-black/80 text-white text-[10px] md:text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {reaction.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
