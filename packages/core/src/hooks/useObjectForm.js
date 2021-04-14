import { useMemo } from 'react';
import useBaseForm from './useForm';

const useObjectForm = ({ fields: providedFields = [], injectInFields = false, ...opts } = {}) => {
    const fieldsNames = useMemo(
        () => (providedFields.length > 0 ? providedFields.map(({ name }) => name) : []),
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
                  ...(fields[it.name] || null),
              }))
            : providedFields,
    };
};

export default useObjectForm;
