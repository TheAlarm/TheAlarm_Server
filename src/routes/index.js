var express = require('express');
var router = express.Router();

module.exports = function () {
const app = express();

require('./promiseRoute')(app);

return app;
}
