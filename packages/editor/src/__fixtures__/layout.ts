/*
 * What ProseMirror measures, which jsdom doesn't lay out: the editor scrolls the selection into
 * view and finds positions from coordinates. Empty rectangles are enough for tests.
 */
const emptyRect = () => new DOMRect(0, 0, 0, 0);
const emptyRects = () => [] as unknown as DOMRectList;

if (typeof Range.prototype.getClientRects !== 'function') {
    Range.prototype.getClientRects = emptyRects;
    Range.prototype.getBoundingClientRect = emptyRect;
}
if (typeof document.elementFromPoint !== 'function') {
    document.elementFromPoint = () => null;
}
