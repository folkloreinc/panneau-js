import type { EmbedValue } from '@panneau/protocol';

/** Where `embed` fields get what a URL embeds: the backend, from the provider's oEmbed. */
export interface EmbedSource {
    resolve(url: string, options: { signal: AbortSignal }): Promise<EmbedValue>;
}

/** What `createEmbedSource()` needs from an adapter: the `resolveEmbed()` of `@panneau/data`. */
export interface EmbedAdapter {
    resolveEmbed?(url: string, options?: { signal?: AbortSignal }): Promise<EmbedValue>;
}

/**
 * The embed source of an adapter (`GET /embeds?url=`). Null when the adapter can't resolve
 * embeds: `embed` fields then keep the URL alone.
 */
export function createEmbedSource(adapter: EmbedAdapter): EmbedSource | null {
    const { resolveEmbed } = adapter;
    if (resolveEmbed === undefined) {
        return null;
    }
    return { resolve: (url, { signal }) => resolveEmbed.call(adapter, url, { signal }) };
}
