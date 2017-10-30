import Generator from 'yeoman-generator';
import chalk from 'chalk';
import merge from 'lodash/merge';
import { pascal as pascalCase } from 'change-case';
import {
    fieldName as fieldNamePrompt,
} from '../../lib/prompts';

const generatorPackageJSON = require('../../../package.json');

class FieldPackageGenerator extends Generator {
    constructor(...args) {
        super(...args);

        this.argument('name', {
            type: String,
            required: false,
        });

        this.option('pretty-name', {
            type: String,
            required: false,
        });

        this.option('component-name', {
            type: String,
            required: false,
        });

        this.option('path', {
            type: String,
            required: false,
            defaults: './fields',
        });

        this.option('version', {
            type: String,
            required: false,
            defaults: generatorPackageJSON.version,
        });
    }

    get prompting() {
        return {
            welcome() {
                if (this.options.quiet) {
                    return;
                }

                console.log(chalk.yellow('\n----------------------'));
                console.log('PANNEAU Field Generator');
                console.log(chalk.yellow('----------------------\n'));
            },

            prompts() {
                const prompts = [];

                if (!this.options.name) {
                    prompts.push(fieldNamePrompt);
                }

                if (!prompts.length) {
                    return null;
                }

                return this.prompt(prompts)
                    .then((answers) => {
                        if (answers.name) {
                            this.options.name = answers.name;
                        }
                    });
            },
        };
    }

    configuring() {
        this.options.prettyName = this.options['pretty-name'] || pascalCase(this.options.name);
        this.options.componentName = this.options['component-name'] || pascalCase(`${this.options.name}-field`);
    }

    get writing() {
        return {
            packageJSON() {
                const {
                    path,
                    name,
                    prettyName,
                    version,
                } = this.options;

                const srcPath = this.templatePath('_package.json');
                const destPath = this.destinationPath(`${path}/${name}/package.json`);

                const templatePackage = this.fs.readJSON(srcPath);
                const currentPackage = this.fs.exists(destPath) ?
                    this.fs.readJSON(destPath) : {};
                const newPackage = {};
                newPackage.name = `@panneau/field-${name}`;
                newPackage.version = version;
                newPackage.description = `${prettyName} field for Panneau`;
                newPackage.homepage = `https://github.com/Folkloreatelier/react-panneau/tree/master/fields/${name}`;
                this.fs.writeJSON(destPath, merge(templatePackage, currentPackage, newPackage));
            },

            files() {
                const { path, name } = this.options;

                this.fs.copy(
                    this.templatePath('gitignore'),
                    this.destinationPath(`${path}/${name}/.gitignore`),
                );

                this.fs.copy(
                    this.templatePath('babelrc'),
                    this.destinationPath(`${path}/${name}/.babelrc`),
                );

                this.fs.copy(
                    this.templatePath('npmrc'),
                    this.destinationPath(`${path}/${name}/.npmrc`),
                );
            },

            webpack() {
                const {
                    path,
                    name,
                    componentName,
                } = this.options;

                const srcPath = this.templatePath('webpack.js');
                const destPath = this.destinationPath(`${path}/${name}/webpack.config.js`);

                this.fs.copyTpl(srcPath, destPath, {
                    name,
                    componentName,
                });
            },

            index() {
                const {
                    path,
                    name,
                    componentName,
                } = this.options;

                const srcPath = this.templatePath('index.js');
                const destPath = this.destinationPath(`${path}/${name}/src/index.js`);

                this.fs.copyTpl(srcPath, destPath, {
                    componentName,
                });
            },

            fieldComponent() {
                const {
                    path,
                    name,
                    componentName,
                } = this.options;

                const srcPath = this.templatePath('Field.jsx');
                const destPath = this.destinationPath(`${path}/${name}/src/${componentName}.jsx`);

                this.fs.copyTpl(srcPath, destPath, {
                    name,
                    componentName,
                });
            },

            fieldStory() {
                const {
                    path,
                    name,
                    componentName,
                    prettyName,
                } = this.options;

                const srcPath = this.templatePath('Field.story.jsx');
                const destPath = this.destinationPath(`${path}/${name}/src/__stories__/${componentName}.story.jsx`);

                this.fs.copyTpl(srcPath, destPath, {
                    name,
                    componentName,
                    prettyName,
                });
            },

            fieldTest() {
                const {
                    path,
                    name,
                    componentName,
                    prettyName,
                } = this.options;

                const srcPath = this.templatePath('Field.test.jsx');
                const destPath = this.destinationPath(`${path}/${name}/src/__tests__/${componentName}.test.jsx`);

                this.fs.copyTpl(srcPath, destPath, {
                    name,
                    componentName,
                    prettyName,
                });
            },
        };
    }
}

module.exports = FieldPackageGenerator;
