import { getCSRFHeaders, getCsrfToken, postJSON } from '@folklore/fetch';
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';
import type { FormEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { Field } from '@panneau/core/types';

type FieldInput = string | Field;

interface FieldErrors {
    [key: string]: string[] | FieldErrors;
}

interface FieldValue {
    [key: string]: unknown;
}

interface FieldProps extends Record<string, unknown> {
    value: FieldValue | null;
    errors: FieldErrors | null;
    onChange: (name: string, fieldValue: unknown) => void;
}

interface ProcessedField extends Field {
    name: string | null;
    component: string | null;
    value: unknown;
    errors: string[] | null;
    onChange: (fieldValue: unknown) => void;
    fields?: ProcessedField[] | null;
}

// prettier-ignore
const getFieldsPropsFromFields = (
    fields: FieldInput[],
    { value, errors, onChange, ...props }: FieldProps,
    locales: string[] = [],
): ProcessedField[] => fields.reduce<ProcessedField[]>(
    (allFields, field) => {
        const {
            name = isString(field) ? field : null,
            fields: fieldFields = null,
            component = null,
        } = isObject(field) ? (field as Field) : {};

        const fieldErrors = errors !== null ? (errors[name as string] as string[] | undefined) || [] : [];

        const finalErrors = component === 'localized' ? (locales || []).reduce((previousErrors: string[], locale: string) => {
            const items = errors !== null ? get(errors, `${name}.${locale}`, []) || [] : [];
            const finalItems = isArray(items) ? items : [items];
            const finalPrevious = isArray(previousErrors) ? previousErrors : [];
            return [
                ...finalPrevious,
                ...finalItems,
            ];
        }, fieldErrors) : fieldErrors;

        let subfieldErrors: FieldErrors | null = errors;
        if (errors !== null && name !== null) {
            subfieldErrors = Object.keys(errors).reduce<FieldErrors>((acc, key) => {
                if (key === name) {
                    acc[key] = errors[key];
                }
                if (key.startsWith(`${name}.`) || key.startsWith(`${name}[`)) {
                    const finalKey = key.substring(name.length + 1);
                    acc[finalKey] = errors[key];
                }
                return acc;
            }, {});
        }

        return [
            ...allFields,
            {
                ...(isObject(field) ? (field as Field) : null),
                name,
                component,
                value: value !== null && name !== null ? value[name] || null : null,
                errors: finalErrors.length > 0 ? finalErrors : null,
                onChange: (fieldValue: unknown) => onChange(name as string, fieldValue),
                fields: fieldFields !== null ? getFieldsPropsFromFields(
                    fieldFields as FieldInput[],
                    {
                        value: value !== null && name !== null && isObject(value[name])
                            ? (value[name] as FieldValue)
                            : null,
                        errors: subfieldErrors,
                        onChange
                    },
                    locales,
                ) : null,
                ...props,
            },
        ];
    },
    [],
);

interface ValidationError extends Error {
    name: 'ValidationError';
    getResponseData: () => { errors?: FieldErrors };
}

interface RequestState {
    success: boolean;
    loading: boolean;
    error: boolean;
}

interface UseFormOptions {
    fields?: FieldInput[];
    action?: string | null;
    postForm?: ((action: string, data: Record<string, unknown>) => Promise<unknown>) | null;
    initialErrors?: FieldErrors | null;
    errors?: FieldErrors | null;
    setErrors?: ((errors: FieldErrors | null) => void) | null;
    initialGeneralError?: string | null;
    generalError?: string | null;
    setGeneralError?: ((error: string | null) => void) | null;
    initialValue?: FieldValue | null;
    value?: FieldValue | null;
    setValue?: ((value: FieldValue) => void) | null;
    withoutDefault?: boolean;
    withoutPropagation?: boolean;
    onComplete?: ((response: unknown) => void) | null;
    onError?: ((error: Error) => void) | null;
    locales?: string[];
}

interface UseFormReturn extends RequestState {
    value: FieldValue | null;
    setValue: (value: FieldValue) => void;
    csrfToken: string | null;
    submit: (submitValue?: FieldValue | null) => void;
    onSubmit: (e: FormEvent) => void;
    status: 'loading' | 'success' | 'error' | null;
    response: unknown;
    fields: ProcessedField[];
    errors: FieldErrors | null;
    generalError: string | null;
}

const useForm = (opts: UseFormOptions = {}): UseFormReturn => {
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
        withoutDefault = true,
        withoutPropagation = true,
        onComplete = null,
        onError = null,
        locales = [],
    } = opts;

    const [stateValue, setStateValue] = useState<FieldValue | null>(initialValue || providedValue);
    const [stateErrors, setStateErrors] = useState<FieldErrors | null>(
        initialErrors || providedErrors,
    );
    const [stateGeneralError, setStateGeneralError] = useState<string | null>(
        initialGeneralError || providedGeneralError,
    );
    const [requestState, setRequestState] = useState<RequestState>({
        success: false,
        loading: false,
        error: false,
    });
    const [response, setResponse] = useState<unknown>(null);

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

    const onFieldChange = useCallback(
        (fieldName: string, fieldValue: unknown) => {
            const {
                loading = false,
                success = false,
                error: requestError = false,
            } = requestState || {};
            const fieldErrors = errors !== null ? errors[fieldName] || null : null;
            if (fieldErrors !== null) {
                setErrors({
                    ...errors,
                    [fieldName]: null,
                });
            }

            if (!loading && (success !== false || requestError !== false)) {
                setRequestState({
                    success: false,
                    loading: false,
                    error: false,
                });
            }

            setValue({
                ...(value || {}),
                [fieldName]: fieldValue,
            });
        },
        [value, errors, requestState, setErrors, setValue, ...fields],
    );

    const fieldsProps = useMemo(
        () => getFieldsPropsFromFields(fields, { value, errors, onChange: onFieldChange }, locales),
        [value, errors, locales, fields, onFieldChange, ...fields],
    );

    const csrfToken = useMemo(() => getCsrfToken(), []);

    const onSubmitError = (error: Error) => {
        setRequestState({
            success: false,
            loading: false,
            error: true,
        });

        if (error.name === 'ValidationError') {
            const { errors: validationErrors = null } = (
                error as ValidationError
            ).getResponseData();
            setErrors(validationErrors || null);
        } else {
            setGeneralError(error.message);
        }

        if (onError !== null) {
            onError(error);
        }
    };

    const onSubmitSuccess = (resp: unknown) => {
        setRequestState({
            success: true,
            loading: false,
            error: false,
        });
        setResponse(resp);
        if (onComplete !== null) {
            onComplete(resp);
        }
    };

    const finalPostForm = useCallback(
        (postAction: string, postData: Record<string, unknown>) =>
            postForm !== null
                ? postForm(postAction, postData)
                : postJSON(postAction, postData, {
                      credentials: 'include',
                      headers: getCSRFHeaders(),
                  }),
        [postForm],
    );

    const submit = useCallback(
        (submitValue: FieldValue | null = value) => {
            setRequestState({
                success: false,
                loading: true,
                error: false,
            });
            setGeneralError(null);
            setErrors(null);

            finalPostForm(action as string, {
                ...(submitValue || {}),
                _token: csrfToken,
            })
                .then(onSubmitSuccess)
                .catch(onSubmitError);
        },
        [
            value,
            setGeneralError,
            setErrors,
            finalPostForm,
            action,
            csrfToken,
            onSubmitSuccess,
            onSubmitError,
        ],
    );

    const onSubmit = useCallback(
        (e: FormEvent) => {
            if (withoutDefault) {
                e.preventDefault();
            }
            if (withoutPropagation) {
                e.stopPropagation();
            }
            // This one is very important with multiple forms
            // Nested forms (even in portals) will bubble the onSubmit event to the parent
            submit();
        },
        [submit, withoutDefault, withoutPropagation],
    );

    let status: 'loading' | 'success' | 'error' | null = null;
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
