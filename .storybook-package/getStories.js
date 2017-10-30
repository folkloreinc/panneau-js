const path = require('path');
const glob = require('glob');
const fs = require('fs');

const getStories = () => {
    const storyPaths = glob.sync(path.join(process.env.PWD,'./src/__stories__/*.story.jsx'));
    const storyCodes = storyPaths.map((storyPath) => {
        const content = fs.readFileSync(storyPath);
        const storiesPath = path.dirname(storyPath);
        return content.toString()
            .replace(/\'\.\.\//gi, `'${storiesPath}/../`)
            .replace(/\'\.\//gi, `'${storiesPath}/`);
    });
    return {
        code: storyCodes.join('\n'),
        dependencies: storyPaths.map((storyPath) => require.resolve(storyPath)),
    };
};

module.exports = getStories;
