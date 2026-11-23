import createDOMPurify from 'dompurify';

/**
 * Where links may point: `http`, `https`, `mailto`, `tel`, and relative URLs (no scheme). The
 * pattern of DOMPurify, without its other schemes (`ftp`, `sms`, `xmpp`…).
 */
const ALLOWED_URI = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

/**
 * DOMPurify for the rich text of the details of an item, an instance of its own so that its hooks
 * don't reach other users of DOMPurify on the page. HTML only (no SVG, no MathML), no `style` or
 * `class` attributes nor `<style>` blocks, which could restyle the admin, and no form controls:
 * the details are read-only.
 */
const purify = createDOMPurify(window);

purify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName !== 'A') {
        return;
    }
    // A link opens here or in a new tab, never in another frame, and a new tab gets no opener.
    if (node.getAttribute('target') === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
    } else {
        node.removeAttribute('target');
    }
});

/** The rich text of a value as HTML that is safe to render in the admin. */
export function sanitizeRichText(html: string): string {
    return purify.sanitize(html, {
        USE_PROFILES: { html: true },
        ALLOWED_URI_REGEXP: ALLOWED_URI,
        ADD_ATTR: ['target'],
        FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea', 'option'],
        FORBID_ATTR: ['style', 'class'],
        RETURN_TRUSTED_TYPE: false,
    });
}
