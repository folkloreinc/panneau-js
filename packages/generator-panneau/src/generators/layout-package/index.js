import PackageGenerator from '../../lib/PackageGenerator';

import {
    layoutName as layoutNamePrompt,
} from '../../lib/prompts';

class LayoutPackageGenerator extends PackageGenerator {
    constructor(...args) {
        super({
            title: 'Layout',
            packagePrefix: 'layout-',
            componentSuffix: '-layout',
            packagesPath: './layouts',
            packageDescription: 'layouts',
            packageDependencies: [
                '@panneau/layout@^0.3.7',
                'react-redux@^5.0.6',
                'react-router@^3.2',
                'react-router-redux@^4.0.8',
            ],
            namePrompt: layoutNamePrompt,
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
            styles: () => {
                const {
                    path,
                    name,
                    componentName,
                } = this.options;

                const srcPath = this.templatePath('styles.scss');
                const destPath = this.destinationPath(`${path}/${name}/src/styles.scss`);

                this.fs.copyTpl(srcPath, destPath, {
                    name,
                    componentName,
                });
            },
        };
    }

    get install() {
        return {
            ...super.install,
        };
    }
}

module.exports = LayoutPackageGenerator;
