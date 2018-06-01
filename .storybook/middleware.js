const path = require('path');
const express = require('express');
const readFileSync = require('fs').readFileSync;
const globSync = require('glob').sync;

module.exports = (router) => {
    const apiPath = path.join(__dirname, '/api');

    const files = globSync(path.join(apiPath, '*/*.json')).map(filePath => path.relative(apiPath, filePath));
    const filesPerResources = files.reduce((filesMap, file) => {
        const id = file.match(/^([^/]+)/i)[1];
        return {
            ...filesMap,
            [id]: [
                ...(filesMap[id] || []),
                path.join(apiPath, file),
            ],
        };
    }, {});
    Object.keys(filesPerResources).forEach((id) => {
        const data = filesPerResources[id].map(filePath => require(filePath));
        router.get(`/api/${id}`, (req, res) => {
            res.json(data);
            res.end();
        });
    })

    router.use('/api/', express.static(apiPath,{
        index: false,
        extensions: ['json'],
    }));
};
