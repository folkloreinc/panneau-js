import type { MediaReference } from '@panneau/protocol';

import type { EditedImage } from '../editor/types';

// Images drawn in SVG, for the editor's tests and stories: no network, and subjects to crop.

const svg = (width: number, height: number, content: string) =>
    `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(width)} ${String(height)}" width="${String(width)}" height="${String(height)}">${content}</svg>`,
    )}`;

/** A harbour at dawn: a lighthouse on the right third, the sun above it, boats on the left. */
const harbourScene = `
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2d3a6b"/><stop offset="0.55" stop-color="#e98a6b"/><stop offset="1" stop-color="#f7c98b"/>
  </linearGradient>
  <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3f6f8f"/><stop offset="1" stop-color="#1c3448"/>
  </linearGradient>
</defs>
<rect width="4000" height="3000" fill="url(#sky)"/>
<circle cx="3050" cy="1250" r="260" fill="#fde7b0"/>
<path d="M0 1900 L600 1500 L1100 1750 L1600 1450 L2200 1900 Z" fill="#5b4a6b"/>
<rect y="1900" width="4000" height="1100" fill="url(#sea)"/>
<g>
  <rect x="2620" y="950" width="170" height="1000" fill="#f4efe6"/>
  <rect x="2620" y="1150" width="170" height="130" fill="#c8443b"/>
  <rect x="2620" y="1450" width="170" height="130" fill="#c8443b"/>
  <rect x="2620" y="1750" width="170" height="130" fill="#c8443b"/>
  <rect x="2590" y="860" width="230" height="100" fill="#2b2b2b"/>
  <circle cx="2705" cy="820" r="70" fill="#ffe28a"/>
  <path d="M2520 1950 L2900 1950 L2860 2050 L2560 2050 Z" fill="#3b3b3b"/>
</g>
<g fill="#20232b">
  <path d="M700 2250 L1150 2250 L1080 2340 L760 2340 Z"/><rect x="900" y="1950" width="18" height="300"/>
  <path d="M918 1980 L1100 2220 L918 2220 Z" fill="#f4efe6"/>
  <path d="M1350 2450 L1700 2450 L1650 2520 L1400 2520 Z"/><rect x="1510" y="2220" width="14" height="230"/>
</g>
<g stroke="#f7c98b" stroke-width="10" opacity="0.5">
  <path d="M2600 2150 h220 M2560 2300 h300 M2500 2480 h420"/>
</g>`;

/** A hiker below a tall pine, in portrait. */
const hikerScene = `
<defs>
  <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8ec5e8"/><stop offset="1" stop-color="#e6f2f7"/>
  </linearGradient>
</defs>
<rect width="3024" height="4032" fill="url(#sky2)"/>
<path d="M0 2500 L900 1500 L1600 2200 L2300 1300 L3024 2300 V4032 H0 Z" fill="#7d93a8"/>
<path d="M0 3000 L3024 2700 V4032 H0 Z" fill="#5f8a4f"/>
<g fill="#2f5d3a">
  <path d="M2150 600 L2650 1500 L2350 1500 L2800 2300 L2450 2300 L2900 3100 L1400 3100 L1850 2300 L1500 2300 L1950 1500 L1650 1500 Z"/>
</g>
<rect x="2100" y="3100" width="120" height="350" fill="#5a3d2b"/>
<g fill="#2b2b33">
  <circle cx="1100" cy="2560" r="95"/>
  <path d="M1000 2670 h200 l60 520 h-90 l-40 480 h-60 l-20 -420 l-20 420 h-60 l-40 -480 h-90 Z"/>
  <rect x="1180" y="2700" width="170" height="260" rx="40" fill="#c8443b"/>
</g>`;

/** A file stored sideways, as a phone may save it: rotated a quarter turn counterclockwise. */
const sideways = (width: number, height: number, scene: string) =>
    svg(height, width, `<g transform="translate(0 ${String(width)}) rotate(-90)">${scene}</g>`);

export const harbour: EditedImage = {
    label: 'harbour at dawn',
    url: svg(4000, 3000, harbourScene),
    width: 4000,
    height: 3000,
};

/**
 * A portrait stored sideways (4032 × 3024), which its library turns upright with its own
 * transform: a quarter turn clockwise.
 */
export const hiker: EditedImage = {
    label: 'hiker under the pine',
    url: sideways(3024, 4032, hikerScene),
    width: 4032,
    height: 3024,
    mediaTransform: { rotate: 90 },
};

/** A 16:9 crop of the harbour, on the lighthouse, with its focal point. */
export const harbourBanner = {
    crop: { x: 1100, y: 600, width: 2800, height: 1575 },
    focalPoint: { x: 0.68, y: 0.4 },
};

/** A reference to one of these images, as a field value holds it. */
export function referenceTo(
    image: EditedImage,
    id: string,
    overrides: Partial<MediaReference> = {},
): MediaReference {
    return {
        id,
        resource: 'media',
        label: image.label,
        media: {
            type: 'image',
            mime: 'image/jpeg',
            url: image.url,
            thumbnailUrl: image.url,
            width: image.width,
            height: image.height,
            ...(image.mediaTransform !== undefined && image.mediaTransform !== null
                ? { transform: image.mediaTransform }
                : {}),
        },
        ...overrides,
    };
}
