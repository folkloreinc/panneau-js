import isObject from 'lodash-es/isObject';

const getComponent = (component) => {
    const { component: name, ...props } = isObject(component)
        ? component
        : {
              component,
          };
    return {
        name: component,
        props,
    };
};

export default getComponent;
