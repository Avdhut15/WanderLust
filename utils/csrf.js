const { csrfSync } = require("csrf-sync");

const {
    generateToken,
    csrfSynchronisedProtection,
} = csrfSync({
    getTokenFromRequest: (req) => req.body?._csrf || req.headers["x-csrf-token"],
});

module.exports = { generateToken, csrfProtection: csrfSynchronisedProtection };
