import { formatDistanceToNow } from 'date-fns';

const MILLISECONDS_IN_A_DAY = 86400000;

export const daysFromToday = (days: number): Date => {
    const today = new Date();

    return new Date(today.getTime() + days * MILLISECONDS_IN_A_DAY);
};

export function TimestampConverter(timestampValue: string | undefined | null) {
    if (timestampValue && typeof timestampValue === 'string') {
        // Parse the timestamp and convert it to UTC
        const date = new Date(timestampValue);
        const utcDate = new Date(date.getTime() + date.getTimezoneOffset());

        const formattedTimeAgo = formatDistanceToNow(utcDate);
        return `${formattedTimeAgo} ago`;
    } else {
        return 'Never';
    }
}

export function convertTo24HourUTC(time12Hour: string): string {
    const date = new Date();
    const [time, meridiem] = time12Hour.split(' ');

    let [hours, minutes] = time.split(':').map(Number);

    if (meridiem.toLowerCase() === 'pm') {
        hours = hours === 12 ? 12 : hours + 12;
    } else {
        hours = hours === 12 ? 0 : hours;
    }

    date.setHours(hours, minutes, 0, 0);
    return date.toISOString().split('T')[1].substring(0, 8); // Extracting HH:MM:SS
}

export function convertToUTCDate(inputDate: string): string {
    const date = new Date(inputDate);
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    return utcDate.toISOString().split('T')[0]; // Extracts YYYY-MM-DD from the ISO string
}

export const convertUTCTimeToLocalTime = (time: string): string => {
    const _ = new Date();

    const hours = parseInt(time.slice(0, 2));
    const minutes = parseInt(time.slice(3, 5));
    const seconds = parseInt(time.slice(6, 8));

    // NOTE:
    // This does not return local time

    // As the time is already in UTC, we need to offset it with local time when creating a new Date object
    // Other wise the already UTC time is again converted to UTC, that means the offset it applied twice

    // new Date(year, monthIndex, day, hours, minutes, seconds)
    return new Date(
        _.getUTCFullYear(),
        _.getUTCMonth(),
        _.getUTCDate(),
        hours - _.getTimezoneOffset() / 60,
        minutes,
        seconds,
    )
        .toTimeString()
        .slice(0, 8);
};

export function getCurrentDayString(
    day: number,
):
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | null {
    // Expects a JS Date day, expects a value between 0 and 6
    // 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on
    if (day === 0) {
        return 'sunday';
    } else if (day === 1) {
        return 'monday';
    } else if (day === 2) {
        return 'tuesday';
    } else if (day === 3) {
        return 'wednesday';
    } else if (day === 4) {
        return 'thursday';
    } else if (day === 5) {
        return 'friday';
    } else if (day === 6) {
        return 'saturday';
    }
    return null;
}

export const formatDateToApiFormatString = (date: Date): string => {
    const [year, month, _date] = date.toISOString().slice(0, 10).split('-');

    return `${year}-${month}-${_date}`;
};
