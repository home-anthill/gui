import { describe, it, expect } from 'vitest';
import {
  getPrettyDateFromUnixEpoch,
  getPrettyDateFromDateString,
} from './dateUtils';

const DATE_FORMAT_REGEX = /^\d{2}:\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/;

describe('getPrettyDateFromUnixEpoch', () => {
  it('returns empty string for 0', () => {
    expect(getPrettyDateFromUnixEpoch(0)).toBe('');
  });

  it('returns empty string for negative values', () => {
    expect(getPrettyDateFromUnixEpoch(-1)).toBe('');
  });

  it('returns a formatted date string for a valid epoch', () => {
    const result = getPrettyDateFromUnixEpoch(1705318245000);
    expect(result).toMatch(DATE_FORMAT_REGEX);
  });
});

describe('getPrettyDateFromDateString', () => {
  it('returns a formatted date string from an ISO date string', () => {
    const result = getPrettyDateFromDateString('2024-01-15T12:30:45.000Z');
    expect(result).toMatch(DATE_FORMAT_REGEX);
  });

  it('returns correct year from a known date', () => {
    const result = getPrettyDateFromDateString('2024-06-20T00:00:00.000Z');
    expect(result).toContain('2024');
  });
});
