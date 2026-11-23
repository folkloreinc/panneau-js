/**
 * Drags and pastes of files, with native events, for tests in jsdom and play functions in
 * Chromium. A `DataTransfer` made by a script has no file entries, which drop zones skip: the
 * events carry as much of one as a drop zone reads.
 */
function transfer(files: readonly File[], text = '') {
    return {
        types: files.length > 0 ? ['Files'] : ['text/plain'],
        files,
        items: files.map((file) => ({
            kind: 'file',
            type: file.type,
            getAsFile: () => file,
        })),
        dropEffect: 'none',
        effectAllowed: 'all',
        getData: () => text,
        setData: () => undefined,
    };
}

function fire(target: Element, type: string, properties: Record<string, unknown>): boolean {
    const event = new Event(type, { bubbles: true, cancelable: true });
    for (const [key, value] of Object.entries(properties)) {
        Object.defineProperty(event, key, { value });
    }
    return target.dispatchEvent(event);
}

/** Drags files over an element, and drops them on it unless `drop` is false. */
export function dragFiles(target: Element, files: readonly File[], { drop = true } = {}) {
    const dataTransfer = transfer(files);
    const at = { dataTransfer, clientX: 1, clientY: 1 };
    fire(target, 'dragenter', at);
    fire(target, 'dragover', at);
    if (drop) {
        fire(target, 'drop', at);
    }
}

/** Pastes files, or text, on an element. False when the paste was handled (`preventDefault()`). */
export function pasteFiles(target: Element, files: readonly File[], text = ''): boolean {
    return fire(target, 'paste', { clipboardData: transfer(files, text) });
}
