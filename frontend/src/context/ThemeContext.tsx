import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark";

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
    theme: "dark",
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme: _defaultTheme = "dark",
    storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
    // Always default to dark, ignore storage for now or force it
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const root = window.document.documentElement;

        // Clean up classes
        root.classList.remove("light", "dark");

        // Always add dark
        root.classList.add("dark");

        // Save to storage to be consistent (optional, but good practice)
        localStorage.setItem(storageKey, "dark");
    }, [theme, storageKey]);

    const value = {
        theme,
        setTheme: (_theme: Theme) => {
            // No-op or just set to dark
            setTheme("dark");
        },
    };

    return (
        <ThemeProviderContext.Provider value={value} >
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
