interface CheckClickableOptions {
    maxParentDistance?: number;
    tags?: string[];
}

interface ElementLike {
    tagName?: string | null;
    parentNode?: ElementLike | null;
    dataset?: Record<string, unknown>;
}

function checkClickable(
    el: ElementLike | null,
    options: CheckClickableOptions = {},
    parentDistance: number = 1,
): boolean {
    const { maxParentDistance = 5, tags = ['BUTTON', 'A', 'INPUT', 'I', 'TEXTAREA'] } =
        options || {};
    const { tagName = null, parentNode = null, dataset = {} } = el || {};

    if (tagName === 'BODY') {
        return false;
    }

    // Check if video is suspended
    // if (
    //     tagName === 'VIDEO' &&
    //     typeof dataset.isSuspended !== 'undefined' &&
    //     (dataset.isSuspended === 'true' || dataset.isSuspended === true)
    // ) {
    //     return true;
    // }

    if (tagName && tags.map((it) => it.toLowerCase()).indexOf(tagName.toLowerCase()) !== -1) {
        return true;
    }

    if (parentDistance < maxParentDistance) {
        return checkClickable(parentNode, options, parentDistance + 1);
    }

    return false;
}

export default checkClickable;
