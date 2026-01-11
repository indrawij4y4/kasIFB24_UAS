
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Lucide from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Helper Hook for media query
function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);
    return matches;
}

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className
}) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center items-end md:items-center pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
                    />

                    {/* Sheet / Modal */}
                    <motion.div
                        initial={isDesktop ? { opacity: 0, scale: 0.95 } : { y: "100%" }}
                        animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0 }}
                        exit={isDesktop ? { opacity: 0, scale: 0.95 } : { y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn(
                            "relative z-10 bg-card shadow-2xl overflow-y-auto outline-none pointer-events-auto",
                            // Mobile Styles (Bottom Sheet)
                            "w-full rounded-t-[2rem] border-t border-border max-h-[85vh]",
                            // Desktop Styles (Centered Modal)
                            "md:w-full md:max-w-lg md:rounded-[2rem] md:border md:max-h-[85vh] md:m-4",
                            className
                        )}
                        drag={!isDesktop ? "y" : false}
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) {
                                onClose();
                            }
                        }}
                    >
                        {/* Handle bar for mobile dragging feel */}
                        <div className="flex justify-center pt-3 pb-1 md:hidden">
                            <div className="w-12 h-1.5 bg-muted rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                            <h3 className="text-lg font-bold text-foreground">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                            >
                                <Lucide.X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
