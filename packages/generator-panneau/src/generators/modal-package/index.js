import PackageGenerator from '../../lib/PackageGenerator';

import {
    modalName as modalNamePrompt,
} from '../../lib/prompts';

class ModalPackageGenerator extends PackageGenerator {
    constructor(...args) {
        super({
            title: 'Modal',
            packagePrefix: 'modal-',
            componentSuffix: '-modal',
            packagesPath: './modals',
            packageDescription: 'modals',
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

module.exports = ModalPackageGenerator;
