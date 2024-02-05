import { formatDistanceToNow } from 'date-fns';

export function TimestampConverter(timestampValue: string | null) {
    if (timestampValue && typeof (timestampValue === 'string')) {
        const date = new Date(timestampValue);
        const formattedTimeAgo = formatDistanceToNow(date);
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
