import { useState, useRef, useEffect, useMemo } from 'react';
import * as Lucide from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchableSelectProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    label,
    placeholder = 'Cari...',
    className,
    disabled = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;
        const lowerQuery = searchQuery.toLowerCase();
        return options.filter(option =>
            option.label.toLowerCase().includes(lowerQuery)
        );
    }, [options, searchQuery]);

    // Get current selected label
    const selectedLabel = useMemo(() => {
        return options.find(opt => opt.value === value)?.label || '';
    }, [options, value]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchQuery('');
    };

    const handleClose = () => {
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <>
            {/* Trigger Button - Simple selection display */}
            <div className={cn("relative", className)}>
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(true)}
                    disabled={disabled}
                    className={cn(
                        "w-full flex items-center gap-3 rounded-xl border-2 bg-background px-4 py-4 text-left font-medium transition-all min-h-[56px]",
                        "border-border hover:border-primary/50 hover:bg-muted/30",
                        disabled && "opacity-50 cursor-not-allowed",
                        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Lucide.Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground font-medium mb-0.5">{label}</div>
                        <div className={cn(
                            "text-base truncate",
                            selectedLabel ? "text-foreground font-semibold" : "text-muted-foreground"
                        )}>
                            {selectedLabel || 'Klik untuk memilih...'}
                        </div>
                    </div>
                    {value && (
                        <span
                            role="button"
                            onClick={handleClear}
                            className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                        >
                            <Lucide.X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </span>
                    )}
                </button>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={handleClose}
                    />

                    {/* Modal Card */}
                    <div className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                        {/* Header */}
                        <div className="p-5 border-b border-border bg-muted/30">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Lucide.Users className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">{label}</h3>
                                        <p className="text-xs text-muted-foreground">{options.length} mahasiswa tersedia</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                                >
                                    <Lucide.X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <Lucide.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="w-full bg-background text-foreground border-2 border-border rounded-xl pl-12 pr-4 py-3 text-base font-medium outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                                    placeholder={placeholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-[300px] overflow-y-auto p-3">
                            {filteredOptions.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={cn(
                                                "w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-3",
                                                value === option.value
                                                    ? "bg-primary text-primary-foreground shadow-lg"
                                                    : "hover:bg-muted text-foreground"
                                            )}
                                        >
                                            <span className="truncate">{option.label}</span>
                                            {value === option.value && (
                                                <Lucide.Check className="w-5 h-5 flex-shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-12 text-center">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Lucide.Search className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">Tidak ada hasil ditemukan</p>
                                    <p className="text-muted-foreground/60 text-xs mt-1">Coba kata kunci lain</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
