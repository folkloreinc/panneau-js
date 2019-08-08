import { SET_USER } from '../actions/AuthActions';

const initialState = {
    user: null,
};

const AuthReducer = (previousState = initialState, action) => {
    const state = previousState;

    switch (action.type) {
        case SET_USER: {
            return {
                ...state,
                user: action.payload,
            };
        }
        default: {
            return state;
        }
    }
};

export default AuthReducer;
