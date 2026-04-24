type MonthFormatOption = 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';

export function formatMonth(locale: string, format: MonthFormatOption = 'long') {
    return (month: number) =>
        new Intl.DateTimeFormat(locale, { month: format }).format(new Date(2000, month, 1));
}
