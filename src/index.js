const { extractEmails, isValidEmail, getValidEmails, uniqueValidEmails } = require('./email');
const { registerUser, login } = require('./auth');
const { createServer, startServer } = require('./server');

module.exports = {
    extractEmails,
    isValidEmail,
    getValidEmails,
    uniqueValidEmails,
    registerUser,
    login,
    createServer,
    startServer,
};
