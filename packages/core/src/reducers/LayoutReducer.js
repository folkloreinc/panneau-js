import { SET_DEFINITION } from '../actions/LayoutActions';

const initialState = {
    definition: null,
};

const LayoutReducer = (previousState, action) => {
    const state = {
        ...initialState,
        ...(previousState || null),
    };

    switch (action.type) {
    case SET_DEFINITION: {
        return {
            ...state,
            definition: {
                ...action.payload,
            },
        };
    }
    default: {
        return state;
    }
    }
};

export default LayoutReducer;
