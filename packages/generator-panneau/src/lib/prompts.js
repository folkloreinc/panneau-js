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

export const generators = {
    type: 'list',
    name: 'type',
    message: 'What generator?',
    choices: [
        {
            name: 'Field package',
            value: 'field-package',
        },
    ],
};
