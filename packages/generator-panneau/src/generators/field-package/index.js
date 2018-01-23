import PackageGenerator from '../../lib/PackageGenerator';

import {
    fieldName as fieldNamePrompt,
} from '../../lib/prompts';

class FieldPackageGenerator extends PackageGenerator {
    constructor(...args) {
        super({
            title: 'Field',
            packagePrefix: 'field-',
            componentSuffix: '-field',
            packagesPath: './fields',
            packageDescription: 'fields',
            packageDependencies: [
                '@panneau/form-group@^0.3.5',
            ],
            namePrompt: fieldNamePrompt,
        }, ...args);
    }

    get prompting() {
        return {
            ...super.prompting,
        };
    }

    configuring() {
        return super.configuring();
    }

    get writing() {
        return {
            ...super.writing,
        };
    }

    get install() {
        return {
            ...super.install,
        };
    }
}

module.exports = FieldPackageGenerator;
