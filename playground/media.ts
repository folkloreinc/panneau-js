/**
 * The media library of the playground: images drawn in SVG, as data URLs, so that the media field,
 * the picker and the image editor have something to show without a network or a storage.
 */

type Values = Record<string, unknown>;

/** An SVG image as a data URL. */
function svg(width: number, height: number, content: string): string {
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(width)} ${String(height)}" width="${String(width)}" height="${String(height)}">${content}</svg>`,
    )}`;
}

const IMAGES = [
    {
        name: 'Harbour at dawn',
        alt: 'Boats in a harbour under an orange sky, a lighthouse on the right',
        file: 'harbour.svg',
        width: 1600,
        height: 1000,
        content:
            '<rect width="1600" height="620" fill="#e98a6b"/><circle cx="1180" cy="430" r="110" fill="#fde7b0"/><rect y="620" width="1600" height="380" fill="#2f5873"/><rect x="1060" y="300" width="70" height="340" fill="#f4efe6"/><rect x="1060" y="380" width="70" height="50" fill="#c8443b"/><path d="M220 700 h260 l-40 60 h-180 Z M560 720 h200 l-30 50 h-140 Z" fill="#1c3448"/>',
    },
    {
        name: 'Night market',
        alt: 'Stalls lit with lanterns at night',
        file: 'night-market.svg',
        width: 1200,
        height: 1200,
        content:
            '<rect width="1200" height="1200" fill="#1e1b4b"/><g fill="#fbbf24"><circle cx="200" cy="260" r="40"/><circle cx="420" cy="220" r="40"/><circle cx="640" cy="260" r="40"/><circle cx="860" cy="220" r="40"/><circle cx="1060" cy="260" r="40"/></g><path d="M0 330 Q600 150 1200 330" stroke="#fde68a" stroke-width="6" fill="none"/><g fill="#db2777"><rect x="120" y="700" width="280" height="300"/><rect x="460" y="660" width="280" height="340"/><rect x="800" y="700" width="280" height="300"/></g><rect y="1000" width="1200" height="200" fill="#312e81"/>',
    },
    {
        name: 'Rooftop garden',
        alt: 'Planters and a bench on a city rooftop',
        file: 'rooftop-garden.svg',
        width: 1000,
        height: 1500,
        content:
            '<rect width="1000" height="1500" fill="#bae6fd"/><rect y="900" width="1000" height="600" fill="#a8a29e"/><g fill="#16a34a"><circle cx="220" cy="820" r="140"/><circle cx="520" cy="780" r="170"/><circle cx="800" cy="840" r="120"/></g><g fill="#78350f"><rect x="120" y="880" width="200" height="140"/><rect x="400" y="880" width="240" height="140"/><rect x="700" y="880" width="200" height="140"/></g>',
    },
];

/** The items of the media library, ready as soon as they are listed. */
export function createPlaygroundMedia(): Values[] {
    return IMAGES.map(({ name, alt, file, width, height, content }, index) => {
        const url = svg(width, height, content);
        return {
            id: String(index + 1),
            name,
            alt: { en: alt, fr: alt },
            file: { name: file, url, mime: 'image/svg+xml', size: url.length },
            media: {
                type: 'image',
                mime: 'image/svg+xml',
                size: url.length,
                url,
                thumbnailUrl: url,
                width,
                height,
                status: 'ready',
            },
            createdAt: `2026-09-${String(10 + index).padStart(2, '0')}T12:00:00Z`,
        };
    });
}

/** The value of a `media` or `image` field that refers to an item of the library. */
export function mediaReference(item: Values): Values {
    return { id: item.id, label: item.name, media: item.media };
}
