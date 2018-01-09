import PackageGenerator from '../../lib/PackageGenerator';

import {
    listName as listNamePrompt,
} from '../../lib/prompts';

class ListPackageGenerator extends PackageGenerator {
    constructor(...args) {
        super({
            title: 'List',
            packagePrefix: 'list-',
            componentSuffix: '-list',
            packagesPath: './lists',
            packageDescription: 'lists',
            packageDependencies: [

            ],
            namePrompt: listNamePrompt,
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
