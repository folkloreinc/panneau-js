const org1 = require('./organisations/1.json');
const org2 = require('./organisations/2.json');

module.exports = {
    id: '1',
    name: 'Test user',
    email: 'example@example.com',
    organisations: [org1, org2],
};
