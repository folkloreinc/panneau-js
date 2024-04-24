function checkClickable(el, options = {}, parentDistance = 1) {
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

    if (tags.map((it) => it.toLowerCase()).indexOf(tagName.toLowerCase()) !== -1) {
        return true;
    }

    if (parentDistance < maxParentDistance) {
        return checkClickable(parentNode, options, parentDistance + 1);
    }

    return false;
}

export default checkClickable;
