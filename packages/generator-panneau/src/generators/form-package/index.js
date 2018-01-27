import PackageGenerator from '../../lib/PackageGenerator';

import {
    formName as formNamePrompt,
} from '../../lib/prompts';

class ListPackageGenerator extends PackageGenerator {
    constructor(...args) {
        super({
            title: 'Form',
            packagePrefix: 'form-',
            componentSuffix: '-form',
            packagesPath: './forms',
            packageDescription: 'forms',
            packageDependencies: [
                '@panneau/form@^0.3.7',
                '@panneau/fields-group@^0.3.7',
            ],
            namePrompt: formNamePrompt,
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

module.exports = ListPackageGenerator;
