const BLOCKS = new Set([
    'BLOCKQUOTE',
    'BODY',
    'BR',
    'DIV',
    'FIGURE',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HR',
    'LI',
    'OL',
    'P',
    'PRE',
    'SCRIPT',
    'TABLE',
    'TBODY',
    'TD',
    'TR',
    'UL',
]);

function describe(node: Node, inPre: boolean): string {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? '';
        return inPre ? text : text.replace(/[ \t\r\n\f]+/g, ' ');
    }
    if (!(node instanceof Element)) {
        return '';
    }
    if (node instanceof HTMLElement && node.hasAttribute('style')) {
        // Styles as a browser writes them: `color: rgb(…);`
        node.style.cssText = node.getAttribute('style') ?? '';
    }
    const attributes = Array.from(node.attributes)
        .map((attribute) => `${attribute.name}="${attribute.value}"`)
        .sort()
        .join(' ');
    const pre = inPre || node.tagName === 'PRE';
    let content = Array.from(node.childNodes)
        .map((child) => describe(child, pre))
        .join('');
    if (!pre) {
        // Whitespace around blocks doesn't render.
        content = content.replace(/ ?(<\/?(\w+)[^>]*>) ?/g, (match, tag: string, name: string) =>
            BLOCKS.has(name.toUpperCase()) ? tag : match,
        );
        content = BLOCKS.has(node.tagName) ? content.trim() : content;
    }
    const name = node.tagName.toLowerCase();
    return `<${name}${attributes !== '' ? ` ${attributes}` : ''}>${content}</${name}>`;
}

/**
 * HTML in a form where two HTML strings that render the same are equal: entities decoded,
 * attributes sorted, styles as a browser writes them, whitespace collapsed outside `<pre>` and
 * dropped around blocks.
 */
export function equivalent(html: string | null): string {
    const body = new window.DOMParser().parseFromString(
        `<!doctype html><body>${html ?? ''}</body>`,
        'text/html',
    ).body;
    return describe(body, false);
}
