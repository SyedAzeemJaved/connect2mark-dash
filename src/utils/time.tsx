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
