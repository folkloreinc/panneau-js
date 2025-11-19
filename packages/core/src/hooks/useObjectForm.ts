import type { Field } from '@panneau/core/types';
import { useMemo } from 'react';

import useBaseForm from './useForm';

interface UseObjectFormOptions {
    fields?: Field[];
    injectInFields?: boolean;
    [key: string]: unknown;
}

const useObjectForm = ({
    fields: providedFields = [],
    injectInFields = false,
    ...opts
}: UseObjectFormOptions = {}) => {
    const fieldsNames = useMemo(
        () => (providedFields.length > 0 ? providedFields.map(({ name }) => name as string) : []),
        [providedFields],
    );
    const { fields, ...form } = useBaseForm({
        fields: fieldsNames,
        ...opts,
    });
    return {
        ...form,
        fields: injectInFields
            ? providedFields.map((it) => ({
                  ...it,
                  ...(fields.find((f) => f.name === it.name) || null),
              }))
            : providedFields,
    };
};

export default useObjectForm;
