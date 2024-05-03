#! /usr/bin/env node
const fsExtra = require('fs-extra');
const { program } = require('commander');
const path = require('path');
const { sync: globSync } = require('glob');
const { extractAndWrite, compileAndWrite } = require('@formatjs/cli-lib');
const POFile = require('./lib/POFile');

const { supportedLocales } = fsExtra.readJSONSync(path.join(process.cwd(), './package.json'));

let srcPath;
program
    .arguments('<src>')
    .option('-l, --lang-path <path>', 'Destination of the lang files', './lang')
    .option('-d, --dest-path <path>', 'Destination of the files', './locale')
    .option(
        '--id-interpolation-pattern <pattern>',
        'ID interpolation pattern',
        '[sha512:contenthash:base64:6]',
    )
    .option('--default-locale <locale>', 'Default locale', 'en')
    .option('--ast', 'With ast')
    .action((src) => {
        srcPath = src;
    });

program.parse(process.argv);

async function build({ langPath, destPath, idInterpolationPattern, defaultLocale, ast }) {
    const files = globSync(srcPath, {
        nodir: true,
        cwd: process.cwd(),
    });

    const messagesPath = path.join(process.cwd(), langPath, 'messages.json');

    await extractAndWrite(files, {
        throws: false,
        // format: 'crowdin',
        idInterpolationPattern,
        // extractSourceLocation: true,
        outFile: messagesPath,
        additionalComponentNames: ['ResourceMessage'],
    });

    supportedLocales.forEach(async (locale) => {
        const messages = fsExtra.readJsonSync(messagesPath);
        const poPath = path.join(process.cwd(), langPath, `${locale}.po`);
        const jsonPath = path.join(process.cwd(), langPath, `${locale}.json`);
        const poFile = new POFile(poPath, {
            useDefaultMessage: locale === defaultLocale,
        });
        poFile.update(messages);
        poFile.save();

        fsExtra.outputJsonSync(jsonPath, poFile.toJSON(), {
            spaces: 4,
        });

        await compileAndWrite([jsonPath], {
            ast,
            throws: true,
            idInterpolationPattern,
            outFile: path.join(process.cwd(), destPath, `${locale}.json`),
        });
    });
}

build(program.opts());
