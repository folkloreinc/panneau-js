import isString from 'lodash/isString';
import { ElementType } from 'react';

interface ComponentResult {
    name: string | ElementType | null;
    props: Record<string, unknown> | null;
}

function getComponent(
    component: string | { component: string | ElementType; [key: string]: unknown },
): ComponentResult {
    const { component: name = null, ...props } = isString(component)
        ? {
              component,
          }
        : component || {};
    return {
        name,
        props: Object.keys(props).length > 0 ? props : null,
    };
}

export default getComponent;
