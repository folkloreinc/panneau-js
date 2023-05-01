import { pascalCase } from 'change-case';

const getComponentFromName = (name = null, components = {}, defaultComponent = null) => {
    if (components === null || name === null) {
        return defaultComponent;
    }
    const pascalName = pascalCase(name);
    // console.log(name, pascalName, components);
    const component = components[pascalName] || components[name] || defaultComponent;
    if (!component) {
        console.warn('Could not find component from name', name, pascalName, components);
    }
    return component;
};

export default getComponentFromName;
