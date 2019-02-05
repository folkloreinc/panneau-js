import PackageGenerator from '../../lib/PackageGenerator';

import {
    modalName as modalNamePrompt,
} from '../../lib/prompts';

class PreviewPackageGenerator extends PackageGenerator {
    constructor(...args) {
        super({
            title: 'Preview',
            packagePrefix: 'preview-',
            componentSuffix: '-preview',
            packagesPath: './previews',
            packageDescription: 'previews',
            namePrompt: modalNamePrompt,
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

module.exports = PreviewPackageGenerator;
