import { pascalCase } from 'change-case';

const getComponentFromName = (name = null, components, defaultComponent = null) => {
    if (components === null || name === null) {
        return defaultComponent;
    }
    const pascalName = pascalCase(name);
    return components[pascalName] || components[name] || defaultComponent;
};

export default getComponentFromName;
