"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCornerDownRight, FiEdit2, FiHeart, FiMessageCircle, FiSend, FiTrash2, FiX } from "react-icons/fi";

const ADMIN_NAME = "Thiago Battista";

interface Comment {
    id: string;
    content: string;
    authorName: string;
    likes: number;
    isAdmin: boolean;
    createdAt: string;
    replies?: Comment[];
    parentId?: string;
}

interface CommentSystemProps {
    imageId: string;
    layout: "floating" | "sidebar";
    isOpen?: boolean;
    onClose?: () => void;
    onSwitchLayout?: () => void;
}

// Generate or retrieve a persistent anonymous token
function getAuthorToken(): string {
    if (typeof window === "undefined") return "";
    let token = localStorage.getItem("commenter-token");
    if (!token) {
        token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("commenter-token", token);
    }
    return token;
}

export default function CommentSystem({ imageId, layout, isOpen, onClose, onSwitchLayout }: CommentSystemProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState<string>("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedName = localStorage.getItem("commenter-name") || "";
        setUserName(savedName);
        fetchComments();
    }, [imageId]);

    useEffect(() => {
        if (scrollRef.current && layout === "sidebar") {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments, layout]);

    const checkIsAdmin = () => {
        if (typeof window === "undefined") return false;
        return !!localStorage.getItem("admin_password");
    };

    const isAdminUser = checkIsAdmin() || userName.trim() === ADMIN_NAME;

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/photos/${imageId}/comments`);
            if (res.ok) {
                const data = await res.json();
                const sorted = data.sort((a: Comment, b: Comment) => {
                    if (a.isAdmin && !b.isAdmin) return -1;
                    if (!a.isAdmin && b.isAdmin) return 1;
                    return b.likes - a.likes;
                });
                setComments(sorted);
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newComment.trim() || isLoading) return;

        if (!userName?.trim()) {
            return alert("Por favor, insira seu nome para comentar.");
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/photos/${imageId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: newComment,
                    parentId: replyTo?.id || null,
                    authorName: userName,
                    authorToken: getAuthorToken(),
                    isAdmin: isAdminUser,
                }),
            });

            if (res.ok) {
                const created = await res.json();
                if (created?.id) trackOwnComment(created.id);
                setNewComment("");
                setReplyTo(null);
                await fetchComments();
            }
        } catch (err) {
            console.error("Error posting comment:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Tem certeza que deseja excluir este comentário?")) return;
        try {
            const res = await fetch(`/api/photos/${imageId}/comments`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commentId,
                    authorToken: getAuthorToken(),
                    adminPassword: localStorage.getItem("admin_password") || undefined,
                }),
            });
            if (res.ok) await fetchComments();
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };

    const handleEdit = async (commentId: string) => {
        if (!editContent.trim()) return;
        try {
            const res = await fetch(`/api/photos/${imageId}/comments`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commentId,
                    content: editContent,
                    authorToken: getAuthorToken(),
                }),
            });
            if (res.ok) {
                setEditingId(null);
                setEditContent("");
                await fetchComments();
            }
        } catch (err) {
            console.error("Error editing comment:", err);
        }
    };

    const handleLike = async (commentId: string) => {
        try {
            setComments(prev => {
                const updateLikes = (items: Comment[]): Comment[] =>
                    items.map(c => {
                        if (c.id === commentId) return { ...c, likes: c.likes + 1 };
                        if (c.replies) return { ...c, replies: updateLikes(c.replies) };
                        return c;
                    });
                return updateLikes(prev);
            });
            await fetch(`/api/photos/comments/${encodeURIComponent(commentId)}/like`, { method: "POST" });
        } catch (err) {
            console.error("Error liking comment:", err);
        }
    };

    const canDelete = (comment: Comment) => {
        if (isAdminUser) return true;
        // Check token — we only know our own token
        const token = typeof window !== "undefined" ? localStorage.getItem("commenter-token") : null;
        // Since token is stripped from API response, we can only detect ownership client-side
        // So we store a map of comment IDs we authored
        const owned = JSON.parse(localStorage.getItem("my-comment-ids") || "[]");
        return owned.includes(comment.id);
    };

    const canEdit = (comment: Comment) => {
        const owned = JSON.parse(localStorage.getItem("my-comment-ids") || "[]");
        return owned.includes(comment.id);
    };

    // Track our own posted comments
    const trackOwnComment = (id: string) => {
        const owned = JSON.parse(localStorage.getItem("my-comment-ids") || "[]");
        owned.push(id);
        localStorage.setItem("my-comment-ids", JSON.stringify(owned));
    };

    const CommentItem = ({ comment, isReply = false, isFloating = false }: { comment: Comment; isReply?: boolean; isFloating?: boolean }) => (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className={`group mb-2 pointer-events-auto ${isReply ? "ml-6 border-l-2 border-white/10 pl-4" : ""} ${isFloating ? "max-w-[80%]" : "w-full"}`}
        >
            {!isFloating && (
                <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white/50">{comment.authorName}</span>
                        {comment.isAdmin && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-black border border-blue-500/30 flex items-center gap-1 uppercase tracking-tighter">
                                <div className="size-1 bg-blue-400 rounded-full animate-pulse" />
                                ADM
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        {/* Edit/Delete buttons — visible on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canEdit(comment) && editingId !== comment.id && (
                                <button
                                    onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                                    className="text-white/30 hover:text-white/80 transition-colors"
                                    title="Editar"
                                >
                                    <FiEdit2 size={11} />
                                </button>
                            )}
                            {canDelete(comment) && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="text-white/30 hover:text-red-400 transition-colors"
                                    title="Excluir"
                                >
                                    <FiTrash2 size={11} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex flex-col ${isFloating ? "items-start" : ""}`}>
                {isFloating && (
                    <div className="flex items-center gap-1.5 mb-1 ml-2">
                        <span className="text-[10px] font-bold text-white/40">{comment.authorName}</span>
                        {comment.isAdmin && <span className="text-[8px] text-blue-400 font-bold uppercase tracking-tight">ADM</span>}
                    </div>
                )}

                {editingId === comment.id ? (
                    <div className="flex gap-2 w-full items-center">
                        <input
                            autoFocus
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleEdit(comment.id); if (e.key === "Escape") { setEditingId(null); } }}
                            className="flex-grow bg-white/10 border border-white/30 rounded-xl py-1.5 px-3 text-sm text-white focus:outline-none focus:border-white/50 font-sans"
                        />
                        <button onClick={() => handleEdit(comment.id)} className="text-green-400 hover:text-green-300"><FiCheck size={15} /></button>
                        <button onClick={() => setEditingId(null)} className="text-white/40 hover:text-white"><FiX size={15} /></button>
                    </div>
                ) : (
                    <p className={`text-sm md:text-base text-white/90 bg-white/10 backdrop-blur-md p-3 rounded-2xl break-words shadow-lg border border-white/5 font-sans leading-relaxed ${isFloating ? "rounded-bl-none" : "rounded-tl-none inline-block max-w-full"} ${comment.isAdmin ? "border-blue-500/20" : ""}`}>
                        {comment.content}
                    </p>
                )}
            </div>

            {!isFloating && editingId !== comment.id && (
                <div className="flex items-center gap-4 mt-2">
                    <button
                        onClick={() => handleLike(comment.id)}
                        className="flex items-center gap-1 text-[10px] text-white/40 hover:text-red-400 transition-colors"
                    >
                        <FiHeart className={comment.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                        {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                    {!isReply && (
                        <button
                            onClick={() => setReplyTo(comment)}
                            className="text-[10px] text-white/40 hover:text-blue-400"
                        >
                            Responder
                        </button>
                    )}
                </div>
            )}

            {comment.replies?.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply isFloating={isFloating} />
            ))}
        </motion.div>
    );

    if (layout === "sidebar") {
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={typeof window !== "undefined" && window.innerWidth < 768 ? { y: "100%" } : { x: "100%" }}
                        animate={typeof window !== "undefined" && window.innerWidth < 768 ? { y: 0 } : { x: 0 }}
                        exit={typeof window !== "undefined" && window.innerWidth < 768 ? { y: "100%" } : { x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 right-0 w-full md:w-80 h-[70vh] md:h-full bg-black/95 md:bg-black/90 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 z-[10005] flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)] md:rounded-l-3xl rounded-t-3xl overflow-hidden pointer-events-auto font-sans"
                    >
                        {/* Header with title + name input + close */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 gap-3">
                            <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-widest whitespace-nowrap shrink-0">
                                <FiMessageCircle /> Comentários
                            </h3>
                            <input
                                type="text"
                                placeholder="Seu nome"
                                className="flex-grow min-w-0 bg-white/10 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-white/30 transition-colors font-sans placeholder:text-white/30"
                                value={userName}
                                onChange={(e) => {
                                    setUserName(e.target.value);
                                    localStorage.setItem("commenter-name", e.target.value);
                                }}
                            />
                            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors shrink-0">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                            {comments.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-white/20">
                                    <FiMessageCircle size={40} className="mb-2" />
                                    <p className="text-sm">Seja o primeiro a comentar!</p>
                                </div>
                            ) : (
                                comments.map(c => <CommentItem key={c.id} comment={c} />)
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10 bg-black/80 flex flex-col gap-2">
                            {replyTo && (
                                <div className="mb-1 flex justify-between items-center bg-blue-500/10 p-2 rounded text-xs text-blue-400">
                                    <span>Respondendo a <b>{replyTo.authorName}</b></span>
                                    <button onClick={() => setReplyTo(null)}><FiX /></button>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="relative flex-grow">
                                <input
                                    type="text"
                                    placeholder="Escreva um comentário..."
                                    className="w-full bg-white/10 border border-white/10 rounded-full py-2 px-4 pr-10 text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-sans"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white disabled:opacity-30"
                                >
                                    <FiSend size={14} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    // Floating Layout
    const latestComments = comments.slice(-3);

    return (
        <div className="relative flex flex-col items-start w-full max-w-lg mx-auto pointer-events-none font-sans">
            <div
                className="w-full mb-6 flex flex-col items-start gap-3 pointer-events-auto cursor-pointer"
                onClick={onSwitchLayout}
            >
                <AnimatePresence mode="popLayout">
                    {latestComments.map(c => (
                        <CommentItem key={c.id} comment={c} isFloating />
                    ))}
                </AnimatePresence>
            </div>

            <div className="w-full pointer-events-auto mt-auto flex flex-col gap-2">
                {replyTo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-blue-300 w-fit"
                    >
                        <FiCornerDownRight />
                        <span>Respondendo a <b>{replyTo.authorName}</b></span>
                        <button onClick={() => setReplyTo(null)} className="hover:text-white"><FiX /></button>
                    </motion.div>
                )}
                <div className="flex gap-2 items-end">
                    <div className="flex flex-col gap-1">
                        <input
                            type="text"
                            placeholder="Seu nome"
                            className="bg-white/10 border border-white/20 rounded-2xl py-2 px-3 text-sm text-white focus:outline-none focus:border-white/40 backdrop-blur-xl transition-all shadow-xl w-24 md:w-32 font-sans"
                            value={userName}
                            onChange={(e) => {
                                setUserName(e.target.value);
                                localStorage.setItem("commenter-name", e.target.value);
                            }}
                        />
                    </div>
                    <form onSubmit={handleSubmit} className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Comentar..."
                            className="w-full bg-white/10 border border-white/20 rounded-full py-2 md:py-3.5 px-4 md:px-6 pr-12 text-sm md:text-base text-white focus:outline-none focus:border-white/40 backdrop-blur-xl transition-all shadow-2xl font-sans"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-1.5 md:p-2 rounded-full hover:bg-blue-400 transition-colors shadow-lg disabled:opacity-30"
                        >
                            <FiSend size={14} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
