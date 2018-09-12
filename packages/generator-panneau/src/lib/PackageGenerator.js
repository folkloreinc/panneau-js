import Generator from 'yeoman-generator';
import chalk from 'chalk';
import merge from 'lodash/merge';
import { join as joinPath } from 'path';
import { pascal as pascalCase } from 'change-case';

const generatorPackageJSON = require('../../package.json');

class PackageGenerator extends Generator {
    constructor(options, ...args) {
        super(...args);

        const {
            namePrompt,
            title,
            packagePrefix,
            componentSuffix,
            packagesPath,
            packageDescription,
            packageDependencies,
        } = options || {};

        this.namePrompt = namePrompt || null;
        this.title = title || '';
        this.packagePrefix = packagePrefix || '';
        this.componentSuffix = componentSuffix || '';
        this.packagesPath = packagesPath || './';
        this.packageDescription = packageDescription || '';
        this.packageDependencies = packageDependencies || null;

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
            defaults: this.packagesPath,
        });

        this.option('version', {
            type: String,
            required: false,
            defaults: generatorPackageJSON.version,
        });
    }

    templatePath(templatePath) {
        const specificPath = super.templatePath(templatePath);
        const generalPath = joinPath(__dirname, '../templates/', templatePath);
        return this.fs.exists(specificPath) ? specificPath : generalPath;
    }

    get prompting() {
        return {
            welcome() {
                if (this.options.quiet) {
                    return;
                }

                console.log(chalk.yellow('\n----------------------'));
                console.log(`PANNEAU${this.title !== '' ? ` ${this.title}` : ''} Generator`);
                console.log(chalk.yellow('----------------------\n'));
            },

            prompts() {
                const prompts = [];

                if (this.namePrompt !== null && !this.options.name) {
                    prompts.push(this.namePrompt);
                }

                if (!prompts.length) {
                    return null;
                }

                return this.prompt(prompts).then((answers) => {
                    if (this.namePrompt !== null && answers.name) {
                        this.options.name = answers.name;
                    }
                });
            },
        };
    }

    configuring() {
        this.options.prettyName = this.options['pretty-name'] || pascalCase(this.options.name);
        this.options.componentName = this.options['component-name']
            || pascalCase(`${this.options.name}${this.componentSuffix}`);
    }

    get writing() {
        return {
            packageJSON() {
                const { name, prettyName, version } = this.options;

                const rootPath = this.options.path;
                const srcPath = this.templatePath('_package.json');
                const destPath = this.destinationPath(`${rootPath}/${name}/package.json`);

                const templatePackage = this.fs.readJSON(srcPath);
                const currentPackage = this.fs.exists(destPath) ? this.fs.readJSON(destPath) : {};
                const newPackage = {};
                newPackage.name = `@panneau/${this.packagePrefix}${name}`;
                newPackage.version = version;
                newPackage.description = `${prettyName}${
                    this.packageDescription !== '' ? ` ${this.packageDescription}` : ''
                } for Panneau`;
                newPackage.homepage = `https://github.com/Folkloreatelier/panneau-js/tree/master/${joinPath(
                    rootPath,
                    name,
                ).replace(/^\.?\//, '')}`;
                newPackage.dependencies = {
                    ...(templatePackage.dependencies || null),
                };
                this.packageDependencies.forEach((dependency) => {
                    const dependencyMatches = dependency.match(/^(.+?)@([\^~]?[0-9.v\-a-z]+)$/);
                    newPackage.dependencies = {
                        ...newPackage.dependencies,
                        [dependencyMatches[1]]: dependencyMatches[2],
                    };
                });
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
                const { path, name, componentName } = this.options;

                const srcPath = this.templatePath('webpack.js');
                const destPath = this.destinationPath(`${path}/${name}/webpack.config.js`);

                this.fs.copyTpl(srcPath, destPath, {
                    name,
                    componentName,
                });
            },

            index() {
                const { path, name, componentName } = this.options;

                const srcPath = this.templatePath('index.js');
                const destPath = this.destinationPath(`${path}/${name}/src/index.js`);

                this.fs.copyTpl(srcPath, destPath, {
                    componentName,
                });
            },

            component() {
                const { path, name, componentName } = this.options;

                const srcPath = this.templatePath('Component.jsx');
                const destPath = this.destinationPath(`${path}/${name}/src/${componentName}.jsx`);

                this.fs.copyTpl(srcPath, destPath, {
                    name,
                    componentName,
                });
            },

            story() {
                const {
                    path, name, componentName, prettyName,
                } = this.options;

                const srcPath = this.templatePath('Story.story.jsx');
                const destPath = this.destinationPath(
                    `${path}/${name}/src/__stories__/${componentName}.story.jsx`,
                );

                this.fs.copyTpl(srcPath, destPath, {
                    name,
                    componentName,
                    prettyName,
                });
            },

            test() {
                const {
                    path, name, componentName, prettyName,
                } = this.options;

                const srcPath = this.templatePath('Test.test.jsx');
                const destPath = this.destinationPath(
                    `${path}/${name}/src/__tests__/${componentName}.test.jsx`,
                );

                this.fs.copyTpl(srcPath, destPath, {
                    name,
                    componentName,
                    prettyName,
                });
            },

            styles() {
                const { path, name, componentName } = this.options;

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
            lerna() {
                if (this.options['skip-install']) {
                    return;
                }

                const { name } = this.options;

                const done = this.async();
                this.spawnCommand('lerna', [
                    'bootstrap',
                    '--scope',
                    `@panneau/${this.packagePrefix}${name}`,
                ]).on('close', done);
            },
        };
    }
}

module.exports = PackageGenerator;
