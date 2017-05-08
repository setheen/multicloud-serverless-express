const os = require("os");

module.exports.getUserHome = () =>
{
    return os.homedir();
};