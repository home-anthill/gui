export function getPrettyDateFromUnixEpoch(unixEpoch: number): string {
  if (unixEpoch <= 0) {
    return '';
  }
  const date = new Date(unixEpoch);
  const padL = (nr: number, len = 2, chr = '0') => `${nr}`.padStart(2, chr);
  return `${
    padL(date.getHours())}:${
    padL(date.getMinutes())}:${
    padL(date.getSeconds())} ${
    padL(date.getDate())}/${
    padL(date.getMonth() + 1)}/${
    date.getFullYear()}`;
}
