/**
 * Constants
 */
export const UPDATE_LAYOUT = 'layout@UPDATE_LAYOUT';

/**
 * Actions creator
 */
export const updateLayout = layout => ({
    type: UPDATE_LAYOUT,
    payload: layout,
});
