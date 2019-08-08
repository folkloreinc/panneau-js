import Cookies from 'js-cookie';

export class ResponseError extends Error {
    constructor(message, responseData, status) {
        super(message);
        this.name = 'ResponseError';
        this.responseData = responseData;
        this.status = status;
    }

    getResponseData() {
        return this.responseData;
    }
}

export class ValidationError extends ResponseError {
    constructor(message, responseData, status) {
        super(message, responseData, status);
        this.name = 'ValidationError';
    }

    getErrors() {
        return this.responseData;
    }
}

export const getResponseAndDataObject = response =>
    response.json().then(data => ({
        data,
        response,
    }));

export const getErrorsFromResponseError = error => {
    const { name, responseData = {}, message = null } = error;
    if (name === 'ValidationError') {
        return responseData.errors || responseData;
    }
    if (name === 'ResponseError') {
        return responseData.error || responseData;
    }
    return message;
};

export const throwResponseError = responseObject => {
    const { response, data } = responseObject;
    if (response.status >= 200 && response.status < 300) {
        return data;
    }
    throw new ResponseError(response.statusText, data, response.status);
};

export const throwValidationError = error => {
    if (error.name === 'ResponseError' && error.status === 422) {
        throw new ValidationError(error.message, error.responseData, error.status);
    }
    throw error;
};

export const getJSON = (url, opts) => {
    const { headers, ...options } = opts || {};
    return fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            ...(headers || null),
        },
        ...(options || null),
    })
        .then(getResponseAndDataObject)
        .then(throwResponseError);
};

export const postJSON = (url, data, opts) => {
    const { headers, ...options } = opts || {};
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(headers || null),
        },
        body: JSON.stringify(data),
        ...(options || null),
    })
        .then(getResponseAndDataObject)
        .then(throwResponseError)
        .catch(throwValidationError);
};

export const getXSRFToken = () => {
    const cookies = Cookies.get();
    return cookies['X-XSRF-TOKEN'] || null;
};

const getCsrfToken = name => {
    const metaName = name || 'csrf-token';
    const metas = [].slice.call(document.getElementsByTagName('meta'));
    return metas.reduce(
        (val, meta) =>
            meta.getAttribute('name') === metaName ? meta.getAttribute('content') : val,
        null,
    );
};

export const getCSRFHeaders = name => {
    const XSRF = getXSRFToken();
    if (XSRF !== null) {
        return {
            'X-XSRF-TOKEN': XSRF,
        };
    }
    const CSRF = getCsrfToken(name);
    if (CSRF !== null) {
        return {
            'X-CSRF-TOKEN': CSRF,
        };
    }
    return null;
};
