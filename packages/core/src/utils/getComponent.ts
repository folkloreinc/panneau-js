import isObject from 'lodash/isObject';

interface ComponentResult {
    name: unknown;
    props: Record<string, unknown> | null;
}

function getComponent(component: unknown): ComponentResult {
    const { component: name, ...props } = isObject(component)
        ? (component as Record<string, unknown>)
        : {
              component,
          };
    return {
        name: component,
        props: Object.keys(props).length > 0 ? props : null,
    };
}

export default getComponent;
