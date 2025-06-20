/**
 * dayjs js
 * @module _dayjs
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-06-13
 * @requires dayjs : npm install dayjs
 * @version 1.0.1
 */
import dayjs from 'dayjs';

/**
 * Format a date string.
 * @param {string} date 
 * @param {string} format 
 * @returns 
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    if (typeof date === 'number') {
        return dayjs(String(date), "YYYYMMDD").format(format);
    }
    return dayjs(date).format(format);
}

export const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
export const today = () => dayjs().format('YYYY-MM-DD');
export const tomorrow = () => dayjs().add(1, 'day').format('YYYY-MM-DD');
export const yesterday = () => dayjs().subtract(1, 'day').format('YYYY-MM-DD');
export const isValidDate = (date) => dayjs(date).isValid();
export const isToday = (date) => dayjs(date).isSame(dayjs(), 'day');
export const isTomorrow = (date) => dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
export const isYesterday = (date) => dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
export const isFuture = (date) => dayjs(date).isAfter(dayjs(), 'day');
export const isPast = (date) => dayjs(date).isBefore(dayjs(), 'day');
export const addDays = (date, days) => dayjs(date).add(days, 'day').format('YYYY-MM-DD');
export const subtractDays = (date, days) => dayjs(date).subtract(days, 'day').format('YYYY-MM-DD');
export const getDayOfWeek = (date) => dayjs(date).format('dddd');
export const getMonthName = (date) => dayjs(date).format('MMMM');
export const getYear = (date) => dayjs(date).format('YYYY');
export const getDate = (date) => dayjs(date).format('DD');
export const getTime = (date) => dayjs(date).format('HH:mm:ss');
export const getUnixTimestamp = (date) => dayjs(date).unix();
export const getISODate = (date) => dayjs(date).toISOString();
export const getUTCDate = (date) => dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss');
export const getDuration = (start, end) => {
    const duration = dayjs.duration(dayjs(end).diff(dayjs(start)));
    return {
        days: duration.days(),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds()
    };
};
export const isSameDay = (date1, date2) => dayjs(date1).isSame(dayjs(date2), 'day');
export const isSameMonth = (date1, date2) => dayjs(date1).isSame(dayjs(date2), 'month');
export const isSameYear = (date1, date2) => dayjs(date1).isSame(dayjs(date2), 'year');
export const getWeekNumber = (date) => dayjs(date).week();
export const getQuarter = (date) => dayjs(date).quarter();
export const getStartOfDay = (date) => dayjs(date).startOf('day').format('YYYY-MM-DD HH:mm:ss');
export const getEndOfDay = (date) => dayjs(date).endOf('day').format('YYYY-MM-DD HH:mm:ss');
export const getStartOfMonth = (date) => dayjs(date).startOf('month').format('YYYY-MM-DD HH:mm:ss');
export const getEndOfMonth = (date) => dayjs(date).endOf('month').format('YYYY-MM-DD HH:mm:ss');
export const getStartOfYear = (date) => dayjs(date).startOf('year').format('YYYY-MM-DD HH:mm:ss');
export const getEndOfYear = (date) => dayjs(date).endOf('year').format('YYYY-MM-DD HH:mm:ss');
export const getDaysInMonth = (date) => dayjs(date).daysInMonth();
export const getDaysInYear = (date) => dayjs(date).isLeapYear() ? 366 : 365;
export const getWeekOfYear = (date) => dayjs(date).week();
export const getWeekOfMonth = (date) => Math.ceil(dayjs(date).date() / 7);
export const getWeekday = (date) => dayjs(date).day();
export const getWeekdayName = (date) => dayjs(date).format('dddd');
export const getMonth = (date) => dayjs(date).month() + 1; // month is 0-indexed
export const getMonthShortName = (date) => dayjs(date).format('MMM');
export const getMonthLongName = (date) => dayjs(date).format('MMMM');
export const getFormattedDate = (date, format = 'YYYY-MM-DD') => dayjs(date).format(format);    

export const parseDate = (dateString, format = 'YYYY-MM-DD') => dayjs(dateString, format).toDate();