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

export const throwResponseError = (responseObject) => {
    const { response, data } = responseObject;
    if (response.status >= 200 && response.status < 300) {
        return data;
    }
    throw new ResponseError(response.statusText, data, response.status);
};

export const throwValidationError = (error) => {
    if (error.name === 'ResponseError' && error.status === 422) {
        throw new ValidationError(error.message, error.responseData, error.status);
    }
    throw error;
};
