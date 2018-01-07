import path from 'path';

export const name = {
    type: 'input',
    name: 'name',
    message: 'What is the name of the project?',
    default: () => {
        const parts = process.cwd().split(path.sep);
        return parts[parts.length - 1];
    },
};

export const fieldName = {
    type: 'input',
    name: 'name',
    message: 'What is the name of the field?',
};

export const modalName = {
    type: 'input',
    name: 'name',
    message: 'What is the name of the modal?',
};

export const layoutName = {
    type: 'input',
    name: 'name',
    message: 'What is the name of the layout?',
};

export const generators = {
    type: 'list',
    name: 'type',
    message: 'What generator?',
    choices: [
        {
            name: 'Layout package',
            value: 'layout-package',
        },
        {
            name: 'Field package',
            value: 'field-package',
        },
        {
            name: 'Modal package',
            value: 'modal-package',
        },
    ],
};
