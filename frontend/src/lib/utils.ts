import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getWeeksInMonth(year: number, month: number): number {
    const date = new Date(year, month, 1);
    let mondays = 0;
    while (date.getMonth() === month) {
        if (date.getDay() === 1) { // Monday
            mondays++;
        }
        date.setDate(date.getDate() + 1);
    }
    return mondays;
}
