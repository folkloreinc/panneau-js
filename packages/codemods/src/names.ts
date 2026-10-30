/** The words of a name: `videoOrEmbed`, `video_or_embed`, `VideoOrEmbed` give video, or, embed. */
function words(name: string): string[] {
    return name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .split(/[^a-zA-Z0-9]+/)
        .filter((word) => word !== '')
        .map((word) => word.toLowerCase());
}

/** `VideoOrEmbed` for `video_or_embed`, as v4 looked components up by name. */
export function pascalCase(name: string): string {
    return words(name)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

/** `video-or-embed` for `VideoOrEmbed` or `video_or_embed`. */
export function kebabCase(name: string): string {
    return words(name).join('-');
}
