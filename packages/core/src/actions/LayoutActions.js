/**
 * Constants
 */
const SET_DEFINITION = 'layout@SET_DEFINITION';

/**
 * Actions creator
 */
const setDefinition = definition => ({
    type: SET_DEFINITION,
    payload: definition,
});

export {
    SET_DEFINITION,
    setDefinition,
};
