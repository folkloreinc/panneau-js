/**
 * Constants
 */
const SET_USER = 'auth@SET_USER';

/**
 * Actions creator
 */
const setUser = user => ({
    type: SET_USER,
    payload: user,
});

export {
    SET_USER,
    setUser,
};
