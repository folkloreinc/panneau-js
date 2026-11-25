import { describe, expect, it } from 'vitest';

import {
    formatTimeZone,
    formatTimeZoneOffset,
    formatTimeZoneShort,
    getTimeZoneName,
} from './timeZones';

const OCTOBER = new Date('2026-10-15T12:00:00Z');
const NOVEMBER = new Date('2026-11-15T12:00:00Z');

describe('time zones', () => {
    it('gives the offset at a date, which changes with daylight saving time', () => {
        expect(formatTimeZoneOffset('America/Toronto', OCTOBER)).toBe('UTC−4');
        expect(formatTimeZoneOffset('America/Toronto', NOVEMBER)).toBe('UTC−5');
        expect(formatTimeZoneOffset('Asia/Kolkata', OCTOBER)).toBe('UTC+5:30');
        expect(formatTimeZoneOffset('UTC', OCTOBER)).toBe('UTC');
    });

    it('names the zone in the locale, the same name all year', () => {
        expect(formatTimeZone('America/Toronto', 'en-US', OCTOBER)).toBe('Eastern Time (UTC−4)');
        expect(formatTimeZone('America/Toronto', 'en-US', NOVEMBER)).toBe('Eastern Time (UTC−5)');
        expect(formatTimeZone('America/Montreal', 'fr-CA', OCTOBER)).toBe('heure de l’Est (UTC−4)');
        expect(formatTimeZone('Europe/Paris', 'fr', OCTOBER)).toBe(
            'heure d’Europe centrale (UTC+2)',
        );
    });

    it('gives the zone in short: its offset and its id', () => {
        expect(formatTimeZoneShort('America/Toronto', OCTOBER)).toBe('UTC−4 · America/Toronto');
        expect(formatTimeZoneShort('America/Toronto', NOVEMBER)).toBe('UTC−5 · America/Toronto');
        expect(formatTimeZoneShort('UTC', OCTOBER)).toBe('UTC');
        expect(formatTimeZoneShort('Etc/GMT+5', OCTOBER)).toBe('UTC−5');
    });

    it('falls back on the city of the zone, or the offset alone', () => {
        expect(getTimeZoneName('UTC', 'en-US', OCTOBER)).toBeNull();
        expect(getTimeZoneName('Etc/GMT+5', 'en-US', OCTOBER)).toBeNull();
        expect(formatTimeZone('Etc/GMT+5', 'en-US', OCTOBER)).toBe('UTC−5');
        expect(formatTimeZone('UTC', 'en-US', OCTOBER)).toBe('UTC');
        expect(getTimeZoneName('Not/A_Zone', 'en-US', OCTOBER)).toBe('A Zone');
    });
});
