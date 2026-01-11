import React from 'react';
import { createPortal } from 'react-dom';
import * as Lucide from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export type ModalType = 'success' | 'detail' | 'confirm' | 'error' | 'info';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    description: string;
    type?: ModalType;
    confirmLabel?: string;
    cancelLabel?: string;
    children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type = 'info',
    confirmLabel = 'Oke',
    cancelLabel = 'Batal',
    children
}) => {
    if (typeof document === 'undefined') return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <Lucide.CheckCircle className="w-8 h-8 text-emerald-500" />;
            case 'error': return <Lucide.XCircle className="w-8 h-8 text-rose-500" />;
            case 'confirm': return <Lucide.HelpCircle className="w-8 h-8 text-primary" />;
            case 'info': return <Lucide.Info className="w-8 h-8 text-blue-500" />;
            default: return <Lucide.Info className="w-8 h-8 text-blue-500" />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case 'success': return 'bg-emerald-50 dark:bg-emerald-900/20';
            case 'error': return 'bg-rose-50 dark:bg-rose-900/20';
            case 'confirm': return 'bg-blue-50 dark:bg-blue-900/20';
            case 'info': return 'bg-muted';
            default: return 'bg-muted';
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-card border border-border rounded-[28px] w-full max-w-[400px] p-6 shadow-2xl relative z-10 text-center max-h-[85vh] overflow-y-auto"
                    >
                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6", getIconBg())}>
                            {getIcon()}
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{description}</p>

                        {children}

                        <div className="flex gap-3 mt-8">
                            {onConfirm ? (
                                <>
                                    <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl text-muted-foreground font-bold border-border bg-transparent hover:bg-muted">{cancelLabel}</Button>
                                    <Button onClick={() => { onConfirm(); }} className="flex-1 h-12 rounded-2xl bg-primary text-white font-bold">{confirmLabel}</Button>
                                </>
                            ) : (
                                <Button onClick={onClose} className="w-full h-12 rounded-2xl bg-primary text-white font-bold">{confirmLabel}</Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
