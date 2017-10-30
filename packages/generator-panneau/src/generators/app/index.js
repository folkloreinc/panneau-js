import Generator from 'yeoman-generator';
import chalk from 'chalk';
import {
    name as namePrompt,
    generators as generatorsPrompt,
} from '../../lib/prompts';

class AppGenerator extends Generator {
    constructor(...args) {
        super(...args);

        this.argument('name', {
            type: String,
            required: false,
        });

        this.argument('type', {
            type: String,
            required: false,
        });
    }

    get prompting() {
        return {
            welcome() {
                if (this.options.quiet) {
                    return;
                }

                console.log(chalk.yellow('\n----------------------'));
                console.log('PANNEAU Generator');
                console.log(chalk.yellow('----------------------\n'));
            },

            prompts() {
                const prompts = [];

                if (!this.options.name) {
                    prompts.push(namePrompt);
                }

                if (!this.options.type) {
                    prompts.push(generatorsPrompt);
                }

                if (!prompts.length) {
                    return null;
                }

                return this.prompt(prompts)
                    .then((answers) => {
                        if (answers.type) {
                            this.options.type = answers.type;
                        }

                        if (answers.name) {
                            this.options.name = answers.name;
                        }
                    });
            },
        };
    }

    configuring() {
        const composeWith = `panneau:${this.options.type}`;
        this.composeWith(composeWith, {
            ...this.options,
        });
    }
}

module.exports = AppGenerator;
