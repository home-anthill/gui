const padL = (nr: number) => `${nr}`.padStart(2, '0');

function formatDate(date: Date): string {
  return `${padL(date.getHours())}:${padL(date.getMinutes())}:${padL(date.getSeconds())} ${padL(date.getDate())}/${padL(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function getPrettyDateFromUnixEpoch(unixEpoch: number): string {
  if (unixEpoch <= 0) {
    return '';
  }
  return formatDate(new Date(unixEpoch));
}

export function getPrettyDateFromDateString(dateString: string): string {
  return formatDate(new Date(dateString));
}