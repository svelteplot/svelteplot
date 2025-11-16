import type { PlotScale } from '$lib/types/index.js';
import { isDate } from '$lib/helpers/typeChecks.js';

const DATE_TIME: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    month: 'short',
    day: 'numeric'
};

const autoFormatDateTime = (locale: string) => {
    const format = new Intl.DateTimeFormat(locale, DATE_TIME).format;
    return (date: Date) => format(date).replace(', ', '\n');
};

const DAY_MONTH: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
};
const autoFormatDayMonth = (locale: string) => {
    const format = new Intl.DateTimeFormat(locale, DAY_MONTH).format;
    return (date: Date) => format(date).replace(' ', '\n');
};

const MONTH_YEAR: Intl.DateTimeFormatOptions = {
    month: 'short',
    year: 'numeric'
};

const autoFormatMonthYear = (locale: string) => {
    const format = new Intl.DateTimeFormat(locale, MONTH_YEAR).format;
    return (date: Date) => format(date).replace(' ', '\n');
};

export default function autoTimeFormat(x: PlotScale, plotWidth: number, plotLocale: string) {
    const daysPer100Px =
        ((toNumber(x.domain[1] as Date) - toNumber(x.domain[0] as Date)) / plotWidth / 864e5) * 100;
    const format =
        daysPer100Px < 1
            ? autoFormatDateTime(plotLocale)
            : daysPer100Px < 30
              ? autoFormatDayMonth(plotLocale)
              : autoFormatMonthYear(plotLocale);
    return (date: Date) => format(date).split('\n');
}

function toNumber(d: Date | string | number) {
    return isDate(d) ? d.getTime() : +d;
}
