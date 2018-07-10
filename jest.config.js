const path = require('path');
const glob = require('glob');
const fs = require('fs');
const lernaJson = require('./lerna.json');

const packagesIgnorePatterns = lernaJson.packages.map(packagePath => (
    `<rootDir>/${packagePath.replace(/\*/gi, '[^/]+')}/(lib|es|dist)/`
));

const coveragePatterns = lernaJson.packages.reduce((items, packageGlob) => ([
    ...items,
    ...(glob.sync(packageGlob).map(packagePath => (
        `${packagePath}/src/**/*.{js,jsx}`
    ))),
]), []);

const moduleNameMapper = lernaJson.packages.reduce((totalMap, packageGlob) => {
    const packagePaths = glob.sync(packageGlob);
    const packagesMap = packagePaths.reduce((map, packagePath) => {
        const packageJsonPath = path.join(__dirname, packagePath, '/package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return {
            ...map,
            [`${packageJson.name}$`]: `<rootDir>/${packagePath}/src/index.js`,
        };
    }, {});
    return {
        ...totalMap,
        ...packagesMap,
    };
}, {});

module.exports = {
    globals: {
        __DEV__: true,
    },
    setupFiles: [
        '<rootDir>/__tests__/shim.js',
        '<rootDir>/__tests__/setup.js',
    ],
    testPathIgnorePatterns: [
        ...packagesIgnorePatterns,
        '<rootDir>/packages/generator-panneau/lib/',
        '<rootDir>/packages/generator-panneau/src/templates/',
        '<rootDir>/packages/generator-panneau/src/generators/[^/]+/templates',
        '<rootDir>/__tests__/shim.js',
        '<rootDir>/__tests__/setup.js',
        '<rootDir>/__tests__/storyshots.test.js',
    ],
    modulePathIgnorePatterns: [
        ...packagesIgnorePatterns,
    ],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
        'react-sortable-hoc': '<rootDir>/__mocks__/react-sortable-hoc.js',
        jquery: require.resolve('jquery-slim'),
        ...moduleNameMapper,
    },
    transformIgnorePatterns: [
        'node_modules/(?!(@folklore|react-intl)/)',
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        ...coveragePatterns,
        '!**/node_modules/**',
        '!**/vendor/**',
        '!**/templates/**',
        '!**/__tests__/**',
        '!**/__stories__/**',
    ],
};
