import type { PreviewProps } from '@panneau/core';
import type { Item } from '@panneau/protocol';

import styles from './previews.module.css';

function text(value: unknown, locale: string): string {
    if (typeof value === 'string') {
        return value;
    }
    if (value !== null && typeof value === 'object') {
        const localized = (value as Record<string, unknown>)[locale];
        return typeof localized === 'string' ? localized : '';
    }
    return '';
}

function stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}

/**
 * The preview of a page as the site would render it, with its blocks: what a project's plugin
 * registers in `previews` for `{ "mode": "component", "component": "page" }`.
 */
export function PagePreview({ item, locale }: PreviewProps) {
    const blocks = Array.isArray(item.blocks) ? (item.blocks as Record<string, unknown>[]) : [];
    return (
        <article className={styles.page}>
            <p className={styles.kicker}>Northwind Journal</p>
            <h1 className={styles.title}>{text(item.title, locale)}</h1>
            {blocks.map((block, index) =>
                block.type === 'text' ? (
                    <p key={index} className={styles.paragraph}>
                        {stripTags(text(block.body, locale))}
                    </p>
                ) : (
                    <div key={index} className={styles.image} role="img" aria-label="Image" />
                ),
            )}
        </article>
    );
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}

/**
 * The page of an article on the site, as a `data:` URL: what the mock backend returns for the
 * iframe previews of `{ "mode": "iframe" }`, where a real backend returns a signed URL.
 */
export function articlePreviewUrl(item: Item): string {
    const label = (value: unknown) =>
        value !== null && typeof value === 'object' && 'label' in value
            ? String((value as { label: unknown }).label)
            : '';
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(String(item.title ?? ''))}</title>
<style>
body { margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #1c1917; background: #fffbf5; }
header { padding: 14px 32px; border-bottom: 3px double #1c1917; font: 700 13px/1 system-ui; letter-spacing: .2em; text-transform: uppercase; }
main { max-width: 640px; margin: 0 auto; padding: 40px 32px; }
.category { font: 700 12px/1 system-ui; letter-spacing: .12em; text-transform: uppercase; color: #b45309; }
h1 { font-size: 42px; line-height: 1.1; margin: 12px 0 16px; }
.meta { font: 14px/1.4 system-ui; color: #57534e; }
.lead { font-size: 20px; line-height: 1.6; margin-top: 28px; }
.photo { margin-top: 28px; aspect-ratio: 16 / 9; background: linear-gradient(135deg, #fde68a, #fb923c 55%, #7c2d12); border-radius: 4px; }
</style></head>
<body><header>Northwind Journal</header><main>
<p class="category">${escapeHtml(label(item.category))}</p>
<h1>${escapeHtml(String(item.title ?? ''))}</h1>
<p class="meta">By ${escapeHtml(label(item.author))} · ${escapeHtml(String(item.published_at ?? ''))}</p>
<div class="photo"></div>
<p class="lead">${escapeHtml(String(item.summary || 'A story from the city, its people and its places.'))}</p>
</main></body></html>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}
