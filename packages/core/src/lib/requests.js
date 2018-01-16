export class ResponseError extends Error {
    constructor(message, response) {
        super(message);
        this.name = 'ValidationError';
        this.response = response;
        this.status = response.status;
    }

    getResponse() {
        return this.response;
    }
}

export class ValidationError extends ResponseError {
    getErrors() {
        return this.response.json();
    }
}

export const throwResponseError = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    throw new ResponseError(response.statusText, response);
};

export const throwValidationError = (error) => {
    if (error instanceof ResponseError && error.status === 422) {
        throw new ValidationError(error.message, error.response);
    }
    throw error;
};
