/**
 * Drags of the handle of a `ReorderList` (decision 0111), for play functions in Chromium. Test
 * drivers can't start a native drag in the frame of a story: the events of the browser's drag and
 * drop are dispatched, as a mouse would fire them.
 */

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Drags `handle` over `target`, and drops it at `clientY`, in the coordinates of the viewport. */
export async function dragHandle(handle: HTMLElement, target: HTMLElement, clientY: number) {
    const dataTransfer = new DataTransfer();
    // Outside of a real drag, a browser keeps the effects at "none": keep what is set, as in one
    const effects = { effectAllowed: 'uninitialized', dropEffect: 'none' };
    for (const name of ['effectAllowed', 'dropEffect'] as const) {
        Object.defineProperty(dataTransfer, name, {
            get: () => effects[name],
            set: (value: string) => {
                effects[name] = value;
            },
        });
    }
    const start = handle.getBoundingClientRect();
    const clientX = start.x + start.width / 2;
    const fire = (element: Element, type: string, y: number) =>
        element.dispatchEvent(
            new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                dataTransfer,
                clientX,
                clientY: y,
            }),
        );
    fire(handle, 'dragstart', start.y + start.height / 2);
    await nextFrame();
    fire(target, 'dragenter', clientY);
    fire(target, 'dragover', clientY);
    await nextFrame();
    fire(target, 'drop', clientY);
    fire(handle, 'dragend', clientY);
}

/** Once the items slid to their new places after a move. */
export async function afterSlides() {
    await Promise.all(document.getAnimations().map((animation) => animation.finished));
}
