import { useState, useMemo, useCallback } from 'react';
import { getCsrfToken, postJSON, getCSRFHeaders } from '@folklore/fetch';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';

// prettier-ignore
const getFieldsPropsFromFields = (fields, {
    value, errors, onChange, ...props
}) => fields.reduce(
    (allFields, field) => {
        const {
            name = isString(field) ? field : null,
            component = null,
        } = isObject(field) ? field : {};
        return [
            ...allFields,
            {
                ...(isObject(field) ? field : null),
                name,
                component,
                value: value !== null ? value[name] || null : null,
                errors: errors !== null ? errors[name] || null : null,
                onChange: fieldValue => onChange(name, fieldValue),
                ...props,
            },
        ];
    },
    [],
);

const useForm = (opts = {}) => {
    const {
        fields = [],
        action = null,
        postForm = null,
        initialErrors = null,
        errors: providedErrors = null,
        setErrors: setProvidedErrors = null,
        initialGeneralError = null,
        generalError: providedGeneralError = null,
        setGeneralError: setProvidedGeneralError = null,
        initialValue = null,
        value: providedValue = null,
        setValue: setProvidedValue = null,
        onComplete = null,
    } = opts;

    const [stateValue, setStateValue] = useState(initialValue || providedValue);
    const [stateErrors, setStateErrors] = useState(initialErrors || providedErrors);
    const [stateGeneralError, setStateGeneralError] = useState(
        initialGeneralError || providedGeneralError,
    );
    const [requestState, setRequestState] = useState({
        success: false,
        loading: false,
        error: false,
    });
    const [response, setResponse] = useState(null);

    const hasProvidedValue = setProvidedValue !== null;
    const value = hasProvidedValue ? providedValue : stateValue;
    const setValue = hasProvidedValue ? setProvidedValue : setStateValue;

    const hasProvidedErrors = setProvidedErrors !== null;
    const errors = hasProvidedErrors ? providedErrors : stateErrors;
    const setErrors = hasProvidedErrors ? setProvidedErrors : setStateErrors;

    const hasProvidedGeneralError = setProvidedGeneralError !== null;
    const generalError = hasProvidedGeneralError ? providedGeneralError : stateGeneralError;
    const setGeneralError = hasProvidedGeneralError
        ? setProvidedGeneralError
        : setStateGeneralError;

    const fieldsKey = [value, errors].concat(fields);
    const onFieldChange = useCallback((fieldName, fieldValue) => {
        const fieldErrors = errors !== null ? errors[fieldName] || null : null;
        if (fieldErrors !== null) {
            setErrors({
                ...errors,
                [fieldName]: null,
            });
        }
        setValue({
            ...value,
            [fieldName]: fieldValue,
        });
    }, fieldsKey);
    const fieldsProps = useMemo(
        () => getFieldsPropsFromFields(fields, { value, errors, onChange: onFieldChange }),
        fieldsKey,
    );

    const csrfToken = useMemo(() => getCsrfToken(), []);

    const onSubmitError = (error) => {
        setRequestState({
            success: false,
            loading: false,
            error: true,
        });
        if (error.name === 'ValidationError') {
            const { errors: validationErrors = null } = error.getResponseData();
            setErrors(validationErrors);
        } else {
            setGeneralError(error.message);
        }
    };

    const onSubmitSuccess = (resp) => {
        setRequestState({
            success: true,
            loading: false,
            error: false,
        });
        setResponse(resp);
        onComplete(resp);
    };

    const finalPostForm = useCallback(
        (postAction, postData) =>
            postForm !== null
                ? postForm(postAction, postData)
                : postJSON(postAction, postData, {
                      credentials: 'include',
                      headers: getCSRFHeaders(),
                  }),
        [postForm, postJSON, getCSRFHeaders],
    );

    const submit = useCallback(
        (submitValue = value) => {
            setRequestState({
                success: false,
                loading: true,
                error: false,
            });
            setGeneralError(null);
            setErrors(null);

            finalPostForm(action, {
                ...submitValue,
                _token: csrfToken,
            })
                .then(onSubmitSuccess)
                .catch(onSubmitError);
        },
        [finalPostForm, action, value],
    );

    const onSubmit = useCallback(
        (e) => {
            e.preventDefault();
            submit();
        },
        [submit],
    );

    let status = null;
    if (requestState.loading) {
        status = 'loading';
    } else if (requestState.success) {
        status = 'success';
    } else if (requestState.error) {
        status = 'error';
    }

    return {
        value,
        setValue,
        csrfToken,
        submit,
        onSubmit,
        ...requestState,
        status,
        response,
        fields: fieldsProps,
        errors,
        generalError,
    };
};

export default useForm;
