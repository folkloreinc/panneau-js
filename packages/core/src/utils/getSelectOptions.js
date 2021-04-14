import isObject from 'lodash/isObject';

const getSelectOptions = (options) =>
    options.map((it) =>
        isObject(it)
            ? it
            : {
                  value: it,
                  label: it,
              },
    );

export default getSelectOptions;