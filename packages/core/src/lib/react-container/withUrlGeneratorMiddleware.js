const WITH_URL_GENERATOR = 'WITH_URL_GENERATOR';

const createUrlGeneratorMiddleware = urlGenerator => store => next => (action) => {
    if (typeof action.type === 'undefined' || action.type !== WITH_URL_GENERATOR) {
        return next(action);
    }
    return next(dispatch => action.payload(urlGenerator, dispatch, store));
};

export { WITH_URL_GENERATOR };
export default createUrlGeneratorMiddleware;
