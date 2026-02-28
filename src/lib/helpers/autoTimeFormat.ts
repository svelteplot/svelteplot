import type { PlotScale } from '../types/index.js';
import { isDate } from './typeChecks.js';

const DATE_TIME: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    month: 'short',
    day: 'numeric'
};

const autoFormatDateTime = (locale: string, utc?: boolean) => {
    const format = new Intl.DateTimeFormat(locale, {
        ...DATE_TIME,
        ...(utc ? { timeZone: 'UTC' } : {})
    }).format;
    return (date: Date) => format(date).replace(', ', '\n');
};

const DAY_MONTH: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
};
const autoFormatDayMonth = (locale: string, utc?: boolean) => {
    const format = new Intl.DateTimeFormat(locale, {
        ...DAY_MONTH,
        ...(utc ? { timeZone: 'UTC' } : {})
    }).format;
    return (date: Date) => format(date).replace(' ', '\n');
};

const MONTH_YEAR: Intl.DateTimeFormatOptions = {
    month: 'short',
    year: 'numeric'
};

const autoFormatMonthYear = (locale: string, utc?: boolean) => {
    const format = new Intl.DateTimeFormat(locale, {
        ...MONTH_YEAR,
        ...(utc ? { timeZone: 'UTC' } : {})
    }).format;
    return (date: Date) => format(date).replace(' ', '\n');
};

export default function autoTimeFormat(x: PlotScale, plotWidth: number, plotLocale: string) {
    const utc = x.type === 'utc';
    const daysPer100Px =
        ((toNumber(x.domain[1] as Date) - toNumber(x.domain[0] as Date)) / plotWidth / 864e5) * 100;
    const format =
        daysPer100Px < 1
            ? autoFormatDateTime(plotLocale, utc)
            : daysPer100Px < 30
              ? autoFormatDayMonth(plotLocale, utc)
              : autoFormatMonthYear(plotLocale, utc);
    return (date: Date) => format(date).split('\n');
}

function toNumber(d: Date | string | number) {
    return isDate(d) ? d.getTime() : +d;
}
